const Availability = require('../models/Availability');
const Session = require('../models/Session');
const Therapist = require('../models/Therapist');
const domainEvents = require('../services/domainEvents');

const getDaySlots = (availability, date) => {
  const dateKey = date.toISOString().slice(0, 10);
  const override = availability.overrides?.find((item) => item.date === dateKey);
  if (override) return override.isBlocked ? [] : override.slots || [];
  return availability.weeklySchedule?.find((item) => item.dayOfWeek === date.getDay())?.slots || [];
};

const getAvailableSlots = async (therapistId, dateKey) => {
  const availability = await Availability.findOne({ therapistId });
  if (!availability) return [];
  const date = new Date(`${dateKey}T00:00:00`);
  if (Number.isNaN(date.getTime())) return [];
  const booked = await Session.find({ therapistId, status: 'Scheduled', startTime: { $gte: date, $lt: new Date(date.getTime() + 86400000) } }).select('startTime endTime');
  const slots = [];
  const duration = availability.sessionDuration;
  const buffer = availability.bufferTime;
  for (const window of getDaySlots(availability, date)) {
    let cursor = new Date(`${dateKey}T${window.startTime}:00`);
    const windowEnd = new Date(`${dateKey}T${window.endTime}:00`);
    while (cursor.getTime() + duration * 60000 <= windowEnd.getTime()) {
      const end = new Date(cursor.getTime() + duration * 60000);
      const overlaps = booked.some((session) => cursor < session.endTime && end > session.startTime);
      if (!overlaps && cursor > new Date()) slots.push({ startTime: cursor.toISOString(), endTime: end.toISOString() });
      cursor = new Date(end.getTime() + buffer * 60000);
    }
  }
  return slots;
};

// 1. Therapist sets their weekly availability
exports.setAvailability = async (req, res) => {
  try {
    const { weeklySchedule, overrides, sessionDuration, bufferTime } = req.body;
    // Fixed req.therapist to req.user to match authMiddleware
    let availability = await Availability.findOne({ therapistId: req.user.id });
    
    if (availability) {
      availability.weeklySchedule = weeklySchedule || availability.weeklySchedule;
      availability.overrides = overrides || availability.overrides;
      availability.sessionDuration = sessionDuration || availability.sessionDuration;
      availability.bufferTime = bufferTime || availability.bufferTime;
    } else {
      availability = new Availability({ 
        therapistId: req.user.id, 
        weeklySchedule, 
        overrides, 
        sessionDuration, 
        bufferTime 
      });
    }
    
    await availability.save();
    res.status(200).json(availability);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// 2. Client gets the therapist's availability
exports.getAvailability = async (req, res) => {
  try {
    const { therapistId } = req.params;
    const availability = await Availability.findOne({ therapistId });
    
    if (!availability) {
      return res.status(404).json({ message: 'Availability not set by therapist yet.' });
    }
    
    const date = req.query.date;
    res.status(200).json({ ...availability.toObject(), slots: date ? await getAvailableSlots(therapistId, date) : [] });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// 3. Client books a session
exports.bookSession = async (req, res) => {
  try {
    const { therapistId, clientName, clientEmail, startTime, endTime, type, isWaitlist } = req.body;
    if (!therapistId || !clientName?.trim() || !clientEmail?.trim() || !startTime || !endTime) {
      return res.status(400).json({ message: 'Therapist, name, email, start time, and end time are required.' });
    }
    if (new Date(startTime) <= new Date() || new Date(endTime) <= new Date(startTime)) {
      return res.status(400).json({ message: 'Please choose a future time slot.' });
    }
    
    // Double-booking prevention
    const existing = await Session.findOne({
      therapistId,
      status: { $in: ['Scheduled', 'Waitlist'] },
      $or: [
        { startTime: { $lt: endTime, $gte: startTime } },
        { endTime: { $gt: startTime, $lte: endTime } }
      ]
    });

    if (existing && !isWaitlist) {
      return res.status(400).json({ message: 'Slot already booked. Would you like to join the waitlist?' });
    }

    if (!isWaitlist) {
      const dateKey = new Date(startTime).toISOString().slice(0, 10);
      const validSlot = (await getAvailableSlots(therapistId, dateKey)).some((slot) => slot.startTime === new Date(startTime).toISOString() && slot.endTime === new Date(endTime).toISOString());
      if (!validSlot) return res.status(400).json({ message: 'That slot is no longer available.' });
    }

    const session = new Session({
      therapistId, clientName, clientEmail, startTime, endTime, type, 
      status: isWaitlist ? 'Waitlist' : 'Scheduled'
    });

    await session.save();

    if (!isWaitlist) {
      const therapist = await Therapist.findById(therapistId).select('name');
      domainEvents.emit('booking.confirmed', { session, therapistName: therapist?.name || 'your therapist' });
    }
    
    if (!isWaitlist) {
      console.log(`[STUB] Notification sent to ${clientEmail} for booking confirmation.`);
    } else {
      console.log(`[STUB] ${clientEmail} added to waitlist. Will auto-notify if slot frees.`);
    }

    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

exports.completeSession = async (req, res) => {
  try {
    const session = await Session.findOneAndUpdate(
      { _id: req.params.id, therapistId: req.user.id, status: 'Scheduled' },
      { status: 'Completed' },
      { new: true }
    );
    if (!session) return res.status(404).json({ message: 'Scheduled session not found' });
    const therapist = await Therapist.findById(req.user.id).select('name');
    domainEvents.emit('session.completed', { session, therapistName: therapist?.name || 'your therapist' });
    res.json(session);
  } catch (error) {
    res.status(500).json({ message: 'Could not complete session', error: error.message });
  }
};

exports.updateSessionStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Completed', 'Cancelled', 'NoShow'].includes(status)) {
      return res.status(400).json({ message: 'Invalid session status' });
    }
    const session = await Session.findOneAndUpdate(
      { _id: req.params.id, therapistId: req.user.id },
      { status },
      { new: true }
    );
    if (!session) return res.status(404).json({ message: 'Session not found' });
    if (status === 'Completed') {
      const therapist = await Therapist.findById(req.user.id).select('name');
      domainEvents.emit('session.completed', { session, therapistName: therapist?.name || 'your therapist' });
    }
    res.json(session);
  } catch (error) {
    res.status(500).json({ message: 'Could not update session status', error: error.message });
  }
};

exports.getTherapistAppointments = async (req, res) => {
  try {
    const filter = { therapistId: req.user.id };
    if (req.query.from || req.query.to) filter.startTime = { ...(req.query.from ? { $gte: new Date(req.query.from) } : {}), ...(req.query.to ? { $lte: new Date(req.query.to) } : {}) };
    const sessions = await Session.find(filter).sort({ startTime: 1 });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: 'Could not load appointments', error: error.message });
  }
};

exports.getOwnAvailability = async (req, res) => {
  const availability = await Availability.findOne({ therapistId: req.user.id });
  if (!availability) return res.status(404).json({ message: 'Availability not set yet.' });
  res.json(availability);
};
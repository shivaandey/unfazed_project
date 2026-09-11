const Availability = require('../models/Availability');
const Session = require('../models/Session');

// Therapist sets their weekly availability
exports.setAvailability = async (req, res) => {
  try {
    const { dayOfWeek, slots, sessionDuration, bufferTime } = req.body;
    
    let availability = await Availability.findOne({ therapistId: req.therapist.id, dayOfWeek });
    if (availability) {
      availability.slots = slots;
      availability.sessionDuration = sessionDuration;
      availability.bufferTime = bufferTime;
    } else {
      availability = new Availability({
        therapistId: req.therapist.id,
        dayOfWeek,
        slots,
        sessionDuration,
        bufferTime
      });
    }
    
    await availability.save();
    res.status(200).json({ message: 'Availability updated successfully', availability });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Client views available slots (Simplified for Module 2)
exports.getAvailability = async (req, res) => {
  try {
    const { therapistId } = req.params;
    const availability = await Availability.find({ therapistId });
    res.status(200).json(availability);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Client books a session
exports.bookSession = async (req, res) => {
  try {
    const { therapistId, clientName, clientEmail, startTime, endTime, type } = req.body;

    // Double-booking prevention logic
    const existingSession = await Session.findOne({
      therapistId,
      $or: [
        { startTime: { $lt: endTime, $gte: startTime } },
        { endTime: { $gt: startTime, $lte: endTime } }
      ],
      status: 'Scheduled'
    });

    if (existingSession) {
      return res.status(400).json({ message: 'This slot is already booked.' });
    }

    const session = new Session({
      therapistId,
      clientName,
      clientEmail,
      startTime,
      endTime,
      type
    });

    await session.save();
    res.status(201).json({ message: 'Session booked successfully', session });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
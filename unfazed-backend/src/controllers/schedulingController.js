const Availability = require('../models/Availability');
const Session = require('../models/Session');

// 1. Therapist sets their weekly availability
exports.setAvailability = async (req, res) => {
  try {
    const { weeklySchedule, overrides, sessionDuration, bufferTime } = req.body;
    let availability = await Availability.findOne({ therapistId: req.therapist.id });
    
    if (availability) {
      availability.weeklySchedule = weeklySchedule || availability.weeklySchedule;
      availability.overrides = overrides || availability.overrides;
      availability.sessionDuration = sessionDuration || availability.sessionDuration;
      availability.bufferTime = bufferTime || availability.bufferTime;
    } else {
      availability = new Availability({ 
        therapistId: req.therapist.id, 
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

// 2. Client gets the therapist's availability (This was the missing function!)
exports.getAvailability = async (req, res) => {
  try {
    const { therapistId } = req.params;
    const availability = await Availability.findOne({ therapistId });
    
    if (!availability) {
      return res.status(404).json({ message: 'Availability not set by therapist yet.' });
    }
    
    res.status(200).json(availability);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// 3. Client books a session
exports.bookSession = async (req, res) => {
  try {
    const { therapistId, clientName, clientEmail, startTime, endTime, type, isWaitlist } = req.body;
    
    // Double-booking prevention
    const existing = await Session.findOne({
      therapistId,
      status: 'Scheduled',
      $or: [
        { startTime: { $lt: endTime, $gte: startTime } },
        { endTime: { $gt: startTime, $lte: endTime } }
      ]
    });

    if (existing && !isWaitlist) {
      return res.status(400).json({ message: 'Slot already booked. Would you like to join the waitlist?' });
    }

    const session = new Session({
      therapistId, clientName, clientEmail, startTime, endTime, type, 
      status: isWaitlist ? 'Waitlist' : 'Scheduled'
    });

    await session.save();
    
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
const SessionNote = require('../models/SessionNote');

// Get all notes for a specific client
exports.getClientNotes = async (req, res) => {
  try {
    const notes = await SessionNote.find({ 
      therapistId: req.user.id, 
      clientId: req.params.clientId 
    }).sort({ createdAt: -1 });
    res.status(200).json(notes);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Create or update a draft note
exports.saveNote = async (req, res) => {
  try {
    const { clientId, sessionId, soap, isLocked } = req.body;
    let note;

    if (req.params.noteId) {
      note = await SessionNote.findOne({ _id: req.params.noteId, therapistId: req.user.id });
      if (!note) return res.status(404).json({ message: 'Note not found' });
      if (note.isLocked) return res.status(403).json({ message: 'Cannot edit a locked note.' });
      
      note.soap = soap;
    } else {
      note = new SessionNote({ therapistId: req.user.id, clientId, sessionId, soap });
    }

    if (isLocked) {
      note.isLocked = true;
      note.lockedAt = new Date();
    }

    await note.save();
    res.status(200).json(note);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
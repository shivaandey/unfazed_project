const SessionNote = require('../models/SessionNote');
const Client = require('../models/Client');

const serializeSharedNote = (note) => ({
  id: note._id,
  clientId: note.clientId,
  sessionId: note.sessionId,
  templateType: note.templateType,
  content: note.content,
  soap: note.soap,
  dap: note.dap,
  createdAt: note.createdAt,
  updatedAt: note.updatedAt
});

exports.getClientNotes = async (req, res) => {
  try {
    const notes = await SessionNote.find({
      therapistId: req.user.id,
      clientId: req.params.clientId,
      type: 'shared'
    }).sort({ createdAt: -1 });

    res.status(200).json(notes.map(serializeSharedNote));
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

exports.getTherapistNotes = async (req, res) => {
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

exports.saveNote = async (req, res) => {
  try {
    const {
      clientId,
      sessionId,
      soap,
      dap,
      content,
      isLocked,
      type = 'private',
      templateType = 'soap'
    } = req.body;

    if (!['private', 'shared'].includes(type)) {
      return res.status(400).json({ message: 'Note type must be private or shared.' });
    }

    if (!['soap', 'dap', 'freeform'].includes(templateType)) {
      return res.status(400).json({ message: 'Unsupported note template.' });
    }

    let note;

    if (req.params.noteId) {
      note = await SessionNote.findOne({ _id: req.params.noteId, therapistId: req.user.id });
      if (!note) return res.status(404).json({ message: 'Note not found' });
      if (note.isLocked) return res.status(403).json({ message: 'Cannot edit a locked note.' });

      if (clientId && String(note.clientId) !== String(clientId)) {
        return res.status(400).json({ message: 'A note cannot be moved to another client.' });
      }

      note.soap = soap ?? note.soap;
      note.dap = dap ?? note.dap;
      note.content = content ?? note.content;
      note.type = type;
      note.templateType = templateType;
    } else {
      const client = await Client.findOne({ _id: clientId, therapistId: req.user.id }).select('_id');
      if (!client) return res.status(404).json({ message: 'Client not found' });

      note = new SessionNote({
        therapistId: req.user.id,
        clientId,
        sessionId,
        soap,
        dap,
        content,
        type,
        templateType
      });
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

exports.getPublicSharedNotes = async (req, res) => {
  try {
    const notes = await SessionNote.find({
      clientId: req.params.clientId,
      type: 'shared'
    }).select('clientId sessionId templateType content soap dap createdAt updatedAt').sort({ createdAt: -1 });

    res.status(200).json(notes.map(serializeSharedNote));
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
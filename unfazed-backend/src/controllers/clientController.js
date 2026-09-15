const Client = require('../models/Client');
const Session = require('../models/Session');
const { canAccess } = require('../services/entitlementService');

// Get all clients for a therapist
exports.getClients = async (req, res) => {
  try {
    const clients = await Client.find({ therapistId: req.user.id }).sort({ updatedAt: -1 });
    res.status(200).json(clients);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Get a single client's profile & session history
exports.getClientById = async (req, res) => {
  try {
    const client = await Client.findOne({ _id: req.params.id, therapistId: req.user.id });
    if (!client) return res.status(404).json({ message: 'Client not found' });
    
    // Aggregate session history
    const sessions = await Session.find({ clientEmail: client.email }).sort({ startTime: -1 });
    
    res.status(200).json({ client, sessions });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Update Intake & Capture Consent
exports.updateIntake = async (req, res) => {
  try {
    const { intake } = req.body;
    
    // Generate an auditable timestamp if consent is newly checked
    if (intake && intake.consentGiven && !intake.consentTimestamp) {
      intake.consentTimestamp = new Date();
    }
    
    const client = await Client.findOneAndUpdate(
      { _id: req.params.id, therapistId: req.user.id },
      { intake },
      { new: true }
    );
    
    res.status(200).json(client);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

exports.createClient = async (req, res) => {
  try {
    const activeClientCount = await Client.countDocuments({ therapistId: req.user.id, status: 'Active' });
    if (!await canAccess(req.user.id, 'active-client-cap', { activeClientCount })) {
      return res.status(403).json({ message: 'Active client limit reached for your plan.', featureKey: 'active-client-cap', upgradeRequired: true });
    }
    const { name, email, phone, tags } = req.body;
    if (!name || !email) return res.status(400).json({ message: 'Name and email are required' });
    const client = await Client.create({ therapistId: req.user.id, name, email: email.toLowerCase(), phone, tags });
    res.status(201).json(client);
  } catch (error) {
    res.status(500).json({ message: 'Could not create client', error: error.message });
  }
};
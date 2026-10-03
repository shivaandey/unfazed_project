const nodemailer = require('nodemailer');
const Notification = require('../models/Notification');
const domainEvents = require('./domainEvents');

const createTransporter = () => {
  const user = process.env.EMAIL_USER?.trim();
  const pass = process.env.EMAIL_PASS;
  if (!user || !pass) return null;

  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });
};

const sendTransactionalEmail = async ({ to, subject, text }) => {
  const transporter = createTransporter();
  if (!transporter || !to) return false;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      text,
    });
    return true;
  } catch (error) {
    console.error('Transactional email failed:', error.message);
    return false;
  }
};

const queue = [];

exports.notify = async ({
  to,
  subject,
  text,
  type = 'email',
  eventType = 'generic',
  recipientType = 'client',
  recipientId,
}) => {
  const normalizedTo = typeof to === 'string' ? to.trim() : '';
  const event = { to: normalizedTo, subject, text, type, eventType, createdAt: new Date() };
  queue.push(event);

  if (recipientId) {
    await Notification.create({
      recipientType,
      recipientId: String(recipientId),
      eventType,
      title: subject,
      message: text,
      channels: ['in_app', type],
    });
  }

  if (type === 'whatsapp') {
    console.log(`[WHATSAPP] ${eventType}: ${normalizedTo || 'unknown'} -> ${text}`);
    return event;
  }

  if (type === 'email' && normalizedTo) {
    const transporter = createTransporter();
    if (!transporter) {
      console.log(`[EMAIL QUEUED] ${eventType}: ${normalizedTo} -> ${text}`);
      return event;
    }
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: normalizedTo,
        subject,
        text,
      });
    } catch (error) {
      console.error('Notification send failed:', error.message);
    }
  } else if (type === 'email') {
    console.log(`[EMAIL QUEUED] ${eventType}: ${normalizedTo || 'unknown'} -> ${text}`);
  }

  return event;
};

exports.getQueuedNotifications = () => queue;

exports.sendClientAccessCode = async ({ to, code, therapistName }) => {
  if (!code) return false;
  return sendTransactionalEmail({
    to,
    subject: 'Your client chat verification code',
    text: `Your verification code for ${therapistName}'s client portal is ${code}. It expires in 10 minutes. If you did not request this code, you can ignore this email.`,
  });
};

exports.sendTherapistPasswordResetCode = ({ to, code }) => sendTransactionalEmail({
  to,
  subject: 'Reset your Unfazed password',
  text: `Your Unfazed password reset code is ${code}. It expires in 10 minutes. If you did not request a reset, you can ignore this email.`,
});

exports.sendBookingConfirmation = ({ to, therapistName, recipientId = to, recipientType = 'client' }) =>
  exports.notify({
    to,
    subject: 'Booking confirmed',
    text: `Your session with ${therapistName} has been confirmed.`,
    type: 'email',
    eventType: 'booking_confirmed',
    recipientType,
    recipientId,
  });

exports.sendReminder = ({ to, therapistName, hours = 24, recipientId = to, recipientType = 'client' }) =>
  exports.notify({
    to,
    subject: `${hours} hour reminder`,
    text: `This is a reminder that your appointment with ${therapistName} is in ${hours} hours.`,
    type: 'email',
    eventType: '24h_reminder',
    recipientType,
    recipientId,
  });

exports.sendFollowUp = ({ to, therapistName, recipientId = to, recipientType = 'client' }) =>
  exports.notify({
    to,
    subject: 'Follow-up after session',
    text: `We hope your session with ${therapistName} was helpful. Please share any updates.`,
    type: 'email',
    eventType: 'post_session_follow_up',
    recipientType,
    recipientId,
  });

const handleBookingConfirmed = async ({ session, therapistName }) => {
  await Promise.all([
    exports.sendBookingConfirmation({
      to: session.clientEmail,
      therapistName,
      recipientId: session.clientEmail,
      recipientType: 'client',
    }),
    exports.notify({
      recipientType: 'therapist',
      recipientId: session.therapistId,
      subject: 'New booking confirmed',
      text: `${session.clientName} booked a ${session.type} session.`,
      eventType: 'booking_confirmed',
      type: 'email',
      to: process.env.EMAIL_USER || 'therapist@unfazed.local',
    }),
  ]);
};

domainEvents.on('booking.confirmed', handleBookingConfirmed);
domainEvents.on('payment.completed', ({ payment }) => exports.notify({
  recipientType: 'therapist',
  recipientId: payment.therapistId,
  subject: 'Payment received',
  text: `Payment of INR ${payment.total_amount} was completed.`,
  eventType: 'payment_completed',
  type: 'email',
  to: process.env.EMAIL_USER || 'therapist@unfazed.local',
}));
domainEvents.on('session.completed', ({ session, therapistName }) => exports.sendFollowUp({
  to: session.clientEmail,
  therapistName,
  recipientId: session.clientEmail,
  recipientType: 'client',
}));

exports.scheduleReminders = async (Session, Therapist) => {
  const now = Date.now();
  const sessions = await Session.find({
    status: 'Scheduled',
    startTime: { $gte: new Date(now + 23 * 60 * 60 * 1000), $lte: new Date(now + 25 * 60 * 60 * 1000) },
    reminderSentAt: null,
  });

  for (const session of sessions) {
    const therapist = await Therapist.findById(session.therapistId).select('name');
    await exports.sendReminder({
      to: session.clientEmail,
      therapistName: therapist?.name || 'your therapist',
      recipientId: session.clientEmail,
      recipientType: 'client',
    });
    session.reminderSentAt = new Date();
    await session.save();
  }
  return sessions.length;
};

const nodemailer = require('nodemailer');

const transporter = process.env.EMAIL_USER && process.env.EMAIL_PASS
  ? nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })
  : null;

const queue = [];

exports.notify = async ({ to, subject, text, type = 'email', eventType = 'generic' }) => {
  const event = { to, subject, text, type, eventType, createdAt: new Date() };
  queue.push(event);

  if (type === 'whatsapp') {
    console.log(`[WHATSAPP STUB] ${eventType}: ${to} -> ${text}`);
    return event;
  }

  if (type === 'email' && transporter) {
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        text,
      });
    } catch (error) {
      console.error('Notification send failed:', error.message);
    }
  } else if (type === 'email') {
    console.log(`[EMAIL QUEUED] ${eventType}: ${to} -> ${text}`);
  }

  return event;
};

exports.getQueuedNotifications = () => queue;

exports.sendBookingConfirmation = ({ to, therapistName }) =>
  exports.notify({
    to,
    subject: 'Booking confirmed',
    text: `Your session with ${therapistName} has been confirmed.`,
    type: 'email',
    eventType: 'booking_confirmed'
  });

exports.sendReminder = ({ to, therapistName, hours = 24 }) =>
  exports.notify({
    to,
    subject: `${hours} hour reminder`,
    text: `This is a reminder that your appointment with ${therapistName} is in ${hours} hours.`,
    type: 'email',
    eventType: '24h_reminder'
  });

exports.sendFollowUp = ({ to, therapistName }) =>
  exports.notify({
    to,
    subject: 'Follow-up after session',
    text: `We hope your session with ${therapistName} was helpful. Please share any updates.`,
    type: 'email',
    eventType: 'post_session_follow_up'
  });

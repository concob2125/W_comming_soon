require('dotenv').config();
const {
  findSubscriberByEmail,
  addSubscriber,
  isDuplicateEmailError,
} = require('../database');

const ALLOWED_SOURCES = ['comingsoon', 'geometrydashiver'];

function normalizeBody(req) {
  if (req.body && typeof req.body === 'object') {
    return req.body;
  }

  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch (error) {
      return {};
    }
  }

  return {};
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, message: 'Method not allowed.' });
  }

  console.log('[subscribe] POST /api/subscribe received');

  try {
    const body = normalizeBody(req);
    const rawEmail = body.email;
    const rawSource = body.source;
    const email = typeof rawEmail === 'string' ? rawEmail.trim().toLowerCase() : '';
    const source = typeof rawSource === 'string' ? rawSource.trim().toLowerCase() : '';

    console.log('[subscribe] Normalized email:', email || '(empty)');
    console.log('[subscribe] Source:', source || '(empty)');

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      console.log('[subscribe] Rejected invalid email.');
      return res.status(400).json({ success: false, message: 'Invalid email.' });
    }

    if (!ALLOWED_SOURCES.includes(source)) {
      console.log('[subscribe] Rejected invalid source:', source);
      return res.status(400).json({ success: false, message: 'Invalid source.' });
    }

    const existing = await findSubscriberByEmail(email);

    if (existing) {
      console.log('[subscribe] Email already exists:', email);
      return res.status(200).json({ success: true, message: "You're already on the list." });
    }

    try {
      await addSubscriber(email, source);
    } catch (error) {
      if (isDuplicateEmailError(error)) {
        console.log('[subscribe] Email already exists by Supabase unique constraint:', email);
        return res.status(200).json({ success: true, message: "You're already on the list." });
      }

      console.error('[subscribe] Database insert error:', error);
      throw error;
    }

    console.log('[subscribe] Inserted subscriber:', email, 'from', source);
    return res.status(200).json({ success: true, message: "You're on the list." });
  } catch (error) {
    console.error('[subscribe] Unexpected error:', error);
    return res.status(500).json({ success: false, message: 'Something went wrong. Try again.' });
  }
};

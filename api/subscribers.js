require('dotenv').config();
const { listSubscribers } = require('../database');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ success: false, message: 'Method not allowed.' });
  }

  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ success: false, message: 'Not available in production.' });
  }

  try {
    console.log('[subscribers] Development list requested.');
    const subscribers = await listSubscribers();
    return res.status(200).json({ success: true, subscribers });
  } catch (error) {
    console.error('[subscribers] Database read error:', error);
    return res.status(500).json({ success: false, message: 'Unable to load subscribers.' });
  }
};

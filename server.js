const path = require('path');
const express = require('express');
require('dotenv').config();
const {
  initDb,
  findSubscriberByEmail,
  addSubscriber,
  listSubscribers,
  isDuplicateEmailError,
} = require('./database');

const app = express();
const PORT = Number(process.env.PORT || 3000);
const PUBLIC_DIR = path.join(__dirname);
const ALLOWED_SOURCES = ['comingsoon', 'geometrydashiver'];

app.use(express.json({ limit: '10kb' }));

if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    next();
  });
}

app.post('/api/subscribe', async (req, res) => {
  console.log('[subscribe] POST /api/subscribe received');
  console.log('[subscribe] Body:', req.body);

  try {
    const rawEmail = req.body && req.body.email;
    const rawSource = req.body && req.body.source;
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
      return res.json({ success: true, message: "You're already on the list." });
    }

    try {
      await addSubscriber(email, source);
    } catch (error) {
      if (isDuplicateEmailError(error)) {
        console.log('[subscribe] Email already exists by Supabase unique constraint:', email);
        return res.json({ success: true, message: "You're already on the list." });
      }

      console.error('[subscribe] Database insert error:', error);
      throw error;
    }

    console.log('[subscribe] Inserted subscriber:', email, 'from', source);
    return res.json({ success: true, message: "You're on the list." });
  } catch (error) {
    console.error('[subscribe] Unexpected error:', error);
    return res.status(500).json({ success: false, message: 'Something went wrong. Try again.' });
  }
});

app.get('/api/subscribers', async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ success: false, message: 'Not available in production.' });
  }

  try {
    console.log('[subscribers] Development list requested.');
    const subscribers = await listSubscribers();
    return res.json({ success: true, subscribers });
  } catch (error) {
    console.error('[subscribers] Database read error:', error);
    return res.status(500).json({ success: false, message: 'Unable to load subscribers.' });
  }
});

app.use(express.static(PUBLIC_DIR));

app.use((req, res) => {
  res.status(404).send('Not found');
});

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`WEARSHIVER server running at http://localhost:${PORT}`);
      console.log(`Serving static files from ${PUBLIC_DIR}`);
      console.log('Database provider: Supabase');
      console.log('Development subscribers endpoint: http://localhost:' + PORT + '/api/subscribers');
    });
  })
  .catch((error) => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  });

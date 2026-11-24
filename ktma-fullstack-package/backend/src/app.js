const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const destinationsRoutes = require('./routes/destinations.routes');
const membersRoutes = require('./routes/members.routes');
const eventsRoutes = require('./routes/events.routes');
const galleryRoutes = require('./routes/gallery.routes');
const contactRoutes = require('./routes/contact.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();

// Support CORS for client
app.use(cors({
  origin: (origin, callback) => callback(null, true), // Allow all origins for API flexibility
  credentials: true,
}));

// Body parser with 50mb limit for base64 photo uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static uploads serving
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'ktma-api', time: new Date().toISOString() });
});

app.use('/api/destinations', destinationsRoutes);
app.use('/api/members', membersRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Central error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

module.exports = app;

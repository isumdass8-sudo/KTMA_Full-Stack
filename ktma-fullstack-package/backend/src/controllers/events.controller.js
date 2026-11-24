const { pool } = require('../config/db');
const { saveBase64Image, deleteUploadFile } = require('../utils/fileStorage');

async function getAllEvents(req, res, next) {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM events ORDER BY event_date DESC, id DESC'
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

async function getEventById(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT * FROM events WHERE id = ?', [
      req.params.id,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    const [gallery] = await pool.query(
      'SELECT * FROM gallery WHERE event_id = ? ORDER BY display_order ASC, id ASC',
      [req.params.id]
    );
    res.json({ ...rows[0], gallery });
  } catch (err) {
    next(err);
  }
}

async function createEvent(req, res, next) {
  try {
    const { title, event_date, location, summary, cover_image, galleryImages } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Event title is required' });
    }

    // Process and save cover image to server uploads
    let savedCoverUrl = '';
    if (cover_image) {
      savedCoverUrl = saveBase64Image(cover_image);
    } else if (Array.isArray(galleryImages) && galleryImages.length > 0) {
      savedCoverUrl = saveBase64Image(galleryImages[0]);
    }

    const [result] = await pool.query(
      'INSERT INTO events (title, event_date, location, summary, cover_image) VALUES (?, ?, ?, ?, ?)',
      [
        title.trim(),
        event_date || null,
        (location || 'Kandy').trim(),
        (summary || '').trim(),
        savedCoverUrl,
      ]
    );

    const eventId = result.insertId;
    const savedGallery = [];

    // Process and save event gallery photos
    if (Array.isArray(galleryImages) && galleryImages.length > 0) {
      for (let i = 0; i < galleryImages.length; i++) {
        const img = galleryImages[i];
        const savedImgUrl = saveBase64Image(img);
        const imgTitle = `${title.trim()} — Photo ${i + 1}`;

        const [gResult] = await pool.query(
          'INSERT INTO gallery (title, category, image_url, event_id, display_order) VALUES (?, ?, ?, ?, ?)',
          [imgTitle, 'Events', savedImgUrl, eventId, i + 1]
        );

        savedGallery.push({
          id: gResult.insertId,
          title: imgTitle,
          category: 'Events',
          image_url: savedImgUrl,
          event_id: eventId,
        });
      }
    }

    res.status(201).json({
      id: eventId,
      title: title.trim(),
      event_date: event_date || null,
      location: (location || 'Kandy').trim(),
      summary: (summary || '').trim(),
      cover_image: savedCoverUrl,
      gallery: savedGallery,
    });
  } catch (err) {
    next(err);
  }
}

async function deleteEvent(req, res, next) {
  try {
    const { id } = req.params;

    // Optional: get gallery images to delete uploaded files
    const [images] = await pool.query('SELECT image_url FROM gallery WHERE event_id = ?', [id]);
    const [ev] = await pool.query('SELECT cover_image FROM events WHERE id = ?', [id]);

    if (ev.length > 0 && ev[0].cover_image) {
      deleteUploadFile(ev[0].cover_image);
    }
    for (const img of images) {
      if (img.image_url) deleteUploadFile(img.image_url);
    }

    await pool.query('DELETE FROM gallery WHERE event_id = ?', [id]);
    const [result] = await pool.query('DELETE FROM events WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json({ success: true, message: 'Event and associated gallery deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  deleteEvent,
};

const { pool } = require('../config/db');
const { saveBase64Image, deleteUploadFile } = require('../utils/fileStorage');

async function getGallery(req, res, next) {
  try {
    const { category } = req.query;
    let sql = 'SELECT * FROM gallery';
    const params = [];
    if (category && category !== 'All') {
      sql += ' WHERE category = ?';
      params.push(category);
    }
    sql += ' ORDER BY id DESC, display_order ASC';
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

async function createGalleryItem(req, res, next) {
  try {
    const { title, category, image_url, event_id } = req.body;

    if (!image_url) {
      return res.status(400).json({ error: 'Image is required' });
    }

    const savedUrl = saveBase64Image(image_url);

    const [result] = await pool.query(
      'INSERT INTO gallery (title, category, image_url, event_id) VALUES (?, ?, ?, ?)',
      [
        (title || 'Kandy Tourism Gallery Photo').trim(),
        category || 'Culture',
        savedUrl,
        event_id ? Number(event_id) : null,
      ]
    );

    res.status(201).json({
      id: result.insertId,
      title: (title || 'Kandy Tourism Gallery Photo').trim(),
      category: category || 'Culture',
      image_url: savedUrl,
      event_id: event_id ? Number(event_id) : null,
    });
  } catch (err) {
    next(err);
  }
}

async function createBatchGalleryItems(req, res, next) {
  try {
    const photos = Array.isArray(req.body) ? req.body : req.body.photos || [];

    if (!Array.isArray(photos) || photos.length === 0) {
      return res.status(400).json({ error: 'Photos array is required' });
    }

    const savedItems = [];

    for (const p of photos) {
      const savedUrl = saveBase64Image(p.image_url);
      const [result] = await pool.query(
        'INSERT INTO gallery (title, category, image_url, event_id) VALUES (?, ?, ?, ?)',
        [
          (p.title || 'KTMA Gallery Photo').trim(),
          p.category || 'Culture',
          savedUrl,
          p.event_id ? Number(p.event_id) : null,
        ]
      );

      savedItems.push({
        id: result.insertId,
        title: (p.title || 'KTMA Gallery Photo').trim(),
        category: p.category || 'Culture',
        image_url: savedUrl,
        event_id: p.event_id ? Number(p.event_id) : null,
      });
    }

    res.status(201).json(savedItems);
  } catch (err) {
    next(err);
  }
}

async function deleteGalleryItem(req, res, next) {
  try {
    const { id } = req.params;

    const [rows] = await pool.query('SELECT image_url FROM gallery WHERE id = ?', [id]);
    if (rows.length > 0 && rows[0].image_url) {
      deleteUploadFile(rows[0].image_url);
    }

    const [result] = await pool.query('DELETE FROM gallery WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Gallery photo not found' });
    }

    res.json({ success: true, message: 'Photo deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getGallery,
  createGalleryItem,
  createBatchGalleryItems,
  deleteGalleryItem,
};

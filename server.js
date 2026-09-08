const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const multer = require('multer');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Helper function to generate IDs
function makeId(prefix) {
  return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// Helper function to escape HTML
function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[char]);
}

// GET /events - Retrieve all events with photos
app.get('/events', async (req, res) => {
  try {
    // Get all events
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });

    if (eventsError) throw eventsError;

    // Get photos for each event
    const eventsWithPhotos = await Promise.all(
      (events || []).map(async (event) => {
        const { data: photos, error: photosError } = await supabase
          .from('photos')
          .select('id, filename, price')
          .eq('event_id', event.id)
          .order('created_at', { ascending: true });

        if (photosError) throw photosError;

        // Build photo URLs
        const photoUrls = (photos || []).map((photo) => ({
          id: photo.id,
          src: `${process.env.SUPABASE_URL}/storage/v1/object/public/hennies-photos/${event.id}/${photo.filename}`,
          price: photo.price,
        }));

        return {
          ...event,
          photos: photoUrls,
        };
      })
    );

    res.json({ events: eventsWithPhotos });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /events - Create a new event
app.post('/events', async (req, res) => {
  try {
    const { id, name, date } = req.body;

    if (!id || !name) {
      return res.status(400).json({ error: 'Missing id or name' });
    }

    const { data, error } = await supabase.from('events').insert([
      {
        id,
        name,
        date: date || '',
      },
    ]);

    if (error) throw error;

    res.json({ success: true, id });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /photos - Upload photos to an event
app.post('/photos', upload.array('photos'), async (req, res) => {
  try {
    const { eventId } = req.body;
    const files = req.files;

    if (!eventId || !files || files.length === 0) {
      return res.status(400).json({ error: 'Missing eventId or photos' });
    }

    // Verify event exists
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Upload each file
    const uploadedPhotos = [];

    for (const file of files) {
      const photoId = makeId('PHOTO_');
      const filename = `${photoId}-${file.originalname}`;
      const filepath = `${eventId}/${filename}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('hennies-photos')
        .upload(filepath, file.buffer, {
          contentType: file.mimetype,
        });

      if (uploadError) throw uploadError;

      // Save photo metadata to database
      const { error: dbError } = await supabase.from('photos').insert([
        {
          id: photoId,
          event_id: eventId,
          filename: filename,
          price: 0,
        },
      ]);

      if (dbError) throw dbError;

      uploadedPhotos.push({
        id: photoId,
        src: `${process.env.SUPABASE_URL}/storage/v1/object/public/hennies-photos/${filepath}`,
      });
    }

    res.json({ success: true, photos: uploadedPhotos });
  } catch (error) {
    console.error('Error uploading photos:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /events/:id - Delete an event and its photos
app.delete('/events/:id', async (req, res) => {
  try {
    const eventId = req.params.id;

    // Get all photos for this event
    const { data: photos, error: photosError } = await supabase
      .from('photos')
      .select('filename')
      .eq('event_id', eventId);

    if (photosError) throw photosError;

    // Delete files from storage
    for (const photo of photos || []) {
      const filepath = `${eventId}/${photo.filename}`;
      await supabase.storage.from('hennies-photos').remove([filepath]);
    }

    // Delete photos from database
    const { error: deletePhotosError } = await supabase
      .from('photos')
      .delete()
      .eq('event_id', eventId);

    if (deletePhotosError) throw deletePhotosError;

    // Delete event from database
    const { error: deleteEventError } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId);

    if (deleteEventError) throw deleteEventError;

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/', (req, res) => {
  res.json({
    message: "Hennie's Photos API is running",
    version: '1.0.0',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📸 Hennie's Photos API is ready!`);
});

module.exports = app;

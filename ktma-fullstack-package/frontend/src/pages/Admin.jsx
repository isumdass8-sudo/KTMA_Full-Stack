import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { fileToBase64 } from '../utils/imageCompressor';
import { resolveImage } from '../data/fallbackData';
import AdminLogin from '../components/AdminLogin';

const AUTH_KEY = 'ktma_admin_auth_status';

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return (
        window.sessionStorage.getItem(AUTH_KEY) === 'true' ||
        window.localStorage.getItem(AUTH_KEY) === 'true'
      );
    } catch {
      return false;
    }
  });

  const handleLoginSuccess = (remember) => {
    setIsAuthenticated(true);
    try {
      if (remember) {
        window.localStorage.setItem(AUTH_KEY, 'true');
      } else {
        window.sessionStorage.setItem(AUTH_KEY, 'true');
      }
    } catch (e) {
      console.warn(e);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    try {
      window.sessionStorage.removeItem(AUTH_KEY);
      window.localStorage.removeItem(AUTH_KEY);
    } catch (e) {
      console.warn(e);
    }
  };

  const {
    committee,
    membershipList,
    events,
    gallery,
    addCommitteeMember,
    deleteCommitteeMember,
    addGeneralMember,
    deleteGeneralMember,
    addEvent,
    deleteEvent,
    addGalleryPhoto,
    addMultipleGalleryPhotos,
    deleteGalleryPhoto,
    resetToDefaults,
  } = useData();

  const [activeTab, setActiveTab] = useState('events'); // 'events' | 'gallery' | 'members' | 'overview'
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  if (!isAuthenticated) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-sand-50 py-10">
      <div className="container-ktma">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 border-b border-teal-950/10 pb-6 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <p className="eyebrow uppercase">Management Portal</p>
              <span className="rounded-full bg-forest-700/10 px-2 py-0.5 text-[10px] font-bold text-forest-700">
                Authenticated Admin
              </span>
            </div>
            <h1 className="mt-1 font-display text-3xl font-semibold text-teal-950 md:text-4xl">
              KTMA Administration
            </h1>
            <p className="mt-1 text-sm text-ink-500">
              Manage association members, events with photos, and gallery exhibits directly.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/" className="btn-outline text-xs">
              &larr; View Live Site
            </Link>
            <button
              onClick={handleLogout}
              className="rounded-full border border-red-300 bg-red-50 px-4 py-2 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100"
            >
              Log Out
            </button>
          </div>
        </div>

        {/* Notification Banner */}
        {notification && (
          <div
            className={`mt-6 flex items-center justify-between rounded-2xl px-5 py-4 text-sm font-medium shadow-sm transition-all ${
              notification.type === 'error'
                ? 'bg-red-50 text-red-800 ring-1 ring-red-200'
                : 'bg-teal-900 text-sand-50 shadow-soft'
            }`}
          >
            <span>{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="text-xs opacity-75 hover:opacity-100"
            >
              ✕
            </button>
          </div>
        )}

        {/* Tab Buttons */}
        <div className="mt-8 flex flex-wrap gap-2 border-b border-teal-950/10 pb-4">
          <TabButton
            active={activeTab === 'events'}
            onClick={() => setActiveTab('events')}
            label="Events & Event Photos"
            count={events.length}
          />
          <TabButton
            active={activeTab === 'gallery'}
            onClick={() => setActiveTab('gallery')}
            label="Gallery Photos"
            count={gallery.length}
          />
          <TabButton
            active={activeTab === 'members'}
            onClick={() => setActiveTab('members')}
            label="Members & Leadership"
            count={committee.length + membershipList.length}
          />
          <TabButton
            active={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
            label="Overview & Settings"
          />
        </div>

        {/* TAB CONTENTS */}
        <div className="mt-8">
          {activeTab === 'events' && (
            <EventsManagement
              events={events}
              onAddEvent={addEvent}
              onDeleteEvent={deleteEvent}
              onNotify={showNotification}
            />
          )}

          {activeTab === 'gallery' && (
            <GalleryManagement
              gallery={gallery}
              events={events}
              onAddPhoto={addGalleryPhoto}
              onAddMultiplePhotos={addMultipleGalleryPhotos}
              onDeletePhoto={deleteGalleryPhoto}
              onNotify={showNotification}
            />
          )}

          {activeTab === 'members' && (
            <MembersManagement
              committee={committee}
              membershipList={membershipList}
              onAddCommittee={addCommitteeMember}
              onDeleteCommittee={deleteCommitteeMember}
              onAddGeneralMember={addGeneralMember}
              onDeleteGeneralMember={deleteGeneralMember}
              onNotify={showNotification}
            />
          )}

          {activeTab === 'overview' && (
            <OverviewSettings
              eventsCount={events.length}
              galleryCount={gallery.length}
              committeeCount={committee.length}
              membersCount={membershipList.length}
              onResetDefaults={resetToDefaults}
              onNotify={showNotification}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, label, count }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all ${
        active
          ? 'bg-teal-950 text-sand-50 shadow-sm'
          : 'bg-white text-ink-700 ring-1 ring-teal-950/10 hover:bg-sand-100 hover:text-teal-950'
      }`}
    >
      <span>{label}</span>
      {count !== undefined && (
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-bold ${
            active ? 'bg-gold-500 text-teal-950' : 'bg-sand-200 text-ink-700'
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

/* =========================================================================
   1. EVENTS MANAGEMENT
   ========================================================================= */
function EventsManagement({ events, onAddEvent, onDeleteEvent, onNotify }) {
  const [title, setTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [location, setLocation] = useState('Kandy');
  const [summary, setSummary] = useState('');
  const [coverPhoto, setCoverPhoto] = useState(null);
  const [eventPhotos, setEventPhotos] = useState([]);
  const [processing, setProcessing] = useState(false);

  const coverInputRef = useRef(null);
  const photosInputRef = useRef(null);

  const handleCoverSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setProcessing(true);
      const base64 = await fileToBase64(file, { maxWidth: 1400, quality: 0.85 });
      setCoverPhoto(base64);
    } catch {
      onNotify('Failed to process cover image', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleEventPhotosSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    try {
      setProcessing(true);
      const processed = await Promise.all(
        files.map((file) => fileToBase64(file, { maxWidth: 1600, quality: 0.82 }))
      );
      setEventPhotos((prev) => [...prev, ...processed.filter(Boolean)]);
    } catch {
      onNotify('Failed to process one or more photos', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const removeEventPhoto = (index) => {
    setEventPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      onNotify('Event title is required', 'error');
      return;
    }

    try {
      onAddEvent({
        title,
        event_date: eventDate || null,
        location: location || 'Kandy',
        summary,
        cover_image: coverPhoto,
        galleryImages: eventPhotos,
      });

      onNotify(
        `Event "${title}" and ${eventPhotos.length} photo(s) added successfully!`
      );

      // Reset form
      setTitle('');
      setEventDate('');
      setLocation('Kandy');
      setSummary('');
      setCoverPhoto(null);
      setEventPhotos([]);
      if (coverInputRef.current) coverInputRef.current.value = '';
      if (photosInputRef.current) photosInputRef.current.value = '';
    } catch {
      onNotify('Error saving event', 'error');
    }
  };

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
      {/* ADD EVENT FORM */}
      <div className="lg:col-span-7">
        <div className="rounded-3xl bg-white p-6 shadow-soft ring-1 ring-teal-950/5 md:p-8">
          <div className="border-b border-teal-950/8 pb-4">
            <h2 className="font-display text-xl font-semibold text-teal-950">
              Add New Event with Photos
            </h2>
            <p className="mt-1 text-xs text-ink-500">
              Create an event, upload a primary cover image, and attach event photos.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-ink-700">
                Event Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. KTMA Annual Hospitality Gala 2026"
                className="mt-1.5 w-full rounded-xl border border-teal-950/15 bg-sand-50/50 px-4 py-2.5 text-sm text-teal-950 placeholder:text-ink-500/50 focus:border-teal-800 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-ink-700">
                  Event Date
                </label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-teal-950/15 bg-sand-50/50 px-4 py-2.5 text-sm text-teal-950 focus:border-teal-800 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-ink-700">
                  Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Kandy City / Grand Kandyan"
                  className="mt-1.5 w-full rounded-xl border border-teal-950/15 bg-sand-50/50 px-4 py-2.5 text-sm text-teal-950 focus:border-teal-800 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-ink-700">
                Event Summary / Description
              </label>
              <textarea
                rows="3"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Brief description of the event, participants, and highlights..."
                className="mt-1.5 w-full rounded-xl border border-teal-950/15 bg-sand-50/50 px-4 py-2.5 text-sm text-teal-950 focus:border-teal-800 focus:bg-white focus:outline-none"
              />
            </div>

            {/* COVER PHOTO UPLOAD */}
            <div className="rounded-2xl border border-dashed border-teal-950/20 bg-sand-50/60 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="block text-xs font-semibold uppercase tracking-wide text-teal-950">
                    Event Cover Photo
                  </span>
                  <span className="text-xs text-ink-500">
                    The main banner image displayed on the event card.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  className="rounded-full bg-teal-900 px-4 py-1.5 text-xs font-semibold text-sand-50 hover:bg-teal-800"
                >
                  {coverPhoto ? 'Change Cover' : 'Choose Cover'}
                </button>
              </div>

              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                onChange={handleCoverSelect}
                className="hidden"
              />

              {coverPhoto && (
                <div className="relative mt-3 aspect-video w-full overflow-hidden rounded-xl border border-teal-950/10">
                  <img
                    src={coverPhoto}
                    alt="Event cover preview"
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setCoverPhoto(null);
                      if (coverInputRef.current) coverInputRef.current.value = '';
                    }}
                    className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/90"
                    title="Remove cover"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            {/* EVENT GALLERY PHOTOS UPLOAD */}
            <div className="rounded-2xl border border-dashed border-teal-950/20 bg-sand-50/60 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="block text-xs font-semibold uppercase tracking-wide text-teal-950">
                    Event Gallery Photos ({eventPhotos.length} selected)
                  </span>
                  <span className="text-xs text-ink-500">
                    Select multiple photos to attach to this event's dedicated gallery.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => photosInputRef.current?.click()}
                  className="rounded-full bg-gold-500 px-4 py-1.5 text-xs font-semibold text-teal-950 hover:bg-gold-400"
                >
                  + Add Photos
                </button>
              </div>

              <input
                ref={photosInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleEventPhotosSelect}
                className="hidden"
              />

              {eventPhotos.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                  {eventPhotos.map((photo, index) => (
                    <div
                      key={index}
                      className="group relative aspect-square overflow-hidden rounded-lg bg-teal-950/10"
                    >
                      <img
                        src={photo}
                        alt={`Upload ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeEventPhoto(index)}
                        className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs text-white opacity-90 transition-opacity hover:opacity-100"
                        title="Remove photo"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={processing}
              className="btn-primary w-full justify-center py-3 text-base shadow-soft disabled:opacity-50"
            >
              {processing ? 'Processing Images...' : 'Save & Publish Event'}
            </button>
          </form>
        </div>
      </div>

      {/* EXISTING EVENTS LIST */}
      <div className="lg:col-span-5">
        <div className="rounded-3xl bg-white p-6 shadow-soft ring-1 ring-teal-950/5">
          <div className="flex items-center justify-between border-b border-teal-950/8 pb-4">
            <h2 className="font-display text-xl font-semibold text-teal-950">
              Published Events ({events.length})
            </h2>
          </div>

          <div className="mt-4 max-h-[600px] space-y-4 overflow-y-auto pr-1">
            {events.map((evt) => {
              const cover = resolveImage(evt.cover_image);
              return (
                <div
                  key={evt.id}
                  className="flex gap-4 rounded-2xl border border-teal-950/8 bg-sand-50/40 p-3 transition-colors hover:bg-sand-50"
                >
                  <div className="h-16 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-teal-950/10">
                    {cover ? (
                      <img src={cover} alt={evt.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-ink-500">
                        No cover
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <h4 className="font-display text-sm font-semibold text-teal-950 line-clamp-1">
                        {evt.title}
                      </h4>
                      <p className="text-xs text-ink-500">
                        {evt.event_date || 'No date'} &middot; {evt.location}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <Link
                        to={`/events/${evt.id}`}
                        className="text-xs font-semibold text-teal-800 hover:underline"
                        target="_blank"
                      >
                        Preview &rarr;
                      </Link>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete event "${evt.title}"?`)) {
                            onDeleteEvent(evt.id, true);
                            onNotify(`Event "${evt.title}" removed`);
                          }
                        }}
                        className="text-xs font-medium text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   2. GALLERY MANAGEMENT
   ========================================================================= */
function GalleryManagement({
  gallery,
  events,
  onAddPhoto,
  onAddMultiplePhotos,
  onDeletePhoto,
  onNotify,
}) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Culture');
  const [linkedEventId, setLinkedEventId] = useState('');
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [processing, setProcessing] = useState(false);
  const fileInputRef = useRef(null);

  const CATEGORIES = ['Culture', 'Events', 'Community', 'Nature', 'Association'];

  const handleFilesSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    try {
      setProcessing(true);
      const processed = await Promise.all(
        files.map((file) => fileToBase64(file, { maxWidth: 1600, quality: 0.82 }))
      );
      setSelectedPhotos((prev) => [...prev, ...processed.filter(Boolean)]);
    } catch {
      onNotify('Failed to process photos', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const removePhoto = (index) => {
    setSelectedPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedPhotos.length === 0) {
      onNotify('Please select at least one photo to upload', 'error');
      return;
    }

    try {
      if (selectedPhotos.length === 1) {
        onAddPhoto({
          title: title || 'Kandy Tourism Gallery Photo',
          category,
          image_url: selectedPhotos[0],
          event_id: linkedEventId || null,
        });
      } else {
        const photosPayload = selectedPhotos.map((url, i) => ({
          title: title ? `${title} (${i + 1})` : `Gallery Photo ${i + 1}`,
          category,
          image_url: url,
          event_id: linkedEventId || null,
        }));
        onAddMultiplePhotos(photosPayload);
      }

      onNotify(`${selectedPhotos.length} photo(s) added to gallery!`);
      setTitle('');
      setSelectedPhotos([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch {
      onNotify('Error saving gallery photos', 'error');
    }
  };

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
      {/* UPLOAD FORM */}
      <div className="lg:col-span-6">
        <div className="rounded-3xl bg-white p-6 shadow-soft ring-1 ring-teal-950/5 md:p-8">
          <div className="border-b border-teal-950/8 pb-4">
            <h2 className="font-display text-xl font-semibold text-teal-950">
              Upload Photos to Gallery
            </h2>
            <p className="mt-1 text-xs text-ink-500">
              Upload single or bulk photos to the KTMA photo showcase.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-ink-700">
                Photo Title / Caption
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Traditional Kandyan Dancers at Dalada Maligawa"
                className="mt-1.5 w-full rounded-xl border border-teal-950/15 bg-sand-50/50 px-4 py-2.5 text-sm text-teal-950 focus:border-teal-800 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-ink-700">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-teal-950/15 bg-sand-50/50 px-4 py-2.5 text-sm text-teal-950 focus:border-teal-800 focus:bg-white focus:outline-none"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-ink-700">
                  Link to Event (Optional)
                </label>
                <select
                  value={linkedEventId}
                  onChange={(e) => setLinkedEventId(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-teal-950/15 bg-sand-50/50 px-4 py-2.5 text-sm text-teal-950 focus:border-teal-800 focus:bg-white focus:outline-none"
                >
                  <option value="">None (General Gallery)</option>
                  {events.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* FILE PICKER */}
            <div className="rounded-2xl border border-dashed border-teal-950/20 bg-sand-50/60 p-6 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFilesSelect}
                className="hidden"
              />
              <svg
                className="mx-auto h-12 w-12 text-teal-950/30"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-gold text-xs"
                >
                  Browse Image Files
                </button>
              </div>
              <p className="mt-2 text-xs text-ink-500">
                Supports JPG, PNG, WEBP (multiple files allowed)
              </p>

              {selectedPhotos.length > 0 && (
                <div className="mt-4 grid grid-cols-4 gap-2">
                  {selectedPhotos.map((photo, i) => (
                    <div key={i} className="group relative aspect-square overflow-hidden rounded-lg">
                      <img src={photo} alt="" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removePhoto(i)}
                        className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs text-white"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={processing || selectedPhotos.length === 0}
              className="btn-primary w-full justify-center py-3 text-base shadow-soft disabled:opacity-50"
            >
              {processing ? 'Processing...' : `Upload ${selectedPhotos.length || ''} Photos to Gallery`}
            </button>
          </form>
        </div>
      </div>

      {/* GALLERY GRID PREVIEW */}
      <div className="lg:col-span-6">
        <div className="rounded-3xl bg-white p-6 shadow-soft ring-1 ring-teal-950/5">
          <div className="flex items-center justify-between border-b border-teal-950/8 pb-4">
            <h2 className="font-display text-xl font-semibold text-teal-950">
              Gallery Photos ({gallery.length})
            </h2>
            <Link to="/gallery" target="_blank" className="text-xs font-semibold text-teal-800 hover:underline">
              View Public Gallery &rarr;
            </Link>
          </div>

          <div className="mt-4 grid max-h-[600px] grid-cols-2 gap-3 overflow-y-auto pr-1 sm:grid-cols-3">
            {gallery.slice(0, 48).map((photo) => (
              <div
                key={photo.id}
                className="group relative aspect-square overflow-hidden rounded-xl bg-teal-950/10"
              >
                <img
                  src={resolveImage(photo.image_url)}
                  alt={photo.title}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-teal-950/80 via-transparent to-black/30 p-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        if (window.confirm('Delete this photo from gallery?')) {
                          onDeletePhoto(photo.id);
                          onNotify('Photo removed from gallery');
                        }
                      }}
                      className="rounded bg-red-600/90 px-1.5 py-0.5 text-[10px] font-bold text-white hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                  <div>
                    <span className="rounded bg-gold-500/90 px-1 py-0.5 text-[9px] font-bold text-teal-950">
                      {photo.category}
                    </span>
                    <p className="mt-1 line-clamp-1 text-[11px] font-medium text-sand-50">
                      {photo.title}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   3. MEMBERS & LEADERSHIP MANAGEMENT
   ========================================================================= */
function MembersManagement({
  committee,
  membershipList,
  onAddCommittee,
  onDeleteCommittee,
  onAddGeneralMember,
  onDeleteGeneralMember,
  onNotify,
}) {
  const [subTab, setSubTab] = useState('committee'); // 'committee' | 'general'

  // Committee form state
  const [commName, setCommName] = useState('');
  const [commRole, setCommRole] = useState('Executive Committee');
  const [commTerm, setCommTerm] = useState('2026-2028');
  const [commPhoto, setCommPhoto] = useState(null);
  const commPhotoRef = useRef(null);

  // General Member form state
  const [genName, setGenName] = useState('');
  const [genNumber, setGenNumber] = useState('');

  const handleCommPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await fileToBase64(file, { maxWidth: 600, maxHeight: 600, quality: 0.85 });
      setCommPhoto(base64);
    } catch {
      onNotify('Failed to process member photo', 'error');
    }
  };

  const handleCommitteeSubmit = (e) => {
    e.preventDefault();
    if (!commName.trim() || !commRole.trim()) {
      onNotify('Please provide member name and role', 'error');
      return;
    }
    onAddCommittee({
      full_name: commName,
      role: commRole,
      term: commTerm,
      photo_url: commPhoto,
    });
    onNotify(`Added "${commName}" to Executive Committee!`);
    setCommName('');
    setCommRole('Executive Committee');
    setCommPhoto(null);
    if (commPhotoRef.current) commPhotoRef.current.value = '';
  };

  const handleGeneralSubmit = (e) => {
    e.preventDefault();
    if (!genName.trim()) {
      onNotify('Member name is required', 'error');
      return;
    }
    onAddGeneralMember({
      name: genName,
      membershipNo: genNumber ? Number(genNumber) : undefined,
    });
    onNotify(`Member "${genName}" added to directory!`);
    setGenName('');
    setGenNumber('');
  };

  return (
    <div>
      {/* Sub tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setSubTab('committee')}
          className={`rounded-full px-4 py-1.5 text-xs font-semibold ${
            subTab === 'committee'
              ? 'bg-clay-600 text-sand-50'
              : 'bg-sand-100 text-ink-700 hover:bg-sand-200'
          }`}
        >
          Executive Committee ({committee.length})
        </button>
        <button
          onClick={() => setSubTab('general')}
          className={`rounded-full px-4 py-1.5 text-xs font-semibold ${
            subTab === 'general'
              ? 'bg-clay-600 text-sand-50'
              : 'bg-sand-100 text-ink-700 hover:bg-sand-200'
          }`}
        >
          General Members List ({membershipList.length})
        </button>
      </div>

      <div className="mt-6">
        {subTab === 'committee' ? (
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
            {/* ADD COMMITTEE FORM */}
            <div className="lg:col-span-5">
              <div className="rounded-3xl bg-white p-6 shadow-soft ring-1 ring-teal-950/5">
                <h3 className="font-display text-lg font-semibold text-teal-950">
                  Add Executive Committee Member
                </h3>
                <form onSubmit={handleCommitteeSubmit} className="mt-5 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-ink-700">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={commName}
                      onChange={(e) => setCommName(e.target.value)}
                      placeholder="e.g. Ruwan Jayawardena"
                      className="mt-1 w-full rounded-xl border border-teal-950/15 bg-sand-50/50 px-3.5 py-2 text-sm text-teal-950 focus:border-teal-800 focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-ink-700">
                      Role / Designation *
                    </label>
                    <input
                      type="text"
                      required
                      value={commRole}
                      onChange={(e) => setCommRole(e.target.value)}
                      placeholder="e.g. Vice President, Committee Member"
                      className="mt-1 w-full rounded-xl border border-teal-950/15 bg-sand-50/50 px-3.5 py-2 text-sm text-teal-950 focus:border-teal-800 focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-ink-700">
                      Term
                    </label>
                    <input
                      type="text"
                      value={commTerm}
                      onChange={(e) => setCommTerm(e.target.value)}
                      placeholder="2026-2028"
                      className="mt-1 w-full rounded-xl border border-teal-950/15 bg-sand-50/50 px-3.5 py-2 text-sm text-teal-950 focus:border-teal-800 focus:bg-white focus:outline-none"
                    />
                  </div>

                  {/* Photo upload */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-ink-700">
                      Member Portrait Photo (Optional)
                    </label>
                    <div className="mt-2 flex items-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-sand-200 ring-2 ring-gold-400/30">
                        {commPhoto ? (
                          <img src={commPhoto} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <span className="font-display text-sm font-semibold text-teal-950">
                            {commName ? commName.charAt(0) : '?'}
                          </span>
                        )}
                      </div>
                      <div>
                        <input
                          ref={commPhotoRef}
                          type="file"
                          accept="image/*"
                          onChange={handleCommPhoto}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => commPhotoRef.current?.click()}
                          className="rounded-full border border-teal-950/20 bg-white px-3 py-1.5 text-xs font-semibold text-teal-950 hover:bg-sand-50"
                        >
                          {commPhoto ? 'Change Photo' : 'Upload Photo'}
                        </button>
                        {commPhoto && (
                          <button
                            type="button"
                            onClick={() => {
                              setCommPhoto(null);
                              if (commPhotoRef.current) commPhotoRef.current.value = '';
                            }}
                            className="ml-2 text-xs text-red-600 hover:underline"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn-primary mt-2 w-full justify-center py-2.5 text-sm"
                  >
                    Add Committee Member
                  </button>
                </form>
              </div>
            </div>

            {/* COMMITTEE MEMBERS LIST */}
            <div className="lg:col-span-7">
              <div className="rounded-3xl bg-white p-6 shadow-soft ring-1 ring-teal-950/5">
                <h3 className="font-display text-lg font-semibold text-teal-950">
                  Current Executive Committee ({committee.length})
                </h3>
                <div className="mt-4 max-h-[500px] space-y-3 overflow-y-auto pr-1">
                  {committee.map((m) => {
                    const photo = resolveImage(m.photo_url);
                    const hasPhoto = photo && !photo.includes('executive-committee.jpg');
                    return (
                      <div
                        key={m.id}
                        className="flex items-center justify-between rounded-xl border border-teal-950/8 bg-sand-50/40 p-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-teal-800 text-xs font-bold text-sand-50">
                            {hasPhoto ? (
                              <img
                                src={photo}
                                alt={m.full_name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              m.full_name
                                .split(' ')
                                .map((p) => p[0])
                                .slice(0, 2)
                                .join('')
                            )}
                          </div>
                          <div>
                            <p className="font-display text-sm font-semibold text-teal-950">
                              {m.full_name}
                            </p>
                            <p className="text-xs text-clay-600 font-medium">
                              {m.role} &middot; <span className="text-ink-500">{m.term}</span>
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            if (window.confirm(`Remove ${m.full_name} from committee?`)) {
                              onDeleteCommittee(m.id);
                              onNotify(`Removed ${m.full_name}`);
                            }
                          }}
                          className="text-xs text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
            {/* ADD GENERAL MEMBER FORM */}
            <div className="lg:col-span-5">
              <div className="rounded-3xl bg-white p-6 shadow-soft ring-1 ring-teal-950/5">
                <h3 className="font-display text-lg font-semibold text-teal-950">
                  Add Member to Directory
                </h3>
                <form onSubmit={handleGeneralSubmit} className="mt-5 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-ink-700">
                      Member Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={genName}
                      onChange={(e) => setGenName(e.target.value)}
                      placeholder="e.g. Kasun Chamara"
                      className="mt-1 w-full rounded-xl border border-teal-950/15 bg-sand-50/50 px-3.5 py-2 text-sm text-teal-950 focus:border-teal-800 focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-ink-700">
                      Membership No. (Optional - auto-assigned if empty)
                    </label>
                    <input
                      type="number"
                      value={genNumber}
                      onChange={(e) => setGenNumber(e.target.value)}
                      placeholder="e.g. 31"
                      className="mt-1 w-full rounded-xl border border-teal-950/15 bg-sand-50/50 px-3.5 py-2 text-sm text-teal-950 focus:border-teal-800 focus:bg-white focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-primary mt-2 w-full justify-center py-2.5 text-sm"
                  >
                    Add to Membership Directory
                  </button>
                </form>
              </div>
            </div>

            {/* MEMBERS LIST */}
            <div className="lg:col-span-7">
              <div className="rounded-3xl bg-white p-6 shadow-soft ring-1 ring-teal-950/5">
                <h3 className="font-display text-lg font-semibold text-teal-950">
                  Registered Members ({membershipList.length})
                </h3>
                <div className="mt-4 max-h-[500px] divide-y divide-teal-950/8 overflow-y-auto">
                  {membershipList.map((m) => (
                    <div
                      key={m.membershipNo}
                      className="flex items-center justify-between py-2.5 px-2 hover:bg-sand-50/60"
                    >
                      <div className="flex items-center gap-4">
                        <span className="font-semibold text-clay-600 text-sm">
                          #{String(m.membershipNo).padStart(2, '0')}
                        </span>
                        <span className="text-sm font-medium text-teal-950">{m.name}</span>
                      </div>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete member ${m.name}?`)) {
                            onDeleteGeneralMember(m.membershipNo);
                            onNotify(`Member ${m.name} deleted`);
                          }
                        }}
                        className="text-xs text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================================
   4. OVERVIEW & SETTINGS
   ========================================================================= */
function OverviewSettings({
  eventsCount,
  galleryCount,
  committeeCount,
  membersCount,
  onResetDefaults,
  onNotify,
}) {
  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total Events" value={eventsCount} color="text-teal-900" />
        <StatCard label="Gallery Photos" value={galleryCount} color="text-clay-600" />
        <StatCard label="Committee Leaders" value={committeeCount} color="text-forest-700" />
        <StatCard label="General Members" value={membersCount} color="text-gold-600" />
      </div>

      {/* Database & Reset Section */}
      <div className="rounded-3xl bg-white p-6 shadow-soft ring-1 ring-teal-950/5 md:p-8">
        <h3 className="font-display text-lg font-semibold text-teal-950">
          Browser Storage & System Controls
        </h3>
        <p className="mt-2 text-sm text-ink-500">
          All data and images you add through this Admin portal are saved securely inside your browser's
          high-capacity IndexedDB storage. Changes are instantly visible across all public pages of the website.
        </p>

        <div className="mt-8 border-t border-teal-950/10 pt-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h4 className="font-display text-base font-semibold text-red-900">
                Reset to Original KTMA Seed Data
              </h4>
              <p className="text-xs text-ink-500">
                Clears all custom added events, gallery photos, and members, restoring the site to its factory defaults.
              </p>
            </div>
            <button
              onClick={async () => {
                if (
                  window.confirm(
                    'Are you sure you want to restore the default KTMA data? All your custom uploads will be cleared.'
                  )
                ) {
                  await onResetDefaults();
                  onNotify('Database reset to original KTMA defaults');
                }
              }}
              className="rounded-full border border-red-300 bg-red-50 px-5 py-2.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100"
            >
              Reset to Factory Seed Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-teal-950/5">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">{label}</p>
      <p className={`mt-2 font-display text-3xl font-bold ${color}`}>{value}</p>
    </div>
  );
}


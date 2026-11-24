import { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { dbGet, dbSet, dbClear } from '../utils/storage';
import {
  fallbackCommittee,
  fallbackMembershipList,
  fallbackEvents,
  fallbackGallery,
} from '../data/fallbackData';
import {
  apiFetchEvents,
  apiCreateEvent,
  apiDeleteEvent,
  apiFetchGallery,
  apiCreateGalleryItem,
  apiCreateBatchGallery,
  apiDeleteGalleryItem,
  apiFetchCommittee,
  apiCreateCommitteeMember,
  apiDeleteCommitteeMember,
  apiFetchGeneralMembers,
  apiCreateGeneralMember,
  apiDeleteGeneralMember,
} from '../utils/api';

const DataContext = createContext(null);

const STORAGE_KEYS = {
  COMMITTEE: 'ktma_data_committee',
  MEMBERS: 'ktma_data_members',
  EVENTS: 'ktma_data_events',
  GALLERY: 'ktma_data_gallery',
};

export function DataProvider({ children }) {
  const [committee, setCommittee] = useState([]);
  const [membershipList, setMembershipList] = useState([]);
  const [events, setEvents] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [isReady, setIsReady] = useState(false);
  const [isLiveApi, setIsLiveApi] = useState(false);

  // Load data: Try real Backend API first. If unavailable, fallback to IndexedDB / static seed data
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      let loadedFromApi = false;

      try {
        // Try fetching from Node.js / Express backend
        const [apiEvts, apiGal, apiComm, apiGenMem] = await Promise.all([
          apiFetchEvents().catch(() => null),
          apiFetchGallery().catch(() => null),
          apiFetchCommittee().catch(() => null),
          apiFetchGeneralMembers().catch(() => null),
        ]);

        if (apiEvts && Array.isArray(apiEvts) && apiEvts.length > 0) {
          loadedFromApi = true;
          if (isMounted) {
            setEvents(apiEvts);
            dbSet(STORAGE_KEYS.EVENTS, apiEvts).catch(console.error);
          }
        }
        if (apiGal && Array.isArray(apiGal) && apiGal.length > 0) {
          loadedFromApi = true;
          if (isMounted) {
            setGallery(apiGal);
            dbSet(STORAGE_KEYS.GALLERY, apiGal).catch(console.error);
          }
        }
        if (apiComm && Array.isArray(apiComm) && apiComm.length > 0) {
          loadedFromApi = true;
          if (isMounted) {
            setCommittee(apiComm);
            dbSet(STORAGE_KEYS.COMMITTEE, apiComm).catch(console.error);
          }
        }
        if (apiGenMem && Array.isArray(apiGenMem) && apiGenMem.length > 0) {
          loadedFromApi = true;
          if (isMounted) {
            setMembershipList(apiGenMem);
            dbSet(STORAGE_KEYS.MEMBERS, apiGenMem).catch(console.error);
          }
        }
      } catch (err) {
        console.warn('Backend API connection check failed, using local storage/seed:', err.message);
      }

      if (isMounted) {
        setIsLiveApi(loadedFromApi);
      }

      // If backend was not reached or partial, fill remaining from IndexedDB / fallbacks
      try {
        const [storedCommittee, storedMembers, storedEvents, storedGallery] = await Promise.all([
          dbGet(STORAGE_KEYS.COMMITTEE, null),
          dbGet(STORAGE_KEYS.MEMBERS, null),
          dbGet(STORAGE_KEYS.EVENTS, null),
          dbGet(STORAGE_KEYS.GALLERY, null),
        ]);

        if (!isMounted) return;

        setCommittee((prev) => (prev.length > 0 ? prev : (storedCommittee || fallbackCommittee)));
        setMembershipList((prev) => (prev.length > 0 ? prev : (storedMembers || fallbackMembershipList)));
        setEvents((prev) => (prev.length > 0 ? prev : (storedEvents || fallbackEvents)));
        setGallery((prev) => (prev.length > 0 ? prev : (storedGallery || fallbackGallery)));
      } catch (err) {
        console.error('Error loading fallback data:', err);
      } finally {
        if (isMounted) setIsReady(true);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  // 1. Members operations
  const addCommitteeMember = useCallback(
    async ({ full_name, role, term = '2026-2028', photo_url = '' }) => {
      let newMember = {
        id: Date.now(),
        full_name: full_name.trim(),
        role: role.trim(),
        term: term.trim() || '2026-2028',
        photo_url,
      };

      try {
        // Send to real backend API
        const apiResult = await apiCreateCommitteeMember(newMember);
        if (apiResult && apiResult.id) {
          newMember = apiResult;
        }
      } catch (err) {
        console.warn('API save failed, saved locally to IndexedDB:', err.message);
      }

      setCommittee((prev) => {
        const updated = [newMember, ...prev];
        dbSet(STORAGE_KEYS.COMMITTEE, updated).catch(console.error);
        return updated;
      });

      return newMember;
    },
    []
  );

  const deleteCommitteeMember = useCallback(
    async (id) => {
      try {
        await apiDeleteCommitteeMember(id);
      } catch (err) {
        console.warn('API delete failed, deleting locally:', err.message);
      }

      setCommittee((prev) => {
        const updated = prev.filter((m) => String(m.id) !== String(id));
        dbSet(STORAGE_KEYS.COMMITTEE, updated).catch(console.error);
        return updated;
      });
    },
    []
  );

  const addGeneralMember = useCallback(
    async ({ name, membershipNo }) => {
      let payload = { name: name.trim(), membershipNo };

      try {
        const apiResult = await apiCreateGeneralMember(payload);
        if (apiResult) payload = apiResult;
      } catch (err) {
        console.warn('API save failed, saved locally:', err.message);
      }

      setMembershipList((prev) => {
        const nextNo =
          payload.membershipNo !== undefined && payload.membershipNo !== ''
            ? Number(payload.membershipNo)
            : (prev.reduce((max, m) => Math.max(max, m.membershipNo || 0), 0) + 1);

        const newEntry = { membershipNo: nextNo, name: payload.name };
        const updated = [...prev.filter((m) => m.membershipNo !== nextNo), newEntry].sort(
          (a, b) => a.membershipNo - b.membershipNo
        );
        dbSet(STORAGE_KEYS.MEMBERS, updated).catch(console.error);
        return updated;
      });
    },
    []
  );

  const deleteGeneralMember = useCallback(
    async (membershipNo) => {
      try {
        await apiDeleteGeneralMember(membershipNo);
      } catch (err) {
        console.warn('API delete failed, deleting locally:', err.message);
      }

      setMembershipList((prev) => {
        const updated = prev.filter((m) => m.membershipNo !== membershipNo);
        dbSet(STORAGE_KEYS.MEMBERS, updated).catch(console.error);
        return updated;
      });
    },
    []
  );

  // 2. Events operations
  const addEvent = useCallback(
    async ({ title, event_date, location, summary, cover_image = '', galleryImages = [] }) => {
      let newEvent = {
        id: Date.now(),
        title: title.trim(),
        event_date: event_date || null,
        location: location.trim(),
        summary: summary.trim(),
        cover_image: cover_image || (galleryImages.length > 0 ? galleryImages[0] : ''),
      };
      let addedGallery = [];

      try {
        // Send to backend API
        const apiResult = await apiCreateEvent({
          title,
          event_date,
          location,
          summary,
          cover_image,
          galleryImages,
        });

        if (apiResult && apiResult.id) {
          newEvent = {
            id: apiResult.id,
            title: apiResult.title,
            event_date: apiResult.event_date,
            location: apiResult.location,
            summary: apiResult.summary,
            cover_image: apiResult.cover_image,
          };
          if (Array.isArray(apiResult.gallery)) {
            addedGallery = apiResult.gallery;
          }
        }
      } catch (err) {
        console.warn('Backend API event save failed, fallback to local storage:', err.message);
        if (galleryImages && galleryImages.length > 0) {
          addedGallery = galleryImages.map((imgUrl, idx) => ({
            id: Date.now() + idx + 1,
            title: `${title.trim()} — Photo ${idx + 1}`,
            category: 'Events',
            image_url: imgUrl,
            event_id: newEvent.id,
          }));
        }
      }

      setEvents((prev) => {
        const updated = [newEvent, ...prev];
        dbSet(STORAGE_KEYS.EVENTS, updated).catch(console.error);
        return updated;
      });

      if (addedGallery.length > 0) {
        setGallery((prev) => {
          const updated = [...addedGallery, ...prev];
          dbSet(STORAGE_KEYS.GALLERY, updated).catch(console.error);
          return updated;
        });
      }

      return newEvent;
    },
    []
  );

  const deleteEvent = useCallback(
    async (id, deleteAssociatedPhotos = false) => {
      try {
        await apiDeleteEvent(id);
      } catch (err) {
        console.warn('API delete event failed, deleting locally:', err.message);
      }

      setEvents((prev) => {
        const updated = prev.filter((e) => String(e.id) !== String(id));
        dbSet(STORAGE_KEYS.EVENTS, updated).catch(console.error);
        return updated;
      });

      if (deleteAssociatedPhotos) {
        setGallery((prev) => {
          const updated = prev.filter((g) => String(g.event_id) !== String(id));
          dbSet(STORAGE_KEYS.GALLERY, updated).catch(console.error);
          return updated;
        });
      }
    },
    []
  );

  const getEventWithGallery = useCallback(
    (id) => {
      const event = events.find((e) => String(e.id) === String(id));
      if (!event) return null;
      const eventGallery = gallery.filter((g) => String(g.event_id) === String(id));
      return { ...event, gallery: eventGallery };
    },
    [events, gallery]
  );

  // 3. Gallery operations
  const addGalleryPhoto = useCallback(
    async ({ title, category = 'Culture', image_url, event_id = null }) => {
      let newItem = {
        id: Date.now() + Math.floor(Math.random() * 1000),
        title: (title || 'KTMA Photo').trim(),
        category: category || 'Culture',
        image_url,
        event_id: event_id ? Number(event_id) : null,
      };

      try {
        const apiResult = await apiCreateGalleryItem(newItem);
        if (apiResult && apiResult.id) {
          newItem = apiResult;
        }
      } catch (err) {
        console.warn('API photo upload failed, fallback to local storage:', err.message);
      }

      setGallery((prev) => {
        const updated = [newItem, ...prev];
        dbSet(STORAGE_KEYS.GALLERY, updated).catch(console.error);
        return updated;
      });

      return newItem;
    },
    []
  );

  const addMultipleGalleryPhotos = useCallback(
    async (photosArray) => {
      let newItems = [];

      try {
        const apiResult = await apiCreateBatchGallery(photosArray);
        if (Array.isArray(apiResult) && apiResult.length > 0) {
          newItems = apiResult;
        }
      } catch (err) {
        console.warn('API batch gallery upload failed, fallback to local storage:', err.message);
        const now = Date.now();
        newItems = photosArray.map((p, idx) => ({
          id: now + idx,
          title: (p.title || `Gallery Photo ${idx + 1}`).trim(),
          category: p.category || 'Culture',
          image_url: p.image_url,
          event_id: p.event_id ? Number(p.event_id) : null,
        }));
      }

      setGallery((prev) => {
        const updated = [...newItems, ...prev];
        dbSet(STORAGE_KEYS.GALLERY, updated).catch(console.error);
        return updated;
      });

      return newItems;
    },
    []
  );

  const deleteGalleryPhoto = useCallback(
    async (id) => {
      try {
        await apiDeleteGalleryItem(id);
      } catch (err) {
        console.warn('API delete photo failed, deleting locally:', err.message);
      }

      setGallery((prev) => {
        const updated = prev.filter((g) => String(g.id) !== String(id));
        dbSet(STORAGE_KEYS.GALLERY, updated).catch(console.error);
        return updated;
      });
    },
    []
  );

  // 4. Reset & Backup operations
  const resetToDefaults = useCallback(async () => {
    await dbClear();
    setCommittee(fallbackCommittee);
    setMembershipList(fallbackMembershipList);
    setEvents(fallbackEvents);
    setGallery(fallbackGallery);
  }, []);

  const value = useMemo(
    () => ({
      isReady,
      isLiveApi,
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
      getEventWithGallery,
      addGalleryPhoto,
      addMultipleGalleryPhotos,
      deleteGalleryPhoto,
      resetToDefaults,
    }),
    [
      isReady,
      isLiveApi,
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
      getEventWithGallery,
      addGalleryPhoto,
      addMultipleGalleryPhotos,
      deleteGalleryPhoto,
      resetToDefaults,
    ]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }

  return data;
}

// 1. Events API
export async function apiFetchEvents() {
  return request('/events');
}

export async function apiFetchEventById(id) {
  return request(`/events/${id}`);
}

export async function apiCreateEvent(payload) {
  return request('/events', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function apiDeleteEvent(id) {
  return request(`/events/${id}`, {
    method: 'DELETE',
  });
}

// 2. Gallery API
export async function apiFetchGallery(category = '') {
  const query = category && category !== 'All' ? `?category=${encodeURIComponent(category)}` : '';
  return request(`/gallery${query}`);
}

export async function apiCreateGalleryItem(payload) {
  return request('/gallery', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function apiCreateBatchGallery(photos) {
  return request('/gallery/batch', {
    method: 'POST',
    body: JSON.stringify(photos),
  });
}

export async function apiDeleteGalleryItem(id) {
  return request(`/gallery/${id}`, {
    method: 'DELETE',
  });
}

// 3. Members API
export async function apiFetchCommittee() {
  return request('/members/committee');
}

export async function apiCreateCommitteeMember(payload) {
  return request('/members/committee', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function apiDeleteCommitteeMember(id) {
  return request(`/members/committee/${id}`, {
    method: 'DELETE',
  });
}

export async function apiFetchGeneralMembers() {
  return request('/members/general');
}

export async function apiCreateGeneralMember(payload) {
  return request('/members/general', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function apiDeleteGeneralMember(membershipNo) {
  return request(`/members/general/${membershipNo}`, {
    method: 'DELETE',
  });
}

// 4. Admin Auth API
export async function apiAdminLogin(username, password) {
  return request('/admin/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export { API_BASE };

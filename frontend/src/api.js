const BASE = '/api';

function authHeaders() {
  const token = localStorage.getItem('flewt_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function parseError(res) {
  try {
    const data = await res.json();
    const err = new Error(data.error || 'Something went wrong.');
    err.code = data.code;
    err.status = res.status;
    return err;
  } catch {
    const err = new Error('Something went wrong.');
    err.status = res.status;
    return err;
  }
}

export async function apiPost(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw await parseError(res);
  return res.json();
}

export async function apiGet(path) {
  const res = await fetch(`${BASE}${path}`, { headers: authHeaders() });
  if (!res.ok) throw await parseError(res);
  return res.json();
}

// Sends a file (and any extra form fields) to a tool endpoint, returns a Blob for download.
export async function apiUploadForFile(path, formData) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { ...authHeaders() },
    body: formData,
  });
  if (!res.ok) throw await parseError(res);

  const disposition = res.headers.get('Content-Disposition') || '';
  const match = disposition.match(/filename="(.+)"/);
  const filename = match ? match[1] : 'download';
  const blob = await res.blob();
  return { blob, filename };
}

// Same as apiUploadForFile, but for tool endpoints that return JSON instead of a file
// (extract-form-data, compare, voice-to-text).
export async function apiUploadForJson(path, formData) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { ...authHeaders() },
    body: formData,
  });
  if (!res.ok) throw await parseError(res);
  return res.json();
}

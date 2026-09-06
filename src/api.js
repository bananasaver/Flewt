const BASE = '/api';

function authHeaders() {
  const token = localStorage.getItem('flewt_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function parseError(res) {
  try {
    const data = await res.json();
    return data.error || 'Something went wrong.';
  } catch {
    return 'Something went wrong.';
  }
}

export async function apiPost(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function apiGet(path) {
  const res = await fetch(`${BASE}${path}`, { headers: authHeaders() });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

// Sends a file (and any extra form fields) to a tool endpoint, returns a Blob for download.
export async function apiUploadForFile(path, formData) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { ...authHeaders() },
    body: formData,
  });
  if (!res.ok) throw new Error(await parseError(res));

  const disposition = res.headers.get('Content-Disposition') || '';
  const match = disposition.match(/filename="(.+)"/);
  const filename = match ? match[1] : 'download';
  const blob = await res.blob();
  return { blob, filename };
}

const BASE = import.meta.env.VITE_API_URL+'/api' || '/api';

export async function analyzeVideo(url, videoTitle = '') {
  console.log(BASE)
  const res = await fetch(`${BASE}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, videoTitle }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Server error ${res.status}`);
  return data;
}

export async function downloadYouTubeClip({ videoId, timestamp, duration, title }) {
  const res = await fetch(`${BASE}/clip`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ videoId, timestamp, duration, title }),
  });
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    if (d.error === 'direct_download_unavailable') return { fallback: true, youtubeLink: d.youtubeLink };
    throw new Error(d.message || 'Download failed');
  }
  return { fallback: false, blob: await res.blob() };
}

export async function downloadUploadedClip({ file, timestamp, duration, hookTitle }) {
  const form = new FormData();
  form.append('video', file);
  form.append('timestamp', timestamp);
  form.append('duration', String(duration));
  form.append('hookTitle', hookTitle);

  const res = await fetch(`${BASE}/upload-clip`, { method: 'POST', body: form });
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    throw new Error(d.error || 'Upload clip failed');
  }
  return res.blob();
}

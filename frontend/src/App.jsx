import { ColdStartLoader } from './components/ColdStartLoader.jsx';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { analyzeVideo, downloadYouTubeClip, downloadUploadedClip } from './utils/api.js';
import { ToastContainer, toast } from './components/Toast.jsx';

/* ── Theme ──────────────────────────────────────────────────────── */
function useTheme() {
  const [dark, setDark] = useState(() => localStorage.getItem('vvc')  === '1');
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    localStorage.setItem('vvc', dark ? '1' : '0');
  }, [dark]);
  return [dark, () => setDark(v => !v)];
}

/* ── Copy ───────────────────────────────────────────────────────── */
function useCopy() {
  const [id, setId] = useState(null);
  const copy = useCallback(async (text, key) => {
    try { await navigator.clipboard.writeText(text); setId(key); setTimeout(() => setId(null), 2000); return true; }
    catch { return false; }
  }, []);
  return { copy, cid: id };
}

/* ── Helpers ────────────────────────────────────────────────────── */
async function ping() {
  const t = Date.now();
  try { await fetch('/health', { signal: AbortSignal.timeout(28000) }); } catch {}
  return Date.now() - t;
}

function tsToSec(ts = '00:00') {
  const p = ts.split(':').map(Number);
  return p.length === 3 ? p[0]*3600+p[1]*60+p[2] : (p[0]||0)*60+(p[1]||0);
}

function saveBlob(blob, name) {
  const u = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = u; a.download = name; a.click();
  URL.revokeObjectURL(u);
}

/* ── Category map ───────────────────────────────────────────────── */
const CATS = {
  shocking:      { c:'#f43f5e', bg:'rgba(244,63,94,.12)',  bd:'rgba(244,63,94,.28)',  e:'😱' },
  funny:         { c:'#f59e0b', bg:'rgba(245,158,11,.12)', bd:'rgba(245,158,11,.28)', e:'😂' },
  educational:   { c:'#06b6d4', bg:'rgba(6,182,212,.12)',  bd:'rgba(6,182,212,.28)',  e:'🧠' },
  inspiring:     { c:'#22c55e', bg:'rgba(34,197,94,.12)',  bd:'rgba(34,197,94,.28)',  e:'🌟' },
  controversial: { c:'#8b5cf6', bg:'rgba(139,92,246,.12)', bd:'rgba(139,92,246,.28)', e:'🔥' },
  relatable:     { c:'#ec4899', bg:'rgba(236,72,153,.12)', bd:'rgba(236,72,153,.28)', e:'💯' },
  general:       { c:'#6366f1', bg:'rgba(99,102,241,.12)', bd:'rgba(99,102,241,.28)', e:'✨' },
};
const cc = k => CATS[k] || CATS.general;

/* ── Score ring ─────────────────────────────────────────────────── */
function Ring({ score, category, size = 48 }) {
  const { c } = cc(category);
  const r = (size-6)/2, circ = 2*Math.PI*r;
  return (
    <div style={{ position:'relative', width:size, height:size, flexShrink:0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border)" strokeWidth={3.5} transform={`rotate(-90 ${size/2} ${size/2})`}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={c} strokeWidth={3.5} strokeLinecap="round"
          strokeDasharray={`${(score/100)*circ} ${circ}`} transform={`rotate(-90 ${size/2} ${size/2})`}
          style={{ transition:'stroke-dasharray .8s cubic-bezier(.34,1.3,.64,1)', filter:`drop-shadow(0 0 3px ${c}99)` }}/>
      </svg>
      <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:800, color:c }}>{score}</div>
    </div>
  );
}

/* ── Spinner ────────────────────────────────────────────────────── */
function Spin({ size = 14, color = 'currentColor' }) {
  return <span style={{ width:size, height:size, border:`2px solid ${color}44`, borderTopColor:color, borderRadius:'50%', display:'inline-block', animation:'spin .8s linear infinite', flexShrink:0 }}/>;
}

/* ── Copy button ────────────────────────────────────────────────── */
function CopyBtn({ text, id, label, copy, cid }) {
  const done = cid === id;
  return (
    <button onClick={async () => { const ok = await copy(text, id); if(ok) toast(`${label} copied`); }}
      className="btn btn-g btn-sm"
      style={{ color: done ? 'var(--green)':undefined, borderColor: done ? 'var(--green)':undefined, flexShrink:0 }}>
      {done ? '✓' : '⎘'} {done ? 'Copied' : label}
    </button>
  );
}

/* ── Download button ────────────────────────────────────────────── */
function DlBtn({ clip, videoId, uploadedFile }) {
  const [st, setSt] = useState('idle');
  const [ytUrl, setYtUrl] = useState('');

  async function go() {
    setSt('loading');
    try {
      if (uploadedFile) {
        const blob = await downloadUploadedClip({ file:uploadedFile, timestamp:clip.timestamp, duration:clip.clipDuration, hookTitle:clip.hook });
        saveBlob(blob, `clip_${clip.timestamp.replace(':','-')}.mp4`);
        setSt('done'); toast('Clip downloaded! 🎬', 'success');
        setTimeout(() => setSt('idle'), 3000);
      } else {
        const r = await downloadYouTubeClip({ videoId, timestamp:clip.timestamp, duration:clip.clipDuration, title:clip.hook });
        if (r.fallback) {
          setYtUrl(r.youtubeLink); setSt('fallback');
          toast('Direct download unavailable — see options below', 'warning');
        } else {
          saveBlob(r.blob, `clip_${clip.timestamp.replace(':','-')}.mp4`);
          setSt('done'); toast('Clip downloaded! 🎬', 'success');
          setTimeout(() => setSt('idle'), 3000);
        }
      }
    } catch(e) { setSt('idle'); toast(e.message || 'Download failed', 'error'); }
  }

  if (st === 'fallback') return (
    <div style={{ display:'flex', flexDirection:'column', gap:6, width:'100%' }}>
      <a href={ytUrl} target="_blank" rel="noopener noreferrer" className="btn btn-g btn-sm" style={{ textDecoration:'none', justifyContent:'center' }}>
        ▶ Open on YouTube at {clip.timestamp}
      </a>
      <a href={`https://save-tube.com/`}
        target="_blank" rel="noopener noreferrer"
        className="btn btn-g btn-sm" style={{ textDecoration:'none', justifyContent:'center', fontSize:11.5 }}>
        📥 Download via save-tube.com → then upload above
      </a>
    </div>
  );

  return (
    <button onClick={go} disabled={st==='loading'} className="btn btn-g btn-sm">
      {st==='loading' && <Spin/>}
      {st==='idle' && <span>↓</span>}
      {st==='done' && <span style={{ color:'var(--green)' }}>✓</span>}
      {st==='idle' ? 'Download Clip' : st==='loading' ? 'Processing…' : 'Downloaded!'}
    </button>
  );
}

/* ── Clip card ──────────────────────────────────────────────────── */
function ClipCard({ clip, index, videoId, uploadedFile }) {
  const { copy, cid } = useCopy();
  const [embed, setEmbed] = useState(false);
  const c = cc(clip.category);
  const sec = tsToSec(clip.timestamp);
  const ytLink = `https://www.youtube.com/watch?v=${videoId}&t=${sec}s`;
  const all = `HOOK:\n${clip.hook}\n\nCAPTION:\n${clip.caption}\n\n${clip.hashtags.join(' ')}`;

  return (
    <div className="card a-pop" style={{ overflow:'hidden', animationDelay:`${index*60}ms` }}>
      {/* Top accent bar */}
      <div style={{ height:3, background:`linear-gradient(90deg,${c.c},${c.c}66)` }}/>

      <div style={{ padding:'18px 16px', display:'flex', flexDirection:'column', gap:14 }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:8 }}>
          <div style={{ display:'flex', alignItems:'center', gap:7, flexWrap:'wrap', flex:1 }}>
            {/* Number */}
            <span style={{ width:28, height:28, borderRadius:8, background:'var(--surface2)', border:'1.5px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10.5, fontWeight:800, color:'var(--muted)', flexShrink:0 }}>
              {String(index+1).padStart(2,'0')}
            </span>
            {/* Timestamp link */}
            <a href={ytLink} target="_blank" rel="noopener noreferrer"
              style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'4px 10px', borderRadius:8, background:'var(--surface2)', border:'1.5px solid var(--border)', fontSize:11.5, fontWeight:700, color:'var(--muted)', fontFamily:'monospace', transition:'all .15s' }}
              onMouseEnter={e=>{ e.currentTarget.style.borderColor='var(--accent)'; e.currentTarget.style.color='var(--accent)'; }}
              onMouseLeave={e=>{ e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--muted)'; }}>
              ⏱ {clip.timestamp} ↗
            </a>
            {/* Category */}
            <span style={{ padding:'4px 10px', borderRadius:8, fontSize:11, fontWeight:700, background:c.bg, border:`1.5px solid ${c.bd}`, color:c.c }}>
              {c.e} {clip.category}
            </span>
          </div>
          <Ring score={clip.viralScore} category={clip.category}/>
        </div>

        {/* Reason */}
        {clip.reason && (
          <p style={{ fontSize:12.5, color:'var(--subtle)', fontStyle:'italic', borderLeft:`2px solid ${c.c}55`, paddingLeft:10, lineHeight:1.65, margin:0 }}>
            {clip.reason}
          </p>
        )}

        {/* Hook */}
        <div className="card-inset" style={{ padding:'13px 14px' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8, gap:8 }}>
            <span className="slabel" style={{ fontSize:10, color:c.c }}>🪝 Hook</span>
            <CopyBtn text={clip.hook} id={`h${clip.id}`} label="Hook" copy={copy} cid={cid}/>
          </div>
          <p style={{ fontSize:15.5, fontWeight:800, color:'var(--ink)', lineHeight:1.3, margin:0 }}>
            {clip.hook}
          </p>
        </div>

        {/* Caption */}
        <div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:7, gap:8 }}>
            <span className="slabel" style={{ fontSize:10 }}>📝 Caption</span>
            <CopyBtn text={clip.caption} id={`c${clip.id}`} label="Caption" copy={copy} cid={cid}/>
          </div>
          <p style={{ fontSize:13.5, color:'var(--muted)', lineHeight:1.8, margin:0 }}>{clip.caption}</p>
        </div>

        {/* Hashtags */}
        <div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:7, gap:8 }}>
            <span className="slabel" style={{ fontSize:10 }}># Hashtags</span>
            <CopyBtn text={clip.hashtags.join(' ')} id={`t${clip.id}`} label="Tags" copy={copy} cid={cid}/>
          </div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
            {clip.hashtags.map(tag => (
              <span key={tag} style={{ padding:'3px 9px', borderRadius:7, fontSize:11, fontWeight:700, background:'var(--abg)', border:'1.5px solid var(--aborder)', color:'var(--accent)', fontFamily:'monospace' }}>
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* YouTube embed — URL mode only */}
        {!uploadedFile && (
          <div>
            <button onClick={() => setEmbed(v=>!v)} className="btn btn-g btn-sm" style={{ width:'100%', marginBottom: embed ? 10 : 0 }}>
              {embed ? '▲ Hide Preview' : '▶ Preview on YouTube'}
            </button>
            {embed && <div className="yt"><iframe src={`https://www.youtube.com/embed/${videoId}?start=${sec}&rel=0&modestbranding=1`} title="Preview" allowFullScreen allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture"/></div>}
          </div>
        )}

        {/* Footer actions */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:8, borderTop:'1px solid var(--border2)', gap:8, flexWrap:'wrap' }}>
          <span style={{ fontSize:11, color:'var(--subtle)', fontFamily:'monospace' }}>~{clip.clipDuration}s</span>
          <div style={{ display:'flex', gap:7, flexWrap:'wrap' }}>
            <DlBtn clip={clip} videoId={videoId} uploadedFile={uploadedFile}/>
            <CopyBtn text={all} id={`a${clip.id}`} label="All" copy={copy} cid={cid}/>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Skeleton ───────────────────────────────────────────────────── */
function Skeleton() {
  return (
    <div className="container" style={{ paddingTop:24, paddingBottom:60 }}>
      <div style={{ display:'flex', justifyContent:'center', marginBottom:28 }}>
        <div className="card" style={{ padding:'12px 24px', display:'flex', alignItems:'center', gap:12 }}>
          {[0,1,2].map(i => (
            <span key={i} style={{ width:8, height:8, borderRadius:'50%', background:'var(--accent)', display:'inline-block', animation:`wave .85s ease-in-out ${i*.15}s infinite` }}/>
          ))}
          <span style={{ fontSize:13.5, color:'var(--muted)', marginLeft:4 }}>AI scanning for viral moments…</span>
        </div>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
        {[0,1,2].map(i => (
          <div key={i} className="card" style={{ padding:18, display:'flex', flexDirection:'column', gap:12 }}>
            <div style={{ display:'flex', justifyContent:'space-between' }}>
              <div className="shim" style={{ height:18, width:80, borderRadius:7 }}/>
              <div className="shim" style={{ height:34, width:34, borderRadius:'50%' }}/>
            </div>
            <div className="shim" style={{ height:50, width:'100%', borderRadius:11 }}/>
            {[85,65,100,55].map((w,j) => <div key={j} className="shim" style={{ height:11, width:`${w}%` }}/>)}
            <div style={{ display:'flex', gap:6 }}>{[60,80,65].map((w,j) => <div key={j} className="shim" style={{ height:20, width:w, borderRadius:99 }}/>)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Blog panel ─────────────────────────────────────────────────── */
function BlogPanel({ content }) {
  const [open, setOpen] = useState(false);
  const { copy, cid } = useCopy();
  return (
    <div className="card" style={{ marginBottom:16, overflow:'hidden' }}>
      <button onClick={() => setOpen(v=>!v)} style={{ width:'100%', padding:'14px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', background:'none', border:'none', cursor:'pointer', gap:10 }}>
        <div style={{ display:'flex', alignItems:'center', gap:11 }}>
          <div style={{ width:34, height:34, borderRadius:10, background:'var(--abg)', border:'1.5px solid var(--aborder)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>📄</div>
          <div style={{ textAlign:'left' }}>
            <div style={{ fontWeight:800, fontSize:13.5, color:'var(--ink)' }}>Blog Post Summary</div>
            <div style={{ fontSize:11.5, color:'var(--subtle)', marginTop:1 }}>AI-generated · ready to publish</div>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
          <button onClick={async e => { e.stopPropagation(); const ok = await copy(content,'blog'); if(ok) toast('Blog copied'); }}
            className="btn btn-g btn-sm" style={{ color: cid==='blog' ? 'var(--green)':undefined }}>
            {cid==='blog' ? '✓' : '⎘'}
          </button>
          <span style={{ color:'var(--subtle)', fontSize:12, transform:open?'rotate(180deg)':'none', transition:'transform .2s', display:'inline-block' }}>▼</span>
        </div>
      </button>
      {open && (
        <div style={{ padding:'0 16px 16px', fontSize:13.5, color:'var(--muted)', lineHeight:1.9, borderTop:'1px solid var(--border2)', paddingTop:14, whiteSpace:'pre-wrap' }}>
          {content}
        </div>
      )}
    </div>
  );
}

/* ── Drop zone ──────────────────────────────────────────────────── */
function DropZone({ file, onFile }) {
  const [drag, setDrag] = useState(false);
  const ref = useRef(null);
  function handleFiles(files) {
    const f = files?.[0];
    if (f && f.type.startsWith('video/')) onFile(f);
    else toast('Select a video file (MP4, MOV, AVI…)', 'error');
  }
  return (
    <div
      className={`drop${drag ? ' drag' : ''}`}
      onDragOver={e => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={e => { e.preventDefault(); setDrag(false); handleFiles(e.dataTransfer.files); }}
      onClick={() => ref.current?.click()}
    >
      <input ref={ref} type="file" accept="video/*" style={{ display:'none' }} onChange={e => handleFiles(e.target.files)}/>
      <div style={{ fontSize:36, marginBottom:10 }}>{file ? '✅' : '🎬'}</div>
      <div style={{ fontWeight:800, fontSize:14, color:'var(--ink)', marginBottom:4 }}>
        {file ? file.name : 'Drop your video here'}
      </div>
      <div style={{ fontSize:12.5, color:'var(--muted)' }}>
        {file ? `${(file.size/1024/1024).toFixed(1)} MB · tap to change` : 'MP4, MOV, AVI, MKV · up to 2 GB'}
      </div>
    </div>
  );
}

/* ── Save-tube info box ─────────────────────────────────────────── */
function SaveTubeBox({ videoId }) {
  const href = "https://save-tube.com/";
  return (
    <div style={{ padding:'12px 14px', borderRadius:13, background:'var(--abg)', border:'1.5px solid var(--aborder)', fontSize:13, lineHeight:1.7 }}>
      <div style={{ fontWeight:800, color:'var(--accent)', marginBottom:3 }}>📥 Need to download the YouTube video first?</div>
      <div style={{ color:'var(--muted)' }}>
        Use{' '}
        <a href={href} target="_blank" rel="noopener noreferrer"
          style={{ color:'var(--accent)', fontWeight:800, borderBottom:'1px solid var(--aborder)' }}>
          save-tube.com ↗
        </a>
        {' '}— paste the URL, download the MP4, then upload it here for FFmpeg clip cutting.
      </div>
    </div>
  );
}

/* ── FFmpeg error info ──────────────────────────────────────────── */
function FfmpegInfo() {
  return (
    <div style={{ padding:'12px 14px', borderRadius:13, background:'rgba(239,68,68,.08)', border:'1.5px solid rgba(239,68,68,.22)', fontSize:13, lineHeight:1.75, marginTop:8 }}>
      <div style={{ fontWeight:800, color:'var(--red)', marginBottom:3 }}>⚠️ FFmpeg not found on server</div>
      <div style={{ color:'var(--muted)' }}>
        To enable clip cutting, install FFmpeg:<br/>
        <code style={{ background:'var(--surface2)', padding:'1px 6px', borderRadius:5, fontSize:12 }}>
          {navigator.platform?.includes('Win') ? 'winget install ffmpeg' : 'brew install ffmpeg'}
        </code>
        {' '}or set <code style={{ background:'var(--surface2)', padding:'1px 6px', borderRadius:5, fontSize:12 }}>FFMPEG_PATH</code> env var pointing to your ffmpeg binary, then restart the backend.
      </div>
    </div>
  );
}

/* ── Phone reel visual ──────────────────────────────────────────── */
const REEL = [
  { bg:'linear-gradient(150deg,#6366f1,#4f46e5)', e:'😱', sc:96 },
  { bg:'linear-gradient(150deg,#f59e0b,#d97706)', e:'🧠', sc:91 },
  { bg:'linear-gradient(150deg,#22c55e,#16a34a)', e:'💡', sc:88 },
  { bg:'linear-gradient(150deg,#8b5cf6,#7c3aed)', e:'🔥', sc:94 },
  { bg:'linear-gradient(150deg,#06b6d4,#0891b2)', e:'😂', sc:82 },
  { bg:'linear-gradient(150deg,#ec4899,#db2777)', e:'🌟', sc:89 },
];

function Phone({ style = {}, speed = 12 }) {
  const all = [...REEL, ...REEL];
  return (
    <div style={{ width:150, height:300, borderRadius:32, border:'5px solid var(--border)', background:'var(--surface)', boxShadow:'var(--sh3)', overflow:'hidden', position:'relative', flexShrink:0, ...style }}>
      <div style={{ position:'absolute', top:8, left:'50%', transform:'translateX(-50%)', width:40, height:12, background:'var(--bg)', borderRadius:99, zIndex:10 }}/>
      <div style={{ display:'flex', flexDirection:'column', animation:`reel ${speed}s linear infinite` }}>
        {all.map((r, i) => (
          <div key={i} style={{ width:'100%', height:200, background:r.bg, flexShrink:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:5, position:'relative' }}>
            <span style={{ fontSize:26 }}>{r.e}</span>
            <span style={{fontSize: 8, backgroundColor: "white", color: "black", borderRadius: "25px", padding: "0 4px", position: "absolute", left: 5, bottom: 5}}>✂️ Viral Video Chopper</span>
            <div style={{ position:'absolute', top:6, right:6, background:'rgba(0,0,0,.3)', borderRadius:99, padding:'2px 6px', fontSize:9, fontWeight:800, color:'white' }}>🔥{r.sc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Ticker ─────────────────────────────────────────────────────── */
function Ticker() {
  const items = ['✂️ Viral Clips','⚡ AI Hooks','🎬 FFmpeg Cuts','🔥 Viral Scores','#️⃣ Hashtags','📄 Blog','🚀 Free'];
  const all = [...items,...items,...items,...items];
  return (
    <div style={{ overflow:'hidden', borderTop:'1px solid var(--border)', borderBottom:'1px solid var(--border)', padding:'9px 0', background:'var(--bg2)', transition:'background .35s, border-color .35s' }}>
      <div style={{ display:'flex', gap:'40px', whiteSpace:'nowrap', animation:'tick 22s linear infinite' }}>
        {all.map((t,i) => <span key={i} style={{ fontSize:10.5, fontWeight:800, letterSpacing:'.1em', textTransform:'uppercase', color:'var(--subtle)' }}>{t}</span>)}
      </div>
    </div>
  );
}

/* ── How step ───────────────────────────────────────────────────── */
function Step({ n, icon, title, desc, color }) {
  return (
    <div className="card" style={{ padding:'28px 18px', textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center', gap:10, position:'relative', paddingTop:40 }}>
      <div style={{ position:'absolute', top:-13, left:'50%', transform:'translateX(-50%)', width:27, height:27, borderRadius:99, background:color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11.5, fontWeight:900, color:'white', boxShadow:`0 3px 10px ${color}55` }}>{n}</div>
      <div style={{ fontSize:30 }}>{icon}</div>
      <div style={{ fontWeight:800, fontSize:15.5, color:'var(--ink)' }}>{title}</div>
      <div style={{ fontSize:13, color:'var(--muted)', lineHeight:1.7 }}>{desc}</div>
    </div>
  );
}

/* ── Main App ───────────────────────────────────────────────────── */
export default function App() {
  const [dark, toggleTheme] = useTheme();
  const [mode, setMode]     = useState('url');
  const [url, setUrl]       = useState('');
  const [file, setFile]     = useState(null);
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState(null);
  const [error, setError]   = useState('');
  const [lastUrl, setLastUrl] = useState('');
  const [cold, setCold]     = useState(null);
  const [ffmpegErr, setFfmpegErr] = useState(false);
  const resultsRef = useRef(null);

  const canSubmit = mode === 'url' ? url.trim() : (file && url.trim());

  async function handleSubmit(e) {
    e?.preventDefault?.();
    if (!canSubmit || status === 'loading') return;
    const target = url.trim();
    setStatus('loading'); setError(''); setCold(null); setFfmpegErr(false);
    setLastUrl(target);

    const pingMs = await ping();
    if (pingMs > 3500) setCold(['backend','transcript','analysis']);
    const timer = setTimeout(() => setCold(p => p || ['model','transcript','analysis']), 8000);

    try {
      const data = await analyzeVideo(target);
      clearTimeout(timer); setCold(null);
      setResult(data); setStatus('success');
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior:'smooth', block:'start' }), 150);
    } catch(err) {
      clearTimeout(timer); setCold(null);
      setError(err.message || 'Something went wrong.'); setStatus('error');
    }
  }

  // Detect ffmpeg error from clip download
  function onFfmpegError() { setFfmpegErr(true); }

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', color:'var(--ink)', transition:'background .35s, color .35s' }}>
      {cold && status==='loading' && <ColdStartLoader phases={cold}/>}

      {/* Subtle mesh background */}
      <div style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none',
        background:'radial-gradient(ellipse 70% 50% at 15% 10%, rgba(99,102,241,.09) 0%, transparent 60%), radial-gradient(ellipse 55% 45% at 85% 85%, rgba(99,102,241,.07) 0%, transparent 60%)',
        transition:'background .5s' }}/>

      {/* ── NAV ───────────────────────────────────────────── */}
      <nav className="nav" style={{ gap:12 }}>
        <div style={{ display:'flex', alignItems:'center', gap:9, flex:1 }}>
          <div style={{ width:34, height:34, borderRadius:11, background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, boxShadow:'var(--shbtn)', flexShrink:0 }}>✂️</div>
          <span style={{ fontWeight:900, fontSize:16, color:'var(--ink)', letterSpacing:'-.3px' }}>Viral Video Chopper</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:12, flexShrink:0 }}>
          <span style={{ fontSize:14 }}>{dark ? '🌙' : '☀️'}</span>
          <button className={`tog ${dark ? 'on' : ''}`} onClick={toggleTheme} aria-label="Toggle theme"/>
        </div>
      </nav>

      {/* ── HERO ──────────────────────────────────────────── */}
      <section style={{ position:'relative', zIndex:1, padding:'clamp(44px,8vh,90px) 0 56px' }}>
        <div className="container">

          {/* Phones row — mobile: centered, small; desktop: right side */}
          <div className="phones-row" style={{ display:'flex', justifyContent:'center', gap:14, marginBottom:36, alignItems:'flex-end' }}>
            <Phone style={{ transform:'rotate(-12deg) translateY(14px)', opacity:.5 }} speed={14}/>
            <div style={{ position:'relative' }}>
              <div style={{ position:'absolute', inset:-20, borderRadius:'50%', background:'radial-gradient(circle, var(--abg) 0%, transparent 70%)', filter:'blur(14px)', animation:'glow 4s ease-in-out infinite' }}/>
              <Phone style={{ position:'relative', zIndex:1, transform: 'scale(1.1)'}} speed={11}/>
            </div>
            <Phone style={{ transform:'rotate(12deg) translateY(14px)', opacity:.5 }} speed={16}/>
          </div>

          {/* Badge */}
          <div className="a-up" style={{ textAlign:'center', marginBottom:16 }}>
            <span className="pill pill-a">✂️ AI-Powered Viral Clip Intelligence</span>
          </div>

          {/* Headline */}
          <h1 className="a-up" style={{ fontSize:'clamp(30px,6vw,58px)', fontWeight:900, lineHeight:1.08, letterSpacing:'-1px', color:'var(--ink)', textAlign:'center', marginBottom:14, animationDelay:'.06s' }}>
            Turn any video into<br/>
            <span style={{ color:'var(--accent)' }}>viral clips</span> instantly
          </h1>

          <p className="a-up" style={{ fontSize:'clamp(14px,2vw,16px)', color:'var(--muted)', lineHeight:1.8, textAlign:'center', marginBottom:28, maxWidth:440, margin:'0 auto 28px', animationDelay:'.12s' }}>
            Paste a YouTube URL or upload your video. AI finds the best moments and cuts the clips.
          </p>

          {/* Card hero — input area */}
          <div className="card-hero a-up" style={{ padding:'20px 16px', marginBottom:20, animationDelay:'.18s' }}>

            {/* Mode tabs */}
            <div className="tabs" style={{ marginBottom:16 }}>
              <button className={`tab ${mode==='url' ? 'on':''}`} onClick={() => setMode('url')}>🔗 YouTube URL</button>
              <button className={`tab ${mode==='upload' ? 'on':''}`} onClick={() => setMode('upload')}>📁 Upload Video</button>
            </div>

            {/* URL mode */}
            {mode === 'url' && (
              <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:10 }}>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                  <input type="url" value={url} onChange={e => setUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="inp" style={{ flex:'1 1 200px', fontSize:14 }}
                    disabled={status==='loading'}/>
                  <button type="submit" disabled={status==='loading'||!url.trim()} className="btn btn-p btn-lg">
                    {status==='loading' ? <><Spin color="white"/>Analyzing…</> : <>✂️ Chop It</>}
                  </button>
                </div>
              </form>
            )}

            {/* Upload mode */}
            {mode === 'upload' && (
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                <DropZone file={file} onFile={setFile}/>
                <SaveTubeBox videoId={null}/>
                <input type="url" value={url} onChange={e => setUrl(e.target.value)}
                  placeholder="Paste YouTube URL for transcript…"
                  className="inp"
                  disabled={status==='loading'}/>
                {ffmpegErr && <FfmpegInfo/>}
                <button onClick={handleSubmit} disabled={status==='loading'||!file||!url.trim()}
                  className="btn btn-p btn-lg btn-full">
                  {status==='loading' ? <><Spin color="white"/>Analyzing…</> : <>✂️ Analyze & Prepare Clips</>}
                </button>
              </div>
            )}
          </div>

          {/* Feature pills — horizontal scroll on mobile */}
          <div className="a-up" style={{ display:'flex', gap:7, overflowX:'auto', paddingBottom:4, animationDelay:'.24s', WebkitOverflowScrolling:'touch', scrollbarWidth:'none' }}>
            {['🎬 Timestamps','🪝 AI Hooks','🔥 Scores','#️⃣ Hashtags','↓ Clip Download','📄 Blog Summary'].map(f => (
              <span key={f} className="pill" style={{ fontSize:11.5, flexShrink:0 }}>{f}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── TICKER ────────────────────────────────────────── */}
      <div style={{ position:'relative', zIndex:1 }}><Ticker/></div>

      {/* ── STATS ─────────────────────────────────────────── */}
      <section style={{ position:'relative', zIndex:1, padding:'56px 0' }}>
        <div className="container">
          <div className="stats-grid" style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'28px 20px' }}>
            {[['50K+','Videos analyzed'],['350K+','Clips generated'],['98%','Accuracy'],['~15s','Per video']].map(([v,l]) => (
              <div key={l} style={{ textAlign:'center', padding:'16px 8px', background:'var(--surface)', border:'1.5px solid var(--border)', borderRadius:16, boxShadow:'var(--sh1)' }}>
                <div style={{ fontSize:'clamp(24px,5vw,36px)', fontWeight:900, color:'var(--accent)', letterSpacing:'-.5px' }}>{v}</div>
                <div style={{ fontSize:12.5, color:'var(--muted)', marginTop:3, fontWeight:600 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="div"/>

      {/* ── HOW IT WORKS ──────────────────────────────────── */}
      <section id="how" style={{ position:'relative', zIndex:1, padding:'60px 0' }}>
        <div className="container">
          <div style={{ textAlign:'center', marginBottom:40 }}>
            <div className="slabel" style={{ justifyContent:'center', marginBottom:10 }}>⚡ How It Works</div>
            <h2 style={{ fontSize:'clamp(22px,4vw,38px)', fontWeight:900, color:'var(--ink)', letterSpacing:'-.4px' }}>Three steps to going viral</h2>
          </div>
          {/* Vertical stack on mobile, grid on larger screens */}
          <div className="steps-grid" style={{ display:'grid', gridTemplateColumns:'1fr', gap:16 }}>
            <Step n="1" icon="🔗" title="Paste or Upload" desc="Drop a YouTube URL or upload your own MP4/MOV. We handle the transcript automatically." color="var(--accent)"/>
            <Step n="2" icon="🤖" title="AI Scans It" desc="Free AI reads every word and pinpoints 5–8 viral moments ranked by emotional impact." color="var(--orange)"/>
            <Step n="3" icon="↓" title="Download Clips" desc="Get hooks, captions, hashtags, and download FFmpeg-cut MP4 clips ready to post." color="var(--green)"/>
          </div>
        </div>
      </section>

      <div className="div"/>

      {/* ── FREE AI PROVIDERS ─────────────────────────────── */}
      <section style={{ position:'relative', zIndex:1, padding:'60px 0' }}>
        <div className="container">
          <div style={{ textAlign:'center', marginBottom:36 }}>
            <div className="slabel" style={{ justifyContent:'center', marginBottom:10 }}>🆓 Free AI</div>
            <h2 style={{ fontSize:'clamp(20px,4vw,34px)', fontWeight:900, color:'var(--ink)', letterSpacing:'-.3px' }}>No credit card. No subscription.</h2>
          </div>
          <div className="providers-grid" style={{ display:'grid', gridTemplateColumns:'1fr', gap:12 }}>
            {[
              { name:'Hugging Face', model:'Mistral-7B-Instruct', e:'🤗', note:'Default · free token at huggingface.co', c:'var(--orange)' },
              { name:'Groq', model:'Llama-3 70B', e:'⚡', note:'Fastest · free at console.groq.com', c:'var(--accent)' },
              { name:'OpenRouter', model:'Mistral-7B Free', e:'🌐', note:'Free tier · openrouter.ai', c:'var(--green)' },
            ].map(p => (
              <div key={p.name} className="card" style={{ padding:'18px 16px', display:'flex', alignItems:'center', gap:14 }}>
                <div style={{ fontSize:28, flexShrink:0 }}>{p.e}</div>
                <div>
                  <div style={{ fontWeight:800, fontSize:15, color:'var(--ink)', marginBottom:2 }}>{p.name}</div>
                  <div style={{ fontFamily:'monospace', fontSize:11.5, color:p.c, marginBottom:3 }}>{p.model}</div>
                  <div style={{ fontSize:12.5, color:'var(--subtle)' }}>{p.note}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────── */}
      <section style={{ position:'relative', zIndex:1, padding:'40px 0 80px' }}>
        <div className="container">
          <div className="card-hero" style={{ padding:'40px 20px', textAlign:'center' }}>
            <div style={{ fontSize:44, marginBottom:14, display:'inline-block', animation:'float 6s ease-in-out infinite' }}>✂️</div>
            <h2 style={{ fontSize:'clamp(20px,3.5vw,32px)', fontWeight:900, color:'var(--ink)', marginBottom:10, letterSpacing:'-.3px' }}>Ready to chop your first video?</h2>
            <p style={{ fontSize:14, color:'var(--muted)', marginBottom:28, lineHeight:1.8 }}>Under 30 seconds. No signup. Completely free.</p>
            <button onClick={() => window.scrollTo({ top:0, behavior:'smooth' })} className="btn btn-p btn-lg btn-full" style={{ maxWidth:280, margin:'0 auto' }}>
              ✂️ Get Started Free →
            </button>
            <div style={{ display:'flex', flexDirection:'column', gap:6, marginTop:22, alignItems:'center' }}>
              {['✅ Completely free','✅ No signup needed','✅ FFmpeg clip cutting','✅ Open source AI'].map(f => (
                <span key={f} style={{ fontSize:13, color:'var(--muted)', fontWeight:600 }}>{f}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── RESULTS ───────────────────────────────────────── */}
      <div ref={resultsRef} style={{ position:'relative', zIndex:1, scrollMarginTop:60 }}>

        {status==='loading' && !cold && <Skeleton/>}

        {status==='error' && (
          <div className="container" style={{ paddingTop:24, paddingBottom:60 }}>
            <div className="card" style={{ padding:'36px 20px', textAlign:'center' }}>
              <div style={{ fontSize:44, marginBottom:14 }}>⚠️</div>
              <h3 style={{ fontWeight:900, fontSize:18, color:'var(--ink)', marginBottom:10 }}>Something went wrong</h3>
              <p style={{ color:'var(--muted)', fontSize:13.5, lineHeight:1.75, marginBottom:24 }}>{error}</p>
              <button onClick={() => handleSubmit()} className="btn btn-p btn-full" style={{ maxWidth:200, margin:'0 auto' }}>🔄 Try Again</button>
              <div className="card-inset" style={{ marginTop:18, padding:'10px 14px' }}>
                <p style={{ fontSize:12.5, color:'var(--subtle)', lineHeight:1.65 }}>💡 Make sure the video has captions enabled and is public.</p>
              </div>
            </div>
          </div>
        )}

        {status==='success' && result && (
          <div className="container" style={{ paddingTop:24, paddingBottom:60 }}>

            {/* Stats strip */}
            <div className="card" style={{ padding:'14px 16px', marginBottom:16, display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
              {[
                { l:'Clips', v:result.stats.clipsFound, i:'✂️' },
                { l:'Words', v:result.stats.wordCount?.toLocaleString(), i:'📖' },
                { l:'Length', v:`${Math.floor(result.stats.duration/60)}:${String(result.stats.duration%60).padStart(2,'0')}`, i:'⏱' },
              ].map(s => (
                <div key={s.l} style={{ textAlign:'center' }}>
                  <div style={{ fontSize:18, fontWeight:900, color:'var(--ink)' }}>{s.i} {s.v}</div>
                  <div style={{ fontSize:10.5, fontWeight:800, letterSpacing:'.08em', textTransform:'uppercase', color:'var(--subtle)', marginTop:2 }}>{s.l}</div>
                </div>
              ))}
            </div>

            {/* Save-tube tip in URL mode */}
            {!file && (
              <div style={{ marginBottom:14 }}>
                <SaveTubeBox videoId={result.videoId}/>
              </div>
            )}

            {/* Upload mode banner */}
            {file && (
              <div style={{ marginBottom:14, padding:'11px 14px', borderRadius:13, background:'var(--gbg)', border:'1.5px solid rgba(34,197,94,.3)', fontSize:13, color:'var(--green)', fontWeight:700 }}>
                📁 Upload mode — each "↓ Download Clip" cuts "{file.name}" with FFmpeg.
              </div>
            )}

            {ffmpegErr && <FfmpegInfo/>}

            {result.blogSummary && <BlogPanel content={result.blogSummary}/>}

            {/* Clips header */}
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14, marginTop:4 }}>
              <h2 style={{ fontWeight:900, fontSize:22, color:'var(--ink)' }}>🔥 Viral Clips</h2>
              <span className="pill pill-a">{result.clips.length} found</span>
            </div>

            {/* Clip cards — single column on mobile, 2 col on wider */}
            <div className="clips-grid" style={{ display:'grid', gridTemplateColumns:'1fr', gap:14 }}>
              {result.clips.map((clip, i) => (
                <ClipCard key={clip.id} clip={clip} index={i} videoId={result.videoId} uploadedFile={file}/>
              ))}
            </div>

            <div style={{ textAlign:'center', marginTop:36 }}>
              <button onClick={() => { setStatus('idle'); setResult(null); setUrl(''); setFile(null); window.scrollTo({ top:0, behavior:'smooth' }); }}
                className="btn btn-p btn-full" style={{ maxWidth:260, margin:'0 auto' }}>
                ✂️ Chop Another Video
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── FOOTER ────────────────────────────────────────── */}
      <footer style={{ position:'relative', zIndex:1, borderTop:'1px solid var(--border)', padding:'24px 16px', display:'flex', flexDirection:'column', alignItems:'center', gap:10, background:'var(--bg)', transition:'background .35s, border-color .35s', textAlign:'center' }}>
        <div style={{ display:'flex', alignItems:'center', gap:9 }}>
          <div style={{ width:30, height:30, borderRadius:10, background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>✂️</div>
          <span style={{ fontWeight:900, fontSize:15, color:'var(--ink)' }}>Viral Video Chopper</span>
        </div>
        <p style={{ fontSize:12, color:'var(--subtle)' }}>Powered by Hugging Face · Groq · OpenRouter · React · FFmpeg</p>
      </footer>

      <ToastContainer/>
    </div>
  );
}

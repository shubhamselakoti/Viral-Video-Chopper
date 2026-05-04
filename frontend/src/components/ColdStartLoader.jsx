import React, { useState, useEffect, useRef } from 'react';

const PHASES = [
  {
    id:'backend', icon:'🚀', title:'Waking up the server',
    subtitle:'Render free tier sleeps after 15 min of inactivity',
    color:'#06b6d4', duration:12000,
    steps:[
      {ms:0,    msg:'Pinging the backend server…'},
      {ms:2500, msg:'Server spinning up from sleep 💤'},
      {ms:5500, msg:'Loading Node.js runtime…'},
      {ms:9000, msg:'Express server almost ready…'},
      {ms:11500,msg:'Backend online ✓'},
    ],
  },
  {
    id:'model', icon:'🧠', title:'Loading the AI model',
    subtitle:'Mistral-7B on Hugging Face takes ~20s to warm up',
    color:'#8b5cf6', duration:22000,
    steps:[
      {ms:0,    msg:'Connecting to Hugging Face API…'},
      {ms:3500, msg:'Requesting Mistral-7B-Instruct…'},
      {ms:8000, msg:'Model container booting 🏗️'},
      {ms:13000,msg:'Loading 7 billion parameters…'},
      {ms:18000,msg:'Running warm-up inference…'},
      {ms:21500,msg:'AI model ready 🔥'},
    ],
  },
  {
    id:'transcript', icon:'📜', title:'Fetching transcript',
    subtitle:'Pulling captions from YouTube',
    color:'#f59e0b', duration:8000,
    steps:[
      {ms:0,   msg:'Extracting video ID from URL…'},
      {ms:2500,msg:'Fetching transcript from YouTube…'},
      {ms:5500,msg:'Processing caption timestamps…'},
      {ms:7500,msg:'Transcript ready ✓'},
    ],
  },
  {
    id:'analysis', icon:'⚡', title:'Scanning for viral moments',
    subtitle:'Detecting emotional peaks and punchlines',
    color:'#6366f1', duration:18000,
    steps:[
      {ms:0,    msg:'Sending transcript to AI…'},
      {ms:3000, msg:'Scanning for emotional peaks 😱'},
      {ms:7000, msg:'Detecting punchlines and plot twists…'},
      {ms:11000,msg:'Scoring each moment for virality…'},
      {ms:14000,msg:'Writing hooks and captions…'},
      {ms:17000,msg:'Finalising viral scores…'},
    ],
  },
];

const TIPS = [
  '💡 Clips rated above 85 typically get 3× more engagement',
  '🎯 The best hooks create a curiosity gap in under 8 words',
  '📱 Reels between 7–15 seconds consistently get the most shares',
  '🔥 Surprising moments always outperform expected content',
  '⏰ The first 3 seconds decide if someone keeps watching',
  '📊 Adding captions increases watch time by up to 40%',
  '🚀 Posting 3+ Reels per week compounds your reach',
  '🎬 Vertical 9:16 crops get 3× more reach than landscape',
];

export function ColdStartLoader({ phases: ids = ['backend','model','transcript','analysis'] }) {
  const phases = PHASES.filter(p => ids.includes(p.id));
  const total  = phases.reduce((s,p) => s+p.duration, 0);

  const [activeIdx, setActiveIdx] = useState(0);
  const [msg,       setMsg]       = useState(phases[0]?.steps[0]?.msg || '');
  const [pct,       setPct]       = useState(0);
  const [elapsed,   setElapsed]   = useState(0);
  const [tipIdx,    setTipIdx]    = useState(0);
  const t0 = useRef(Date.now());
  const active = phases[activeIdx] || phases[0];

  useEffect(() => {
    const iv = setInterval(() => setElapsed(Date.now()-t0.current), 400);
    return () => clearInterval(iv);
  },[]);

  useEffect(() => {
    const iv = setInterval(() => setTipIdx(i => (i+1) % TIPS.length), 5000);
    return () => clearInterval(iv);
  },[]);

  useEffect(() => {
    const timers = [];
    let off = 0;
    phases.forEach((phase, pi) => {
      timers.push(setTimeout(() => setActiveIdx(pi), off));
      phase.steps.forEach(s => timers.push(setTimeout(() => setMsg(s.msg), off+s.ms)));
      for (let t=0; t<=phase.duration; t+=200) {
        const snap = off+t;
        timers.push(setTimeout(() => setPct(Math.min(99,(snap/total)*100)), snap));
      }
      off += phase.duration;
    });
    return () => timers.forEach(clearTimeout);
  },[]); // eslint-disable-line

  const R=40, C=2*Math.PI*R;

  return (
    <>
      <style>{`
        @keyframes cl-bounce{0%,100%{transform:translateY(0);opacity:1}50%{transform:translateY(-5px);opacity:.6}}
        @keyframes cl-in{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes cl-tip{0%{opacity:0;transform:translateX(9px)}12%,88%{opacity:1;transform:translateX(0)}100%{opacity:0;transform:translateX(-9px)}}
        @keyframes cl-glow{0%,100%{opacity:.3}50%{opacity:.65}}
        @keyframes cl-msg{from{opacity:0}to{opacity:1}}
      `}</style>

      <div style={{
        position:'fixed',inset:0,zIndex:9999,
        background:'var(--bg)',
        display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
        padding:'20px 16px',transition:'background .35s',
        overflowY:'auto',
      }}>
        {/* Ambient glow */}
        <div style={{
          position:'absolute',top:'10%',left:'50%',transform:'translateX(-50%)',
          width:'70vw',height:'40vw',borderRadius:'50%',
          background:`radial-gradient(circle,${active.color}18 0%,transparent 70%)`,
          filter:'blur(60px)',pointerEvents:'none',
          transition:'background 1.2s ease',animation:'cl-glow 4s ease-in-out infinite',
        }}/>

        <div style={{
          position:'relative',zIndex:1,width:'100%',maxWidth:420,
          animation:'cl-in .55s cubic-bezier(.34,1.2,.64,1)',
        }}>

          {/* Logo */}
          <div style={{display:'flex',alignItems:'center',gap:11,justifyContent:'center',marginBottom:32}}>
            <div style={{width:36,height:36,borderRadius:12,background:'var(--accent)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:17,boxShadow:'var(--shbtn)'}}>✂️</div>
            <span style={{fontWeight:900,fontSize:18,color:'var(--ink)',letterSpacing:'-.3px'}}>Viral Video Chopper</span>
          </div>

          {/* Ring */}
          <div style={{textAlign:'center',marginBottom:28}}>
            <div style={{position:'relative',display:'inline-flex',alignItems:'center',justifyContent:'center',marginBottom:16}}>
              <svg width={96} height={96} viewBox="0 0 96 96" style={{position:'absolute'}}>
                <circle cx={48} cy={48} r={R} fill="none" stroke="var(--border)" strokeWidth={3} transform="rotate(-90 48 48)"/>
                <circle cx={48} cy={48} r={R} fill="none"
                  stroke={active.color} strokeWidth={3} strokeLinecap="round"
                  strokeDasharray={`${(pct/100)*C} ${C}`} transform="rotate(-90 48 48)"
                  style={{transition:'stroke-dasharray .7s ease,stroke 1s ease',filter:`drop-shadow(0 0 5px ${active.color}88)`}}/>
              </svg>
              <div style={{
                width:70,height:70,borderRadius:'50%',
                background:`${active.color}13`,border:`1.5px solid ${active.color}33`,
                display:'flex',alignItems:'center',justifyContent:'center',
                fontSize:26,transition:'all .6s ease',
              }}>{active.icon}</div>
            </div>

            <h2 style={{fontWeight:900,fontSize:19,color:'var(--ink)',marginBottom:6,letterSpacing:'-.2px',transition:'all .4s'}}>
              {active.title}
            </h2>
            <p key={msg} style={{fontSize:13.5,color:'var(--muted)',margin:0,minHeight:20,animation:'cl-msg .4s ease'}}>
              {msg}
            </p>
          </div>

          {/* Progress bar */}
          <div style={{height:3,borderRadius:99,background:'var(--border)',overflow:'hidden',marginBottom:6}}>
            <div style={{
              height:'100%',borderRadius:99,
              background:`linear-gradient(90deg,${active.color},${active.color}99)`,
              width:`${pct}%`,transition:'width .7s ease,background 1s ease',
              boxShadow:`0 0 8px ${active.color}55`,
            }}/>
          </div>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:20}}>
            <span style={{fontFamily:'monospace',fontSize:11,color:'var(--subtle)'}}>{Math.floor(elapsed/1000)}s elapsed</span>
            <span style={{fontFamily:'monospace',fontSize:11,fontWeight:700,color:active.color,transition:'color 1s'}}>{Math.round(pct)}%</span>
          </div>

          {/* Phase rows */}
          <div style={{display:'flex',flexDirection:'column',gap:7,marginBottom:20}}>
            {phases.map((p,i) => {
              const st = i<activeIdx ? 'done' : i===activeIdx ? 'active' : 'pending';
              return (
                <div key={p.id} style={{
                  display:'flex',alignItems:'center',gap:12,
                  padding:'10px 13px',borderRadius:14,
                  background:st==='active' ? `${p.color}0d`:'transparent',
                  border:`1.5px solid ${st==='active' ? p.color+'33':'var(--border)'}`,
                  transition:'all .4s ease',
                }}>
                  <div style={{
                    width:34,height:34,borderRadius:11,flexShrink:0,
                    background:st==='done'?'var(--gbg)':st==='active'?`${p.color}14`:'var(--surface2)',
                    border:`1.5px solid ${st==='done'?'rgba(34,197,94,.35)':st==='active'?p.color+'44':'var(--border)'}`,
                    display:'flex',alignItems:'center',justifyContent:'center',
                    fontSize:15,transition:'all .4s ease',
                    boxShadow:st==='active'?`0 0 12px ${p.color}33`:'none',
                  }}>{st==='done'?'✓':p.icon}</div>

                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:800,fontSize:13,color:st==='pending'?'var(--subtle)':'var(--ink)',marginBottom:2,transition:'color .4s'}}>
                      {p.title}
                    </div>
                    <div style={{fontSize:11,color:'var(--subtle)',lineHeight:1.5}}>{p.subtitle}</div>
                  </div>

                  <div style={{flexShrink:0}}>
                    {st==='done' && <span style={{fontSize:11.5,fontWeight:800,color:'var(--green)'}}>Done</span>}
                    {st==='active' && (
                      <div style={{display:'flex',gap:4}}>
                        {[0,1,2].map(j=>(
                          <div key={j} style={{width:6,height:6,borderRadius:'50%',background:p.color,animation:'cl-bounce .9s ease-in-out infinite',animationDelay:`${j*.18}s`}}/>
                        ))}
                      </div>
                    )}
                    {st==='pending' && <div style={{width:17,height:17,borderRadius:'50%',border:'1.5px solid var(--border)'}}/>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tip */}
          <div style={{padding:'12px 16px',borderRadius:14,background:'var(--surface2)',border:'1.5px solid var(--border)',textAlign:'center',minHeight:50,display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden'}}>
            <p key={tipIdx} style={{fontSize:12.5,color:'var(--muted)',margin:0,lineHeight:1.65,animation:'cl-tip 5s ease forwards'}}>
              {TIPS[tipIdx]}
            </p>
          </div>

          <p style={{textAlign:'center',fontSize:11.5,color:'var(--subtle)',marginTop:16,lineHeight:1.7}}>
            Free servers sleep after 15 min of inactivity.<br/>Next requests are instant.
          </p>
        </div>
      </div>
    </>
  );
}

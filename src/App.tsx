import { useEffect, useMemo, useState } from 'react';

type Entry = { mood: string; note: string };
const moods = [
  { id: 'joyeux', icon: '🥰', name: 'Joyeuse', flower: '🌸', color: '#f7b2cf' },
  { id: 'calme', icon: '😌', name: 'Calme', flower: '🌷', color: '#b7b0ef' },
  { id: 'fatigue', icon: '😴', name: 'Fatiguée', flower: '🌼', color: '#f8d68e' },
  { id: 'triste', icon: '🥺', name: 'Triste', flower: '🪻', color: '#a8c8f0' },
  { id: 'stress', icon: '😣', name: 'Stressée', flower: '🌻', color: '#d6b9a1' }
];
const today = () => new Date().toLocaleDateString('en-CA');
const storageKey = 'moodie:entries:v1';
function load(): Record<string, Entry> {
  try { const raw = localStorage.getItem(storageKey); return raw ? JSON.parse(raw) : {}; }
  catch { return {}; }
}
export default function App() {
  const [entries, setEntries] = useState<Record<string, Entry>>(load);
  const [selectedDate, setSelectedDate] = useState(today());
  const [draftMood, setDraftMood] = useState('');
  const [note, setNote] = useState('');
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [saved, setSaved] = useState(false);
  useEffect(() => { const e = entries[selectedDate]; setDraftMood(e?.mood ?? ''); setNote(e?.note ?? ''); setSaved(false); }, [selectedDate, entries]);
  const rows = Object.entries(entries).sort((a,b) => b[0].localeCompare(a[0]));
  const filled = rows.length;
  const current = moods.find(m => m.id === draftMood);
  const stats = useMemo(() => moods.map(m => ({...m, count: rows.filter(([,e]) => e.mood === m.id).length})), [entries]);
  const dominant = [...stats].sort((a,b)=>b.count-a.count)[0];
  const [year, mon] = month.split('-').map(Number);
  const firstDay = (new Date(year,mon-1,1).getDay()+6)%7;
  const days = new Date(year,mon,0).getDate();
  function shift(n: number) { const d = new Date(year,mon-1+n,1); setMonth(d.toISOString().slice(0,7)); }
  function save() {
    if (!draftMood) return;
    const next = {...entries,[selectedDate]:{mood:draftMood,note:note.trim()}};
    setEntries(next); localStorage.setItem(storageKey,JSON.stringify(next)); setSaved(true);
  }
  return <div className="app">
    <header className="topbar"><div className="brand"><span className="brandIcon">🌸</span><strong>moodie</strong><span className="brandDot">✦</span></div><span className="topNote">un petit coin de douceur ♡</span></header>
    <main>
      <section className="hero">
        <div className="heroCopy"><div className="eyebrow">✿ BONJOUR, PETITE FLEUR</div><h1>Fais fleurir tes <em>émotions.</em></h1><p>Un jour à la fois, prends soin de ton jardin intérieur. Chaque humeur est une fleur qui mérite sa place.</p><a href="#journal" className="heroBtn">Planter une émotion <span>↗</span></a></div>
        <div className="heroGarden" aria-label="Illustration d'un jardin fleuri"><div className="sun">☀️</div><div className="cloud cloud1">☁️</div><div className="cloud cloud2">☁️</div><div className="flower f1">🌸</div><div className="flower f2">🌷</div><div className="flower f3">🌻</div><div className="flower f4">🌼</div><div className="flower f5">🪻</div><div className="ground"></div><span className="heroCaption">ton jardin grandit avec toi ✨</span></div>
      </section>
      <div className="dashboard"><section className="panel journal" id="journal"><div className="panelTitle"><div><div className="eyebrow">01 / MON JOURNAL</div><h2>Comment tu te sens ? <span>💗</span></h2></div><span className="littleBadge">Aujourd'hui & chaque jour</span></div><label className="smallLabel" htmlFor="date">Choisis une journée</label><input id="date" type="date" max={today()} value={selectedDate} onChange={e=>setSelectedDate(e.target.value)} /><p className="smallLabel">Choisis ton humeur du jour</p><div className="moodGrid">{moods.map(m=><button key={m.id} className={'mood '+(draftMood===m.id?'active':'')} onClick={()=>setDraftMood(m.id)} type="button"><span className="emoji">{m.icon}</span><span>{m.name}</span></button>)}</div><label className="smallLabel" htmlFor="note">Un petit mot pour toi <span className="optional">(facultatif)</span></label><textarea id="note" value={note} maxLength={500} onChange={e=>setNote(e.target.value)} placeholder="Raconte ta journée, tes petites victoires, tes pensées..." rows={4}/><button className="saveBtn" onClick={save} disabled={!draftMood}>{saved?'✓ Fleur plantée !':'🌱 Planter ma fleur'}</button><div className="hint">{current ? current.flower+' Une '+current.name.toLowerCase()+' fleur va pousser dans ton jardin.':'Chaque émotion a sa place ici ♡'}</div></section>
      <section className="panel gardenPanel"><div className="panelTitle"><div><div className="eyebrow">02 / MON JARDIN</div><h2>Ton jardin secret <span>🌿</span></h2></div><span className="count">{filled} fleur{filled!==1?'s':''}</span></div><div className="personalGarden"><div className="sparkle">✧ &nbsp; ✨ &nbsp; ✧</div><div className="plants">{rows.length ? rows.slice(0,24).map(([date,e])=>{const m=moods.find(m=>m.id===e.mood); return <span className="plant" title={date+' · '+(m?.name||'')} key={date}>{m?.flower||'🌱'}</span>}) : <div className="emptyGarden"><div className="emptyEmoji">🌱</div><strong>Ton jardin t'attend !</strong><p>Enregistre ta première humeur pour voir ta première fleur.</p></div>}</div><div className="soil"></div></div><p className="gardenFooter">Chaque fleur représente un jour où tu as pris du temps pour toi ✿</p><div className="miniStats"><div><strong>{filled}</strong><span>jours enregistrés</span></div><div><strong>{filled? dominant.flower:'🌱'}</strong><span>fleur dominante</span></div></div></section>
      <section className="panel calendarPanel"><div className="panelTitle"><div><div className="eyebrow">03 / SOUVENIRS</div><h2>Calendrier fleuri <span>🗓️</span></h2></div></div><div className="monthBar"><button aria-label="Mois précédent" onClick={()=>shift(-1)}>‹</button><strong>{new Date(year,mon-1,1).toLocaleDateString('fr-FR',{month:'long',year:'numeric'})}</strong><button aria-label="Mois suivant" onClick={()=>shift(1)}>›</button></div><div className="calendar">{['L','M','M','J','V','S','D'].map((s,i)=><div className="weekday" key={i}>{s}</div>)}{Array.from({length:firstDay},(_,i)=><div key={'pad'+i}></div>)}{Array.from({length:days},(_,i)=>{const day=i+1;const date=month+'-'+String(day).padStart(2,'0');const e=entries[date];const m=moods.find(x=>x.id===e?.mood);return <button key={date} className={'day '+(date===selectedDate?'chosen ':'')+(date===today()?'today':'')} onClick={()=>setSelectedDate(date)} disabled={date>today()} title={m?.name||date}><span>{day}</span>{m&&<span className="dayFlower">{m.flower}</span>}</button>})}</div><p className="calendarHint">Clique sur un jour pour consulter ou modifier son humeur.</p></section>
      <section className="panel statsPanel"><div className="panelTitle"><div><div className="eyebrow">04 / PETITES VICTOIRES</div><h2>Mes émotions <span>📊</span></h2></div></div><p className="statsIntro">Toutes tes émotions sont importantes.</p><div className="bars">{stats.map(m=><div className="statRow" key={m.id}><span>{m.icon} {m.name}</span><div className="track"><div className="bar" style={{width:filled?m.count/filled*100+'%':'0%',background:m.color}}/></div><strong>{m.count}</strong></div>)}</div><div className="privacy">🔒 Tes souvenirs restent sur cet appareil, dans ton navigateur.</div></section></div>
    </main><footer>fait avec ♡ et beaucoup de fleurs · moodie © {new Date().getFullYear()}</footer>
  </div>
}
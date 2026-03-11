import { useState, useEffect, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════════════════════
   PERSISTENT STORAGE
═══════════════════════════════════════════════════════════════════════════ */
const DB = {
  async get(key) { try { const r = await window.storage.get(key); return r ? JSON.parse(r.value) : null; } catch { return null; } },
  async set(key, val) { try { await window.storage.set(key, JSON.stringify(val)); } catch {} },
};
const K = { SESSION:"stg_session", EVENTS:"stg_events", CONTRIBUTIONS:"stg_contribs", EXPENSES:"stg_expenses", GALLERY:"stg_gallery", TREASURER:"stg_treasurer" };

/* ═══════════════════════════════════════════════════════════════════════════
   SEED DATA
═══════════════════════════════════════════════════════════════════════════ */
const DEF_TREASURER = { username:"shivtej", password:"jai@shivaji2025", name:"Rajendra Patil", avatar:"RP" };

const DEF_EVENTS = [
  { id:"e1", name:"शिवजयंती उत्सव २०२५", date:"2025-02-19", budget:60000, category:"cultural", status:"upcoming",  description:"Grand Shivaji Maharaj birthday celebration with cultural programs" },
  { id:"e2", name:"Shivtej Krida Mahotsav", date:"2025-05-10", budget:35000, category:"sports",   status:"upcoming",  description:"Annual inter-group sports championship" },
  { id:"e3", name:"Kalakar Sandhya 2024",   date:"2024-11-20", budget:25000, category:"art",      status:"completed", description:"Cultural evening showcasing local artists" },
];

const DEF_CONTRIBS = [
  { id:"c1", memberName:"Suresh Jadhav",   eventId:"e1", amount:3000, date:"2025-01-10", status:"paid" },
  { id:"c2", memberName:"Priya Shinde",    eventId:"e1", amount:3000, date:"2025-01-15", status:"paid" },
  { id:"c3", memberName:"Akash More",      eventId:"e1", amount:3000, date:null,         status:"pending" },
  { id:"c4", memberName:"Sunita Kamble",   eventId:"e1", amount:3000, date:null,         status:"pending" },
  { id:"c5", memberName:"Ravi Deshmukh",   eventId:"e2", amount:2000, date:"2025-02-01", status:"paid" },
  { id:"c6", memberName:"Meena Pawar",     eventId:"e3", amount:1500, date:"2024-10-20", status:"paid" },
  { id:"c7", memberName:"Vijay Salunkhe",  eventId:"e3", amount:1500, date:"2024-10-22", status:"paid" },
  { id:"c8", memberName:"Lata Bhosale",    eventId:"e2", amount:2000, date:null,         status:"pending" },
];

const DEF_EXPENSES = [
  { id:"x1", eventId:"e1", title:"Venue Decoration",    amount:15000, date:"2025-01-20", category:"decor",     note:"Maidan decoration and lighting" },
  { id:"x2", eventId:"e1", title:"Sound System",        amount:10000, date:"2025-01-22", category:"equipment", note:"PA system rental" },
  { id:"x3", eventId:"e2", title:"Ground Booking",      amount:8000,  date:"2025-02-10", category:"venue",     note:"Municipal ground" },
  { id:"x4", eventId:"e3", title:"Stage Setup",         amount:9000,  date:"2024-10-10", category:"decor",     note:"Stage and backdrop" },
  { id:"x5", eventId:"e3", title:"Prize Distribution",  amount:6000,  date:"2024-11-20", category:"prizes",    note:"Certificates and trophies" },
];

const DEF_GALLERY = [
  { id:"g1", eventId:"e3", title:"Kalakar Sandhya Opening",  emoji:"🎭", color:"#8B1A1A", date:"2024-11-20" },
  { id:"g2", eventId:"e3", title:"Prize Ceremony",            emoji:"🏅", color:"#6B4A00", date:"2024-11-20" },
  { id:"g3", eventId:"e1", title:"Shivjayanti Preparation",   emoji:"⚔️", color:"#1A3A1A", date:"2025-01-15" },
];

/* ═══════════════════════════════════════════════════════════════════════════
   SHIVAJI MAHARAJ SVG ICON (custom sword/shield motif)
═══════════════════════════════════════════════════════════════════════════ */
const ShivajiIcon = ({ size = 32, color = "#d4a012" }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    {/* Crown/Mukut */}
    <path d="M20 28 L32 8 L44 28" stroke={color} strokeWidth="2.5" fill="none" strokeLinejoin="round"/>
    <circle cx="32" cy="8" r="3" fill={color}/>
    <circle cx="20" cy="28" r="2.5" fill={color}/>
    <circle cx="44" cy="28" r="2.5" fill={color}/>
    <path d="M16 28 L48 28 L46 36 L18 36 Z" stroke={color} strokeWidth="2" fill={color+"33"}/>
    {/* Face outline */}
    <path d="M24 36 Q24 50 32 54 Q40 50 40 36" stroke={color} strokeWidth="2" fill={color+"22"}/>
    {/* Moustache */}
    <path d="M27 44 Q32 47 37 44" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round"/>
    {/* Eyes */}
    <circle cx="28" cy="40" r="1.5" fill={color}/>
    <circle cx="36" cy="40" r="1.5" fill={color}/>
    {/* Sword below */}
    <line x1="32" y1="56" x2="32" y2="64" stroke={color} strokeWidth="3" strokeLinecap="round"/>
    <path d="M28 58 L36 58" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

/* Decorative rajmudra / seal */
const RajMudra = ({ size = 60, color = "#d4a012" }) => (
  <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
    <circle cx="30" cy="30" r="28" stroke={color} strokeWidth="1.5" strokeDasharray="4 3"/>
    <circle cx="30" cy="30" r="20" stroke={color} strokeWidth="1" opacity="0.5"/>
    {/* Sword */}
    <line x1="30" y1="8" x2="30" y2="52" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M26 14 L34 14" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M25 12 L35 16 M25 16 L35 12" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    {/* Shield */}
    <path d="M22 30 Q22 42 30 46 Q38 42 38 30 L38 24 L22 24 Z" stroke={color} strokeWidth="1.5" fill={color+"15"}/>
    {/* Star dots */}
    {[0,60,120,180,240,300].map((a,i)=>{
      const r=24, x=30+r*Math.cos(a*Math.PI/180), y=30+r*Math.sin(a*Math.PI/180);
      return <circle key={i} cx={x} cy={y} r="1.5" fill={color}/>;
    })}
  </svg>
);

/* ═══════════════════════════════════════════════════════════════════════════
   ICON ENGINE
═══════════════════════════════════════════════════════════════════════════ */
const IP = {
  home:"M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10",
  wallet:"M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z M16 3H8L4 7h16l-4-4z",
  cal:"M8 2v4 M16 2v4 M3 10h18 M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z",
  img:"M3 3h18v18H3z M3 9h18 M9 21V9",
  chart:"M18 20V10 M12 20V4 M6 20v-6",
  shield:"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  eye:"M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 100 6 3 3 0 000-6z",
  eyeoff:"M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94 M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19 M1 1l22 22",
  out:"M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4 M16 17l5-5-5-5 M21 12H9",
  trash:"M3 6h18 M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6 M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2",
  plus:"M12 5v14 M5 12h14",
  lock:"M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2z M7 11V7a5 5 0 0110 0v4",
  key:"M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4",
  settings:"M12 15a3 3 0 100-6 3 3 0 000 6z M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z",
};
const Ic = ({ n, s=20, c="currentColor" }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {IP[n]?.split(" M").map((d,i)=><path key={i} d={i===0?d:"M"+d}/>)}
  </svg>
);

const N = n => (n||0).toLocaleString("en-IN");

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN APP
═══════════════════════════════════════════════════════════════════════════ */
export default function App() {
  const [isTreasurer, setIsTreasurer] = useState(false);
  const [showLogin,   setShowLogin]   = useState(false);
  const [tab,         setTab]         = useState("home");
  const [toast,       setToast]       = useState(null);
  const [loading,     setLoading]     = useState(true);

  const [tCreds,   setTCreds]   = useState(DEF_TREASURER);
  const [events,   setEvents]   = useState(DEF_EVENTS);
  const [contribs, setContribs] = useState(DEF_CONTRIBS);
  const [expenses, setExpenses] = useState(DEF_EXPENSES);
  const [gallery,  setGallery]  = useState(DEF_GALLERY);

  /* Boot — load DB */
  useEffect(() => {
    (async () => {
      const [tc,ev,co,ex,ga,sess] = await Promise.all([DB.get(K.TREASURER),DB.get(K.EVENTS),DB.get(K.CONTRIBUTIONS),DB.get(K.EXPENSES),DB.get(K.GALLERY),DB.get(K.SESSION)]);
      if(tc) setTCreds(tc);     else await DB.set(K.TREASURER, DEF_TREASURER);
      if(ev) setEvents(ev);     else await DB.set(K.EVENTS, DEF_EVENTS);
      if(co) setContribs(co);   else await DB.set(K.CONTRIBUTIONS, DEF_CONTRIBS);
      if(ex) setExpenses(ex);   else await DB.set(K.EXPENSES, DEF_EXPENSES);
      if(ga) setGallery(ga);    else await DB.set(K.GALLERY, DEF_GALLERY);
      if(sess?.isTreasurer) setIsTreasurer(true);
      setLoading(false);
    })();
  }, []);

  const flash = (msg, ok=true) => { setToast({msg,ok}); setTimeout(()=>setToast(null),3200); };
  const persist = useCallback(async (key,data) => { await DB.set(key,data); },[]);

  const save = {
    event:    (ev) => { const u=[...events,ev];    setEvents(u);    persist(K.EVENTS,u);         flash("इव्हेंट जोडला ✓"); },
    expense:  (ex) => { const u=[...expenses,ex];  setExpenses(u);  persist(K.EXPENSES,u);        flash("खर्च नोंदवला ✓"); },
    contrib:  (c)  => { const u=[...contribs,c];   setContribs(u);  persist(K.CONTRIBUTIONS,u);   flash("वर्गणी नोंदवली ✓"); },
    markPaid: (id) => { const u=contribs.map(c=>c.id===id?{...c,status:"paid",date:new Date().toISOString().slice(0,10)}:c); setContribs(u); persist(K.CONTRIBUTIONS,u); flash("भरलेले म्हणून चिन्हांकित ✓"); },
    gallery:  (g)  => { const u=[...gallery,g];    setGallery(u);   persist(K.GALLERY,u);         flash("गॅलरीमध्ये जोडले ✓"); },
    delEvent: (id) => { const u=events.filter(e=>e.id!==id);    setEvents(u);   persist(K.EVENTS,u);   flash("इव्हेंट हटवला"); },
    delExp:   (id) => { const u=expenses.filter(e=>e.id!==id);  setExpenses(u); persist(K.EXPENSES,u); flash("खर्च हटवला"); },
    delGal:   (id) => { const u=gallery.filter(g=>g.id!==id);   setGallery(u);  persist(K.GALLERY,u);  flash("हटवले"); },
  };

  const loginTreasurer = async (u,p) => {
    if (u===tCreds.username && p===tCreds.password) {
      setIsTreasurer(true); setShowLogin(false);
      await DB.set(K.SESSION,{isTreasurer:true});
      flash("जय शिवाजी! Treasurer logged in ✓");
      return true;
    }
    return false;
  };
  const logout = async () => {
    setIsTreasurer(false); await DB.set(K.SESSION,null); flash("Logged out");
  };

  const totalCollected = contribs.filter(c=>c.status==="paid").reduce((s,c)=>s+c.amount,0);
  const totalPending   = contribs.filter(c=>c.status==="pending").reduce((s,c)=>s+c.amount,0);
  const totalExpenses  = expenses.reduce((s,e)=>s+e.amount,0);
  const balance        = totalCollected - totalExpenses;

  if (loading) return <Splash />;

  const TABS = [
    {id:"home",   n:"home",   l:"मुखपृष्ठ"},
    {id:"events", n:"cal",    l:"इव्हेंट्स"},
    {id:"funds",  n:"wallet", l:"निधी"},
    {id:"expense",n:"chart",  l:"खर्च"},
    {id:"gallery",n:"img",    l:"गॅलरी"},
  ];

  return (
    <div style={S.shell}>
      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <header style={S.hdr}>
        <div style={S.hdrDecor}/>
        <div style={S.hdrInner}>
          <div style={S.hdrL}>
            <ShivajiIcon size={38} color="#d4900a"/>
            <div>
              <div style={S.brand}>शिवतेज</div>
              <div style={S.brandSub}>Art, Cultural & Sports Group</div>
            </div>
          </div>
          <div style={S.hdrR}>
            {isTreasurer
              ? <>
                  <div style={S.tBadge}><Ic n="shield" s={11} c="#d4900a"/> खजिनदार</div>
                  <button onClick={logout} style={S.iconBtn} title="Logout"><Ic n="out" s={18} c="#8a6030"/></button>
                </>
              : <button onClick={()=>setShowLogin(true)} style={S.loginBtn}><Ic n="lock" s={14}/> खजिनदार</button>
            }
          </div>
        </div>
        <div style={S.hdrBorder}/>
      </header>

      {/* ── CONTENT ────────────────────────────────────────────────────── */}
      <main style={S.main}>
        {tab==="home"    && <HomeDash    events={events} contribs={contribs} expenses={expenses} totalCollected={totalCollected} totalPending={totalPending} totalExpenses={totalExpenses} balance={balance} isTreasurer={isTreasurer} onLogin={()=>setShowLogin(true)}/>}
        {tab==="events"  && <EventsTab  events={events} contribs={contribs} expenses={expenses} isTreasurer={isTreasurer} save={save}/>}
        {tab==="funds"   && <FundsTab   events={events} contribs={contribs} isTreasurer={isTreasurer} totalCollected={totalCollected} totalPending={totalPending} save={save}/>}
        {tab==="expense" && <ExpenseTab events={events} expenses={expenses} isTreasurer={isTreasurer} totalExpenses={totalExpenses} save={save}/>}
        {tab==="gallery" && <GalleryTab events={events} gallery={gallery} isTreasurer={isTreasurer} save={save}/>}
      </main>

      {/* ── BOTTOM NAV ─────────────────────────────────────────────────── */}
      <nav style={S.nav}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{...S.navBtn,...(tab===t.id?S.navOn:{})}}>
            <Ic n={t.n} s={19} c={tab===t.id?"#d4900a":"#4a3a20"}/>
            <span style={{fontSize:9,marginTop:2,color:tab===t.id?"#d4900a":"#4a3a20",fontWeight:tab===t.id?700:400}}>{t.l}</span>
          </button>
        ))}
      </nav>

      {/* ── TREASURER LOGIN MODAL ───────────────────────────────────────── */}
      {showLogin && <TreasurerLoginModal onLogin={loginTreasurer} onClose={()=>setShowLogin(false)} creds={tCreds}/>}

      {/* ── TOAST ──────────────────────────────────────────────────────── */}
      {toast && (
        <div style={{...S.toast, background:toast.ok?"#1a2e0e":"#2e0e0e", borderColor:toast.ok?"#4a8a2044":"#c1121f44"}}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SPLASH
═══════════════════════════════════════════════════════════════════════════ */
function Splash() {
  return (
    <div style={{...S.shell,alignItems:"center",justifyContent:"center",background:"#0a0700",gap:16}}>
      <RajMudra size={90} color="#d4900a"/>
      <div style={{textAlign:"center"}}>
        <div style={{fontFamily:"'Tiro Devanagari Marathi',serif",color:"#d4900a",fontSize:30,fontWeight:700}}>शिवतेज</div>
        <div style={{color:"#6a4a20",fontSize:13,marginTop:4}}>Art, Cultural & Sports Group</div>
      </div>
      <div style={{color:"#3a2a10",fontSize:12,marginTop:8}}>॥ जय भवानी, जय शिवाजी ॥</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   TREASURER LOGIN MODAL
═══════════════════════════════════════════════════════════════════════════ */
function TreasurerLoginModal({ onLogin, onClose, creds }) {
  const [user,   setUser]   = useState("");
  const [pass,   setPass]   = useState("");
  const [showPw, setShowPw] = useState(false);
  const [err,    setErr]    = useState("");
  const [busy,   setBusy]   = useState(false);

  const doLogin = async () => {
    if (!user||!pass) { setErr("कृपया username आणि password टाका"); return; }
    setBusy(true); setErr("");
    const ok = await onLogin(user.trim(), pass.trim());
    setBusy(false);
    if (!ok) setErr("चुकीची माहिती. पुन्हा प्रयत्न करा.");
  };

  return (
    <div style={S.overlay} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={S.modal}>
        {/* Decorative top */}
        <div style={S.modalTop}>
          <RajMudra size={56} color="#d4900a"/>
          <div style={{fontFamily:"'Tiro Devanagari Marathi',serif",color:"#e8c870",fontSize:20,fontWeight:700,marginTop:6}}>खजिनदार लॉगिन</div>
          <div style={{color:"#6a4a20",fontSize:12,marginTop:2}}>Treasurer Secure Access</div>
          <div style={{color:"#4a3a18",fontSize:11,marginTop:4}}>॥ जय भवानी, जय शिवाजी ॥</div>
        </div>

        {err && <div style={S.errBox}>{err}</div>}

        <label style={S.lbl}>Username</label>
        <input style={S.inp} placeholder="username टाका" value={user} onChange={e=>setUser(e.target.value)} autoComplete="username"/>
        <label style={S.lbl}>Password</label>
        <div style={{position:"relative"}}>
          <input style={{...S.inp,paddingRight:44}} type={showPw?"text":"password"} placeholder="password टाका" value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doLogin()} autoComplete="current-password"/>
          <button onClick={()=>setShowPw(!showPw)} style={S.eyeBtn}><Ic n={showPw?"eyeoff":"eye"} s={16} c="#6a4a20"/></button>
        </div>
        <div style={{color:"#3a2a10",fontSize:11,marginBottom:16,padding:"8px 12px",background:"#0a0800",borderRadius:8,border:"1px solid #1e1a08"}}>
          Default · username: <span style={{color:"#d4900a"}}>shivtej</span> · password: <span style={{color:"#d4900a"}}>jai@shivaji2025</span>
        </div>
        <div style={{display:"flex",gap:10}}>
          <button onClick={onClose} style={S.cancelBtn}>रद्द करा</button>
          <button onClick={doLogin} disabled={busy} style={{...S.goldBtn,opacity:busy?0.6:1}}>{busy?"तपासत आहे…":"⚔️ Login"}</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   HOME DASHBOARD — PUBLIC (no login needed)
═══════════════════════════════════════════════════════════════════════════ */
function HomeDash({ events, contribs, expenses, totalCollected, totalPending, totalExpenses, balance, isTreasurer, onLogin }) {
  return (
    <div style={S.page}>
      {/* Hero Banner */}
      <div style={S.heroBanner}>
        <div style={S.heroBg}/>
        <div style={{position:"relative",zIndex:1,display:"flex",flexDirection:"column",alignItems:"center",padding:"28px 20px 22px"}}>
          <RajMudra size={80} color="#d4900a"/>
          <div style={{fontFamily:"'Tiro Devanagari Marathi',serif",color:"#e8c870",fontSize:26,fontWeight:700,marginTop:12,textAlign:"center",textShadow:"0 2px 12px #00000088"}}>शिवतेज कला, सांस्कृतिक</div>
          <div style={{fontFamily:"'Tiro Devanagari Marathi',serif",color:"#e8c870",fontSize:22,fontWeight:700,textAlign:"center"}}>व क्रीडा मंडळ</div>
          <div style={{color:"#a07840",fontSize:13,marginTop:6,fontStyle:"italic"}}>॥ जय भवानी, जय शिवाजी ॥</div>
          {/* Shivaji quote */}
          <div style={S.quoteBox}>
            <div style={{fontSize:22,marginBottom:6}}>⚔️</div>
            <div style={{color:"#d4c080",fontSize:13,textAlign:"center",fontStyle:"italic",lineHeight:1.6}}>
              "जो पराक्रम करतो, त्याचीच गाथा लिहिली जाते."
            </div>
            <div style={{color:"#6a4a20",fontSize:11,marginTop:6}}>— छत्रपती शिवाजी महाराज</div>
          </div>
        </div>
        {/* Decorative sword dividers */}
        <div style={{display:"flex",alignItems:"center",gap:8,padding:"0 20px 16px",position:"relative",zIndex:1}}>
          <div style={{flex:1,height:1,background:"linear-gradient(90deg,transparent,#d4900a66)"}}/>
          <span style={{color:"#d4900a",fontSize:16}}>⚔️</span>
          <div style={{flex:1,height:1,background:"linear-gradient(90deg,#d4900a66,transparent)"}}/>
        </div>
      </div>

      {/* Stats — public */}
      <div style={S.statsTitle}>📊 गट निधी स्थिती</div>
      <div style={S.g2}>
        <StatCard v={`₹${N(totalCollected)}`} l="जमा वर्गणी"  s={`${contribs.filter(c=>c.status==="paid").length} सदस्य`}  t="#2d8a4e"/>
        <StatCard v={`₹${N(totalPending)}`}   l="बाकी वर्गणी" s={`${contribs.filter(c=>c.status==="pending").length} सदस्य`} t="#c4900a"/>
      </div>
      {isTreasurer && (
        <div style={S.g2}>
          <StatCard v={`₹${N(totalExpenses)}`}            l="एकूण खर्च"  s={`${expenses.length} नोंदी`}                             t="#b03030"/>
          <StatCard v={`₹${N(Math.abs(balance))}`}        l={balance>=0?"शिल्लक रक्कम":"तूट"} s={balance>=0?"उपलब्ध":"अधिक खर्च"} t={balance>=0?"#1e6b3c":"#8a1212"}/>
        </div>
      )}

      {/* Upcoming events */}
      <SH title="⚔️ आगामी कार्यक्रम"/>
      {events.filter(e=>e.status==="upcoming").map(ev=>{
        const col=contribs.filter(c=>c.eventId===ev.id&&c.status==="paid").reduce((s,c)=>s+c.amount,0);
        const pct=Math.min(100,Math.round((col/ev.budget)*100));
        const catIco = ev.category==="cultural"?"🎭":ev.category==="sports"?"⚔️":"🎨";
        return (
          <div key={ev.id} style={S.eventCard}>
            <div style={S.eventCardHdr}>
              <span style={{...S.catPill,background:ev.category==="cultural"?"#2a0e2a":ev.category==="sports"?"#0e1e2a":"#1a2a0e"}}>{catIco} {ev.category}</span>
              <span style={{...S.catPill,background:"#1a2a0e",color:"#4a8a2a"}}>आगामी</span>
            </div>
            <div style={S.evName}>{ev.name}</div>
            <div style={{color:"#6a4a20",fontSize:12,marginBottom:10}}>📅 {ev.date} &nbsp;·&nbsp; {ev.description}</div>
            <div style={S.budgetRow}>
              <BC l="बजेट"  v={`₹${N(ev.budget)}`} c="#d4c080"/>
              <BC l="जमा"   v={`₹${N(col)}`}        c="#2d8a4e"/>
              <BC l="प्रगती" v={`${pct}%`}          c="#c4900a"/>
            </div>
            <div style={S.bar}><div style={{...S.fill,width:`${pct}%`,background:pct>=75?"#2d8a4e":pct>=40?"#c4900a":"#b03030"}}/></div>
          </div>
        );
      })}

      {/* Past events */}
      <SH title="🏅 पूर्ण झालेले कार्यक्रम"/>
      {events.filter(e=>e.status==="completed").map(ev=>{
        const sp=expenses.filter(x=>x.eventId===ev.id).reduce((s,x)=>s+x.amount,0);
        return (
          <div key={ev.id} style={{...S.eventCard,borderColor:"#2a1e0e55",opacity:0.85}}>
            <div style={S.evName}>{ev.name}</div>
            <div style={{color:"#6a4a20",fontSize:12,marginBottom:8}}>📅 {ev.date} · खर्च: <span style={{color:"#b03030",fontWeight:700}}>₹{N(sp)}</span></div>
            <div style={{...S.catPill,display:"inline-block",background:"#2a1808",color:"#a07030"}}>✓ पूर्ण</div>
          </div>
        );
      })}

      {/* Shivaji decorative footer */}
      <div style={S.footerDecor}>
        <ShivajiIcon size={40} color="#3a2a10"/>
        <div style={{color:"#3a2a10",fontSize:11,textAlign:"center",marginTop:8}}>शिवतेज कला, सांस्कृतिक व क्रीडा मंडळ</div>
        <div style={{color:"#2a1a08",fontSize:10,marginTop:4}}>॥ छत्रपती शिवाजी महाराजांच्या आदर्शांवर चालत ॥</div>
      </div>
    </div>
  );
}

function StatCard({ v, l, s, t }) {
  return (
    <div style={{...S.sCard,borderTopColor:t}}>
      <div style={{color:t,fontWeight:700,fontSize:22,fontFamily:"'Tiro Devanagari Marathi',serif"}}>{v}</div>
      <div style={{color:"#b09050",fontSize:12,marginTop:4}}>{l}</div>
      <div style={{color:"#4a3a18",fontSize:11,marginTop:2}}>{s}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   EVENTS TAB
═══════════════════════════════════════════════════════════════════════════ */
function EventsTab({ events, contribs, expenses, isTreasurer, save }) {
  const [showForm, setShowForm] = useState(false);
  const [filter,   setFilter]   = useState("all");
  const [form, setF] = useState({name:"",date:"",budget:"",category:"cultural",description:""});

  const doAdd = () => {
    if(!form.name||!form.date||!form.budget) return;
    save.event({id:"e"+Date.now(),name:form.name,date:form.date,budget:+form.budget,category:form.category,status:"upcoming",description:form.description});
    setF({name:"",date:"",budget:"",category:"cultural",description:""});
    setShowForm(false);
  };

  const shown = events.filter(e=>filter==="all"||e.status===filter);

  return (
    <div style={S.page}>
      <PH title="⚔️ कार्यक्रम" action={isTreasurer?()=>setShowForm(!showForm):null} al="+ नवीन"/>
      {!isTreasurer && <Notice icon="👁" text="सर्व कार्यक्रम आणि बजेट माहिती येथे उपलब्ध आहे."/>}

      {showForm && isTreasurer && (
        <FB title="नवीन कार्यक्रम जोडा" onClose={()=>setShowForm(false)} onSave={doAdd} sl="जोडा">
          <Inp label="कार्यक्रमाचे नाव *"   v={form.name}        s={v=>setF({...form,name:v})}/>
          <Inp label="दिनांक *"              v={form.date}        s={v=>setF({...form,date:v})}        t="date"/>
          <Inp label="बजेट (₹) *"            v={form.budget}      s={v=>setF({...form,budget:v})}      t="number"/>
          <Sel label="प्रकार"                v={form.category}    s={v=>setF({...form,category:v})}    opts={["cultural","sports","art","other"]} labels={["🎭 सांस्कृतिक","⚔️ क्रीडा","🎨 कला","📋 इतर"]}/>
          <Inp label="वर्णन"                 v={form.description} s={v=>setF({...form,description:v})}/>
        </FB>
      )}

      <div style={S.fRow}>
        {[{id:"all",l:"सर्व"},{id:"upcoming",l:"आगामी"},{id:"completed",l:"पूर्ण"}].map(f=>(
          <button key={f.id} onClick={()=>setFilter(f.id)} style={{...S.fBtn,...(filter===f.id?S.fOn:{})}}>{f.l}</button>
        ))}
      </div>

      {shown.map(ev=>{
        const col  = contribs.filter(c=>c.eventId===ev.id&&c.status==="paid").reduce((s,c)=>s+c.amount,0);
        const pend = contribs.filter(c=>c.eventId===ev.id&&c.status==="pending").reduce((s,c)=>s+c.amount,0);
        const sp   = expenses.filter(x=>x.eventId===ev.id).reduce((s,x)=>s+x.amount,0);
        const pct  = Math.min(100,Math.round((col/ev.budget)*100));
        const catIco = ev.category==="cultural"?"🎭":ev.category==="sports"?"⚔️":"🎨";
        return (
          <div key={ev.id} style={S.card}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:10,alignItems:"center"}}>
              <div style={{...S.catPill}}>{catIco} {ev.category}</div>
              <div style={{...S.catPill,background:ev.status==="upcoming"?"#0e2010":"#201408",color:ev.status==="upcoming"?"#4a8a2a":"#a07030"}}>{ev.status==="upcoming"?"आगामी":"✓ पूर्ण"}</div>
            </div>
            <div style={S.evName}>{ev.name}</div>
            <div style={{color:"#6a4a20",fontSize:12,marginBottom:10}}>📅 {ev.date} · {ev.description}</div>
            <div style={S.budgetRow}>
              <BC l="बजेट"    v={`₹${N(ev.budget)}`} c="#d4c080"/>
              <BC l="जमा"     v={`₹${N(col)}`}        c="#2d8a4e"/>
              <BC l="बाकी"    v={`₹${N(pend)}`}       c="#c4900a"/>
              <BC l="खर्च"    v={`₹${N(sp)}`}         c="#b03030"/>
              <BC l="शिल्लक" v={`₹${N(col-sp)}`}     c={col-sp>=0?"#2d8a4e":"#b03030"}/>
              <BC l="प्रगती"  v={`${pct}%`}           c="#c4900a"/>
            </div>
            <div style={S.bar}><div style={{...S.fill,width:`${pct}%`,background:pct>=75?"#2d8a4e":pct>=40?"#c4900a":"#b03030"}}/></div>
            {isTreasurer&&(<button onClick={()=>save.delEvent(ev.id)} style={S.delBtn}>🗑 हटवा</button>)}
          </div>
        );
      })}
    </div>
  );
}

function BC({ l, v, c }) {
  return (
    <div style={{background:"#08060200",borderRadius:8,padding:"8px 4px",textAlign:"center",border:"1px solid #1e1608"}}>
      <div style={{color:c,fontWeight:700,fontSize:13}}>{v}</div>
      <div style={{color:"#4a3a18",fontSize:9,marginTop:2}}>{l}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   FUNDS TAB
═══════════════════════════════════════════════════════════════════════════ */
function FundsTab({ events, contribs, isTreasurer, totalCollected, totalPending, save }) {
  const [showForm, setShowForm] = useState(false);
  const [selEv,    setSelEv]    = useState("all");
  const [form, setF] = useState({memberName:"",eventId:"",amount:""});

  const doAdd = () => {
    if(!form.memberName||!form.eventId||!form.amount) return;
    save.contrib({id:"c"+Date.now(),memberName:form.memberName,eventId:form.eventId,amount:+form.amount,date:null,status:"pending"});
    setF({memberName:"",eventId:"",amount:""});
    setShowForm(false);
  };

  const visible = contribs.filter(c=>selEv==="all"||c.eventId===selEv);
  const visPaid = visible.filter(c=>c.status==="paid").reduce((s,c)=>s+c.amount,0);
  const visPend = visible.filter(c=>c.status==="pending").reduce((s,c)=>s+c.amount,0);

  return (
    <div style={S.page}>
      <PH title="💰 वर्गणी व्यवस्थापन" action={isTreasurer?()=>setShowForm(!showForm):null} al="+ वर्गणी जोडा"/>

      {/* Totals — public */}
      <div style={S.g3}>
        <Mini l="जमा वर्गणी"  v={`₹${N(totalCollected)}`} c="#2d8a4e"/>
        <Mini l="बाकी वर्गणी" v={`₹${N(totalPending)}`}   c="#c4900a"/>
        <Mini l="संकलन दर" v={`${totalCollected+totalPending?Math.round(totalCollected/(totalCollected+totalPending)*100):0}%`} c="#d4c080"/>
      </div>

      {showForm && isTreasurer && (
        <FB title="वर्गणी नोंदवा" onClose={()=>setShowForm(false)} onSave={doAdd} sl="नोंदवा">
          <Inp label="सदस्याचे नाव *" v={form.memberName} s={v=>setF({...form,memberName:v})}/>
          <Sel label="कार्यक्रम *"    v={form.eventId}    s={v=>setF({...form,eventId:v})} opts={events.map(e=>e.id)} labels={events.map(e=>e.name)}/>
          <Inp label="रक्कम (₹) *"    v={form.amount}     s={v=>setF({...form,amount:v})}  t="number"/>
        </FB>
      )}

      <select style={{...S.inp,marginBottom:12}} value={selEv} onChange={e=>setSelEv(e.target.value)}>
        <option value="all">सर्व कार्यक्रम</option>
        {events.map(e=><option key={e.id} value={e.id}>{e.name}</option>)}
      </select>

      <div style={{display:"flex",justifyContent:"space-between",fontSize:12,fontWeight:600,marginBottom:12,padding:"0 2px"}}>
        <span style={{color:"#2d8a4e"}}>✓ {visible.filter(c=>c.status==="paid").length} भरले · ₹{N(visPaid)}</span>
        <span style={{color:"#c4900a"}}>⏳ {visible.filter(c=>c.status==="pending").length} बाकी · ₹{N(visPend)}</span>
      </div>

      {visible.length===0 && <Empty text="कोणतीही वर्गणी नोंद नाही."/>}
      {visible.map(c=>{
        const ev=events.find(e=>e.id===c.eventId);
        const ini=c.memberName?.split(" ").map(n=>n[0]).join("").slice(0,2);
        return (
          <div key={c.id} style={S.cCard}>
            <div style={S.cAv}>{ini}</div>
            <div style={{flex:1}}>
              <div style={{color:"#d4c080",fontWeight:600,fontSize:14}}>{c.memberName}</div>
              <div style={{color:"#6a4a20",fontSize:12}}>{ev?.name}</div>
              {c.date&&<div style={{color:"#4a3a18",fontSize:11}}>भरले: {c.date}</div>}
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{color:"#e8d5a0",fontWeight:700,fontSize:16}}>₹{N(c.amount)}</div>
              <div style={{...S.pill,background:c.status==="paid"?"#0c2010":"#1e1200",color:c.status==="paid"?"#2d8a4e":"#c4900a"}}>{c.status==="paid"?"✓ भरले":"⏳ बाकी"}</div>
              {isTreasurer&&c.status==="pending"&&(<button onClick={()=>save.markPaid(c.id)} style={S.payBtn}>भरले म्हणून नोंदवा</button>)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Mini({ l, v, c }) {
  return (
    <div style={{background:"#0e0c06",border:"1px solid #1a1608",borderRadius:12,padding:"12px 6px",textAlign:"center"}}>
      <div style={{color:c,fontWeight:700,fontSize:15}}>{v}</div>
      <div style={{color:"#4a3a18",fontSize:10,marginTop:3}}>{l}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   EXPENSE TAB
═══════════════════════════════════════════════════════════════════════════ */
function ExpenseTab({ events, expenses, isTreasurer, totalExpenses, save }) {
  const [showForm, setShowForm] = useState(false);
  const [selEv,    setSelEv]    = useState("all");
  const [form, setF] = useState({eventId:"",title:"",amount:"",date:"",category:"decor",note:""});
  const CATS = {decor:"🎨",equipment:"🎺",food:"🍽",prizes:"🏅",venue:"🏛",transport:"🚌",other:"📦"};

  const doAdd = () => {
    if(!form.eventId||!form.title||!form.amount||!form.date) return;
    save.expense({id:"x"+Date.now(),eventId:form.eventId,title:form.title,amount:+form.amount,date:form.date,category:form.category,note:form.note});
    setF({eventId:"",title:"",amount:"",date:"",category:"decor",note:""});
    setShowForm(false);
  };

  const shown = expenses.filter(x=>selEv==="all"||x.eventId===selEv);

  return (
    <div style={S.page}>
      <PH title="📊 खर्च तपशील" action={isTreasurer?()=>setShowForm(!showForm):null} al="+ खर्च जोडा"/>

      {/* Total — public */}
      <div style={{...S.card,textAlign:"center",borderColor:"#5a0e0e44",marginBottom:16}}>
        <div style={{color:"#b03030",fontWeight:700,fontSize:26,fontFamily:"'Tiro Devanagari Marathi',serif"}}>₹{N(totalExpenses)}</div>
        <div style={{color:"#6a4a20",fontSize:12,marginTop:4}}>एकूण खर्च · {expenses.length} नोंदी</div>
      </div>

      {/* Per-event summary — public */}
      <SH title="कार्यक्रमनिहाय खर्च"/>
      {events.map(ev=>{
        const t=expenses.filter(x=>x.eventId===ev.id).reduce((s,x)=>s+x.amount,0);
        if(!t) return null;
        return (
          <div key={ev.id} style={{display:"flex",alignItems:"center",padding:"10px 14px",background:"#0e0c06",borderRadius:10,marginBottom:8,border:"1px solid #1a1608"}}>
            <span style={{color:"#d4c080",flex:1,fontSize:13}}>{ev.name}</span>
            <span style={{color:"#b03030",fontWeight:700}}>₹{N(t)}</span>
          </div>
        );
      })}

      {!isTreasurer && <Notice icon="🔒" text="संपूर्ण खर्च तपशील खजिनदारांसाठीच उपलब्ध आहे."/>}

      {isTreasurer && (
        <>
          {showForm&&(
            <FB title="खर्च नोंदवा" onClose={()=>setShowForm(false)} onSave={doAdd} sl="नोंदवा">
              <Sel label="कार्यक्रम *"  v={form.eventId}  s={v=>setF({...form,eventId:v})}  opts={events.map(e=>e.id)} labels={events.map(e=>e.name)}/>
              <Inp label="शीर्षक *"     v={form.title}    s={v=>setF({...form,title:v})}/>
              <Inp label="रक्कम (₹) *"  v={form.amount}   s={v=>setF({...form,amount:v})}   t="number"/>
              <Inp label="दिनांक *"     v={form.date}     s={v=>setF({...form,date:v})}      t="date"/>
              <Sel label="प्रकार"       v={form.category} s={v=>setF({...form,category:v})}  opts={Object.keys(CATS)} labels={Object.keys(CATS).map(k=>CATS[k]+" "+k)}/>
              <Inp label="टीप"          v={form.note}     s={v=>setF({...form,note:v})}/>
            </FB>
          )}
          <select style={{...S.inp,margin:"12px 0"}} value={selEv} onChange={e=>setSelEv(e.target.value)}>
            <option value="all">सर्व कार्यक्रम</option>
            {events.map(e=><option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
          {shown.map(x=>{
            const ev=events.find(e=>e.id===x.eventId);
            return (
              <div key={x.id} style={S.expCard}>
                <div style={S.expIc}>{CATS[x.category]||"📦"}</div>
                <div style={{flex:1}}>
                  <div style={{color:"#d4c080",fontWeight:600,fontSize:14}}>{x.title}</div>
                  <div style={{color:"#6a4a20",fontSize:11}}>{ev?.name} · {x.date}</div>
                  {x.note&&<div style={{color:"#4a3a18",fontSize:11}}>📝 {x.note}</div>}
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{color:"#b03030",fontWeight:700,fontSize:15}}>₹{N(x.amount)}</div>
                  <button onClick={()=>save.delExp(x.id)} style={{background:"none",border:"none",cursor:"pointer",padding:"4px 0",display:"block",marginTop:4}}><Ic n="trash" s={14} c="#5a2020"/></button>
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   GALLERY TAB
═══════════════════════════════════════════════════════════════════════════ */
function GalleryTab({ events, gallery, isTreasurer, save }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setF] = useState({eventId:"",title:"",emoji:"⚔️",color:"#8B1A1A"});
  const EMOJIS = ["⚔️","🏅","🎭","🎨","🎺","🥁","🎉","🏆","🎪","🌟","🔱","👑","🤝","🏛","🎯","🦁"];
  const COLS   = ["#8B1A1A","#1A3A1A","#1A1A3A","#3A1A1A","#4a3a00","#1A3A3A","#2A1A00"];

  const doAdd = () => {
    if(!form.eventId||!form.title) return;
    save.gallery({id:"g"+Date.now(),eventId:form.eventId,title:form.title,emoji:form.emoji,color:form.color,date:new Date().toISOString().slice(0,10)});
    setF({eventId:"",title:"",emoji:"⚔️",color:"#8B1A1A"});
    setShowForm(false);
  };

  return (
    <div style={S.page}>
      <PH title="📸 आठवणींची गॅलरी" action={isTreasurer?()=>setShowForm(!showForm):null} al="+ जोडा"/>

      {showForm&&isTreasurer&&(
        <FB title="गॅलरीत जोडा" onClose={()=>setShowForm(false)} onSave={doAdd} sl="जोडा">
          <Sel label="कार्यक्रम *" v={form.eventId} s={v=>setF({...form,eventId:v})} opts={events.map(e=>e.id)} labels={events.map(e=>e.name)}/>
          <Inp label="मथळा *" v={form.title} s={v=>setF({...form,title:v})}/>
          <div style={{color:"#6a4a20",fontSize:12,marginBottom:6}}>चिन्ह निवडा</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:12}}>
            {EMOJIS.map(em=>(
              <button key={em} onClick={()=>setF({...form,emoji:em})} style={{background:form.emoji===em?"#1e1408":"#0c0a06",border:`2px solid ${form.emoji===em?"#d4900a":"#161208"}`,borderRadius:8,padding:"4px 8px",fontSize:18,cursor:"pointer"}}>{em}</button>
            ))}
          </div>
          <div style={{color:"#6a4a20",fontSize:12,marginBottom:6}}>रंग निवडा</div>
          <div style={{display:"flex",gap:8,marginBottom:12}}>
            {COLS.map(col=><button key={col} onClick={()=>setF({...form,color:col})} style={{width:26,height:26,borderRadius:"50%",background:col,cursor:"pointer",border:`3px solid ${form.color===col?"#d4900a":"transparent"}`}}/>)}
          </div>
        </FB>
      )}

      {events.map(ev=>{
        const items=gallery.filter(g=>g.eventId===ev.id);
        if(!items.length) return null;
        return (
          <div key={ev.id} style={{marginBottom:24}}>
            <SH title={ev.name}/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
              {items.map(g=>(
                <div key={g.id} style={{background:g.color+"28",borderRadius:14,padding:14,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",border:`1px solid ${g.color}55`,minHeight:110,position:"relative"}}>
                  <div style={{fontSize:34}}>{g.emoji}</div>
                  <div style={{color:"#d4c080",fontWeight:600,fontSize:10,textAlign:"center",marginTop:8,lineHeight:1.3}}>{g.title}</div>
                  <div style={{color:"#4a3a18",fontSize:9,marginTop:4}}>{g.date}</div>
                  {isTreasurer&&<button onClick={()=>save.delGal(g.id)} style={{position:"absolute",top:5,right:5,background:"none",border:"none",cursor:"pointer",padding:2}}><Ic n="trash" s={11} c="#5a2020"/></button>}
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {gallery.length===0&&<Empty text="अजून कोणत्याही आठवणी जोडल्या नाहीत. 📸"/>}

      {/* Shivaji tribute footer */}
      <div style={{textAlign:"center",padding:"24px 0 8px"}}>
        <RajMudra size={50} color="#2a1e08"/>
        <div style={{color:"#2a1e08",fontSize:11,marginTop:8}}>॥ जय भवानी, जय शिवाजी ॥</div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SHARED PRIMITIVES
═══════════════════════════════════════════════════════════════════════════ */
function SH({ title }) {
  return <div style={{color:"#d4900a",fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:10,marginTop:4,display:"flex",alignItems:"center",gap:6}}>{title}</div>;
}
function PH({ title, action, al }) {
  return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
      <h2 style={{fontFamily:"'Tiro Devanagari Marathi',serif",color:"#e8d5a0",fontSize:20,fontWeight:700,margin:0}}>{title}</h2>
      {action&&<button onClick={action} style={S.goldBtnSm}>{al}</button>}
    </div>
  );
}
function Notice({ icon, text }) { return <div style={S.notice}><span style={{fontSize:16}}>{icon}</span><span>{text}</span></div>; }
function Empty({ text }) { return <div style={{color:"#2a1e08",textAlign:"center",padding:"40px 20px",fontSize:14}}>{text}</div>; }
function FB({ title, children, onClose, onSave, sl }) {
  return (
    <div style={S.fBox}>
      <div style={{fontFamily:"'Tiro Devanagari Marathi',serif",color:"#d4900a",fontSize:17,marginBottom:14}}>{title}</div>
      {children}
      <div style={{display:"flex",gap:10,marginTop:4}}>
        <button onClick={onClose} style={S.cancelBtn}>रद्द करा</button>
        <button onClick={onSave}  style={S.goldBtn}>{sl}</button>
      </div>
    </div>
  );
}
function Inp({ label, v, s, t="text" }) {
  return <>
    <label style={S.lbl}>{label}</label>
    <input style={S.inp} type={t} value={v} onChange={e=>s(e.target.value)} placeholder={label.replace(" *","")}/>
  </>;
}
function Sel({ label, v, s, opts, labels }) {
  return <>
    <label style={S.lbl}>{label}</label>
    <select style={S.inp} value={v} onChange={e=>s(e.target.value)}>
      <option value="">निवडा…</option>
      {opts.map((o,i)=><option key={o} value={o}>{labels?.[i]??o}</option>)}
    </select>
  </>;
}

/* ═══════════════════════════════════════════════════════════════════════════
   STYLES
═══════════════════════════════════════════════════════════════════════════ */
const S = {
  shell: {display:"flex",flexDirection:"column",height:"100vh",maxWidth:480,margin:"0 auto",background:"#080601",fontFamily:"'Lato',sans-serif",overflow:"hidden",position:"relative"},

  // Header
  hdr:      {background:"linear-gradient(180deg,#100c04 0%,#0c0900 100%)",flexShrink:0,position:"relative"},
  hdrDecor: {position:"absolute",top:0,left:0,right:0,height:2,background:"linear-gradient(90deg,transparent,#d4900a,#8B1A1A,#d4900a,transparent)"},
  hdrInner: {display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 16px"},
  hdrL:     {display:"flex",alignItems:"center",gap:10},
  hdrR:     {display:"flex",alignItems:"center",gap:8},
  hdrBorder:{height:1,background:"linear-gradient(90deg,transparent,#d4900a44,#8B1A1A44,#d4900a44,transparent)",margin:"0 16px 10px"},
  brand:    {fontFamily:"'Tiro Devanagari Marathi',serif",color:"#e8c870",fontSize:20,fontWeight:700,lineHeight:1.1},
  brandSub: {color:"#8a6030",fontSize:10,marginTop:2},
  tBadge:   {background:"#1e1408",color:"#d4900a",fontSize:10,padding:"3px 10px",borderRadius:20,border:"1px solid #d4900a33",display:"flex",alignItems:"center",gap:4},
  loginBtn: {background:"linear-gradient(135deg,#d4900a,#8a5808)",color:"#060401",border:"none",borderRadius:20,padding:"7px 14px",fontWeight:700,fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",gap:6},
  iconBtn:  {background:"none",border:"none",cursor:"pointer",padding:4},

  // Nav
  nav:  {background:"#0c0900",borderTop:"1px solid #1e1608",display:"flex",padding:"8px 0 max(10px,env(safe-area-inset-bottom))",flexShrink:0},
  navBtn:{flex:1,background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:2,padding:"4px 2px"},
  navOn: {},

  // Main
  main: {flex:1,overflowY:"auto",background:"#080601"},
  page: {padding:"0 0 80px"},

  // Hero
  heroBanner:{background:"linear-gradient(180deg,#120a02 0%,#0a0600 100%)",position:"relative",overflow:"hidden"},
  heroBg:    {position:"absolute",inset:0,backgroundImage:"radial-gradient(ellipse at 50% 30%, #d4900a12 0%, transparent 70%)",pointerEvents:"none"},
  quoteBox:  {background:"#0e0a0244",border:"1px solid #d4900a22",borderRadius:14,padding:"14px 18px",marginTop:16,maxWidth:320},

  statsTitle:{color:"#8a6030",fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:1.5,padding:"16px 16px 10px"},
  g2:   {display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10,padding:"0 16px"},
  g3:   {display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12},
  sCard:{background:"#0e0c06",borderRadius:14,padding:14,border:"1px solid #1a1608",borderTop:"3px solid #d4900a"},

  // Event
  eventCard:   {background:"#0e0c06",borderRadius:16,padding:16,marginBottom:12,border:"1px solid #1e1808",margin:"0 16px 12px"},
  eventCardHdr:{display:"flex",justifyContent:"space-between",marginBottom:10},
  evName:      {fontFamily:"'Tiro Devanagari Marathi',serif",color:"#e8c870",fontWeight:700,fontSize:16,marginBottom:4},
  budgetRow:   {display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6,marginBottom:10},
  catPill:     {fontSize:11,color:"#8a6030",padding:"3px 10px",borderRadius:20,fontWeight:600,background:"#1a1208"},

  card:  {background:"#0e0c06",borderRadius:16,padding:16,marginBottom:12,border:"1px solid #1a1608"},
  bar:   {height:5,background:"#1a1608",borderRadius:3,overflow:"hidden"},
  fill:  {height:"100%",borderRadius:3,transition:"width 0.6s ease"},
  delBtn:{background:"none",border:"1px solid #3a0e0e",borderRadius:8,color:"#b03030",fontSize:11,padding:"5px 12px",cursor:"pointer",marginTop:10,display:"inline-block"},

  // Contribs
  cCard:  {background:"#0e0c06",borderRadius:14,padding:14,marginBottom:10,border:"1px solid #1a1608",display:"flex",alignItems:"flex-start",gap:12},
  cAv:    {width:40,height:40,borderRadius:"50%",background:"#1a1208",border:"2px solid #d4900a33",display:"flex",alignItems:"center",justifyContent:"center",color:"#d4900a",fontWeight:700,fontSize:12,flexShrink:0},
  pill:   {fontSize:11,fontWeight:600,padding:"2px 8px",borderRadius:10,marginTop:4,display:"inline-block"},
  payBtn: {background:"#0c1e10",color:"#2d8a4e",border:"none",borderRadius:8,padding:"4px 10px",fontSize:11,fontWeight:600,cursor:"pointer",marginTop:4,display:"block",whiteSpace:"nowrap"},

  // Expenses
  expCard:{background:"#0e0c06",borderRadius:14,padding:14,marginBottom:10,border:"1px solid #1a1608",display:"flex",alignItems:"center",gap:12},
  expIc:  {width:40,height:40,borderRadius:12,background:"#141008",border:"1px solid #1e1808",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0},

  // Modal
  overlay:{position:"fixed",inset:0,background:"#000000cc",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,padding:16},
  modal:  {background:"#0e0c06",borderRadius:20,padding:"0 0 24px",width:"100%",maxWidth:380,border:"1px solid #d4900a22",overflow:"hidden"},
  modalTop:{background:"linear-gradient(180deg,#120a02,#0a0600)",padding:"24px 20px 20px",textAlign:"center",borderBottom:"1px solid #d4900a22"},

  // Forms
  fBox:    {background:"#0e0c06",borderRadius:16,padding:18,marginBottom:16,border:"1px solid #d4900a22"},
  lbl:     {color:"#6a4a20",fontSize:12,marginBottom:4,display:"block"},
  inp:     {width:"100%",background:"#070501",border:"1px solid #1a1608",borderRadius:10,padding:"11px 12px",color:"#d4c080",fontSize:14,marginBottom:12,outline:"none",boxSizing:"border-box",fontFamily:"'Lato',sans-serif"},
  eyeBtn:  {position:"absolute",right:12,top:"50%",transform:"translateY(-70%)",background:"none",border:"none",cursor:"pointer",padding:4},
  goldBtn: {flex:1,background:"linear-gradient(135deg,#d4900a,#8a5808)",color:"#060401",border:"none",borderRadius:10,padding:"12px",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"'Lato',sans-serif",width:"100%"},
  goldBtnSm:{background:"linear-gradient(135deg,#d4900a,#8a5808)",color:"#060401",border:"none",borderRadius:20,padding:"7px 14px",fontWeight:700,fontSize:12,cursor:"pointer"},
  cancelBtn:{flex:1,background:"#14120a",color:"#6a4a20",border:"1px solid #1e1a0e",borderRadius:10,padding:"12px",fontWeight:600,cursor:"pointer"},
  errBox:  {background:"#200606",border:"1px solid #b0302044",borderRadius:10,padding:"10px 12px",color:"#b03030",fontSize:13,marginBottom:12,margin:"0 20px 12px"},

  fRow:    {display:"flex",gap:8,marginBottom:14,padding:"0 16px"},
  fBtn:    {background:"#0e0c06",border:"1px solid #1a1608",borderRadius:20,padding:"6px 14px",color:"#4a3a18",fontSize:12,cursor:"pointer"},
  fOn:     {background:"#1a1208",borderColor:"#d4900a",color:"#d4900a"},

  notice:  {background:"#0e0c06",border:"1px solid #d4900a18",borderRadius:12,padding:"11px 14px",color:"#6a4a20",fontSize:12,margin:"0 0 14px",display:"flex",alignItems:"flex-start",gap:8,lineHeight:1.6},

  footerDecor:{textAlign:"center",padding:"32px 20px 16px"},
  toast:   {position:"fixed",bottom:80,left:"50%",transform:"translateX(-50%)",padding:"11px 22px",borderRadius:24,color:"#d4c080",fontWeight:600,fontSize:13,boxShadow:"0 10px 30px #00000099",zIndex:200,whiteSpace:"nowrap",border:"1px solid"},
};
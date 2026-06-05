/* ============================================================
   app.jsx — shell com Supabase Auth + persistência real
   ============================================================ */
const { useState: useStateApp, useEffect: useEffectApp } = React;

const TABS = [
  { id: "hoje",     label: "Hoje",           icon: "sun"      },
  { id: "noticias", label: "Notícias",       icon: "note"     },
  { id: "agenda",   label: "Agenda",         icon: "calendar" },
  { id: "financas", label: "Finanças",       icon: "wallet"   },
  { id: "notas",    label: "Notas & Ideias", icon: "tag"      },
  { id: "listas",   label: "Listas",         icon: "list"     },
];

/* ── Supabase helpers ── */
async function dbLoad(table, user_id, orderCol) {
  const col = orderCol || (table === "notes" ? "updated_at" : "created_at");
  const { data, error } = await sb.from(table).select("*").eq("user_id", user_id).order(col);
  if (error) { console.error("dbLoad", table, error.message); return null; }
  return data;
}

async function dbUpsert(table, rows) {
  if (!rows || rows.length === 0) return;
  const { error } = await sb.from(table).upsert(rows, { onConflict: "id" });
  if (error) console.error("dbUpsert", table, error.message);
}

/* ── syncTable: upsert modificados + delete removidos ── */
async function syncTable(table, prev, next, uid, extra) {
  if (!prev) return;
  const prevIds = new Set(prev.map(r => String(r.id)));
  const nextIds = new Set(next.map(r => String(r.id)));
  const deleted = [...prevIds].filter(id => !nextIds.has(id));
  for (const id of deleted) {
    const { error } = await sb.from(table).delete().eq("id", id).eq("user_id", uid);
    if (error) console.error("delete", table, id, error.message);
  }
  if (next.length > 0) {
    await dbUpsert(table, next.map(r => ({ ...r, user_id: uid, ...(extra || {}) })));
  }
}

/* ── Ticker ── */
const TICKER_FALLBACK = [
  { cat: "Flamengo",     title: "Flamengo vence e assume liderança do Brasileirão" },
  { cat: "Brasil",       title: "Economia brasileira cresce acima do esperado no trimestre" },
  { cat: "Mundo",        title: "Cúpula do clima reúne líderes para acordo sobre oceanos" },
  { cat: "Esportes",     title: "Rebeca Andrade confirma presença em etapa da Copa do Mundo" },
  { cat: "Libertadores", title: "Conmebol divulga tabela detalhada das quartas de final" },
  { cat: "Economia",     title: "Inflação desacelera e fica abaixo do esperado em maio" },
];

function Ticker() {
  const [items, setItems] = useStateApp(TICKER_FALLBACK);
  useEffectApp(() => {
    fetchNews("Geral").then(news => { if (news && news.length > 0) setItems(news.slice(0, 9)); });
  }, []);
  return (
    <div className="ticker">
      <div className="ticker-label"><span className="dot"></span> Últimas</div>
      <div className="ticker-viewport">
        <span className="ticker-track">
          {[...items, ...items].map((n, i) => (
            <span className="ticker-item" key={i}>
              <span className="cat">{n.cat}</span>
              <span className="sep">·</span>
              <span>{n.title}</span>
            </span>
          ))}
        </span>
      </div>
    </div>
  );
}

/* ── Login ── */
function LoginScreen() {
  const [loading, setLoading] = useStateApp(false);
  const [error, setError] = useStateApp("");
  const handleGoogle = async () => {
    setLoading(true); setError("");
    const { error } = await sb.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.href },
    });
    if (error) { setError("Erro ao fazer login. Tente novamente."); setLoading(false); }
  };
  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-logo">Marcela's <span>Space</span></div>
        <div className="login-sub">Seu espaço pessoal</div>
        <button className="login-btn" onClick={handleGoogle} disabled={loading}>
          <Icon name="google" size={20} />
          {loading ? "Aguarde..." : "Entrar com Google"}
        </button>
        {error && <div style={{ marginTop: "1rem", fontSize: "0.78rem", color: "var(--red)" }}>{error}</div>}
      </div>
    </div>
  );
}

/* ── Loading screen ── */
function LoadingScreen({ msg }) {
  return (
    <div style={{ minHeight:"100vh", background:"var(--cream)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"var(--serif)", fontSize:"1.2rem", color:"var(--gold-dk)", fontStyle:"italic" }}>
      {msg || "Carregando..."}
    </div>
  );
}

/* ── App ── */
function App() {
  const [session,      setSession]      = useStateApp(null);
  const [authLoading,  setAuthLoading]  = useStateApp(true);
  const [tab,          setTab]          = useStateApp("hoje");

  /* dados persistidos no Supabase */
  const [tasks,        setTasksRaw]     = useStateApp(null);
  const [bills,        setBillsRaw]     = useStateApp(null);
  const [notes,        setNotesRaw]     = useStateApp(null);
  const [personal,     setPersonalRaw]  = useStateApp(null);
  const [house,        setHouseRaw]     = useStateApp(null);
  const [transactions, setTxRaw]        = useStateApp(null);

  /* Auth */
  useEffectApp(() => {
    sb.auth.getSession().then(({ data: { session } }) => { setSession(session); setAuthLoading(false); });
    const { data: { subscription } } = sb.auth.onAuthStateChange((_e, s) => { setSession(s); setAuthLoading(false); });
    return () => subscription.unsubscribe();
  }, []);

  /* Carrega dados do Supabase */
  useEffectApp(() => {
    if (!session) return;
    const uid = session.user.id;

    const load = async (table, seed, setter, orderCol) => {
      const rows = await dbLoad(table, uid, orderCol);
      if (rows && rows.length > 0) {
        setter(rows);
      } else {
        const seeded = seed.map(r => ({ ...r, id: crypto.randomUUID(), user_id: uid }));
        await dbUpsert(table, seeded);
        setter(seeded);
      }
    };

    load("tasks",         TASKS_SEED,    setTasksRaw);
    load("bills",         BILLS_SEED,    setBillsRaw);
    load("notes",         NOTES_SEED,    setNotesRaw);
    load("personal_list", PERSONAL_SEED, setPersonalRaw);
    load("house_list",    HOUSE_SEED,    setHouseRaw);
    load("transactions",  TRANSACTIONS,  setTxRaw);
  }, [session]);

  /* Wrappers sincronizados */
  const uid = () => session.user.id;

  const setTasks = async (fn) => {
    const next = typeof fn === "function" ? fn(tasks) : fn;
    setTasksRaw(next);
    await syncTable("tasks", tasks, next, uid());
  };

  const setBills = async (fn) => {
    const next = typeof fn === "function" ? fn(bills) : fn;
    setBillsRaw(next);
    await syncTable("bills", bills, next, uid());
  };

  const setNotes = async (fn) => {
    const next = typeof fn === "function" ? fn(notes) : fn;
    setNotesRaw(next);
    await syncTable("notes", notes, next, uid(), { updated_at: new Date().toISOString() });
  };

  const setPersonal = async (fn) => {
    const next = typeof fn === "function" ? fn(personal) : fn;
    setPersonalRaw(next);
    await syncTable("personal_list", personal, next, uid());
  };

  const setHouse = async (fn) => {
    const next = typeof fn === "function" ? fn(house) : fn;
    setHouseRaw(next);
    await syncTable("house_list", house, next, uid());
  };

  const setTransactions = async (fn) => {
    const next = typeof fn === "function" ? fn(transactions) : fn;
    setTxRaw(next);
    await syncTable("transactions", transactions, next, uid());
  };

  const handleLogout = async () => { await sb.auth.signOut(); setSession(null); };

  if (authLoading) return <LoadingScreen msg="Carregando..." />;
  if (!session)    return <LoginScreen />;

  const dataReady = tasks && bills && notes && personal && house && transactions;
  if (!dataReady)  return <LoadingScreen msg="Preparando seu espaço..." />;

  const userName   = session.user.user_metadata?.name?.split(" ")[0] || "Marcela";
  const userAvatar = session.user.user_metadata?.avatar_url;

  const TAB_ICONS = {
    hoje:     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/></svg>,
    noticias: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4 4h16v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4z"/><line x1="8" y1="9" x2="16" y2="9"/><line x1="8" y1="13" x2="12" y2="13"/></svg>,
    agenda:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="16" y1="2" x2="16" y2="6"/></svg>,
    financas: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>,
    notas:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>,
    listas:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="3" cy="6" r="1.2"/><circle cx="3" cy="12" r="1.2"/><circle cx="3" cy="18" r="1.2"/></svg>,
  };

  return (
    <div className="app">
      <Ticker />
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-avatar">
            {userAvatar ? <img src={userAvatar} alt={userName} /> : userName[0]}
          </div>
          <div className="sidebar-name">Olá, {userName} ✦</div>
          <div className="sidebar-sub">Espaço pessoal</div>
        </div>
        <nav className="sidebar-nav">
          {TABS.map(t => (
            <button key={t.id} className={"sidebar-btn" + (tab === t.id ? " active" : "")} onClick={() => setTab(t.id)}>
              <span className="sb-icon">{TAB_ICONS[t.id]}</span>
              {t.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="sidebar-logout" onClick={handleLogout}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Sair
          </button>
        </div>
      </aside>

      <div className="shell">
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:28 }}>
          <div style={{ fontFamily:"var(--serif)", fontStyle:"italic", fontSize:"clamp(1.8rem,3vw,2.4rem)", fontWeight:900, color:"var(--ink)", lineHeight:1 }}>
            Marcela's <span style={{ color:"var(--sage-dk)" }}>Space</span>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontFamily:"var(--serif)", fontStyle:"italic", color:"var(--sage-dk)", fontWeight:700, fontSize:"1rem" }}>
              {DIAS[TODAY.getDay()].replace("-feira","").charAt(0).toUpperCase() + DIAS[TODAY.getDay()].replace("-feira","").slice(1)}
            </div>
            <div style={{ fontSize:12, color:"var(--mocha)" }}>{TODAY.getDate()} {MESES_ABR[TODAY.getMonth()]} · {TODAY.getFullYear()}</div>
          </div>
        </div>

        <main>
          {tab === "hoje"     && <TabHoje     key="hoje"     tasks={tasks}       setTasks={setTasks} />}
          {tab === "noticias" && <TabNoticias key="noticias" />}
          {tab === "agenda"   && <TabAgenda   key="agenda"   />}
          {tab === "financas" && <TabFinancas key="financas" bills={bills}       setBills={setBills} transactions={transactions} setTransactions={setTransactions} />}
          {tab === "notas"    && <TabNotas    key="notas"    notes={notes}       setNotes={setNotes} />}
          {tab === "listas"   && <TabListas   key="listas"   personal={personal} setPersonal={setPersonal} house={house} setHouse={setHouse} />}
        </main>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);

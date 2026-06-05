/* ============================================================
   app.jsx — shell com Supabase Auth + persistência real
   ============================================================ */
const { useState: useStateApp, useEffect: useEffectApp } = React;

const TABS = [
  { id: "hoje",     label: "Hoje",        icon: "sun"    },
  { id: "noticias", label: "Notícias",    icon: "note"   },
  { id: "agenda",   label: "Agenda",      icon: "calendar"},
  { id: "financas", label: "Finanças",    icon: "wallet" },
  { id: "notas",    label: "Notas & Ideias", icon: "tag" },
  { id: "listas",   label: "Listas",      icon: "list"   },
];

/* ── helpers Supabase ── */
async function dbLoad(table, user_id) {
  const { data, error } = await sb.from(table).select("*").eq("user_id", user_id).order(table === "notes" ? "updated_at" : "created_at");
  if (error) { console.error("dbLoad", table, error); return null; }
  return data;
}

async function dbUpsert(table, rows) {
  const { error } = await sb.from(table).upsert(rows, { onConflict: "id" });
  if (error) console.error("dbUpsert", table, error);
}

async function dbDelete(table, id) {
  const { error } = await sb.from(table).delete().eq("id", id);
  if (error) console.error("dbDelete", table, error);
}

/* ── Ticker ── */
const TICKER_FALLBACK = [
  { cat: "Flamengo",    title: "Flamengo vence e assume liderança do Brasileirão" },
  { cat: "Brasil",      title: "Economia brasileira cresce acima do esperado no trimestre" },
  { cat: "Mundo",       title: "Cúpula do clima reúne líderes para acordo sobre oceanos" },
  { cat: "Esportes",    title: "Rebeca Andrade confirma presença em etapa da Copa do Mundo" },
  { cat: "Libertadores",title: "Conmebol divulga tabela detalhada das quartas de final" },
  { cat: "Economia",    title: "Inflação desacelera e fica abaixo do esperado em maio" },
];

function Ticker() {
  const [items, setItems] = useStateApp(TICKER_FALLBACK);

  useEffectApp(() => {
    fetchNews("Geral").then(news => {
      if (news && news.length > 0) setItems(news.slice(0, 9));
    });
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

/* ── Tela de Login ── */
function LoginScreen({ onLogin }) {
  const [loading, setLoading] = useStateApp(false);
  const [error, setError] = useStateApp("");

  const handleGoogle = async () => {
    setLoading(true);
    setError("");
    const { error } = await sb.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.href,
      },
    });
    if (error) {
      setError("Erro ao fazer login. Tente novamente.");
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--cream)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "var(--sans)",
    }}>
      <div style={{
        background: "var(--white)",
        border: "1.5px solid var(--line)",
        borderRadius: 20,
        padding: "3rem 2.5rem",
        width: 380,
        textAlign: "center",
        boxShadow: "0 8px 40px rgba(44,26,14,0.08)",
      }}>
        <div style={{
          fontFamily: "var(--serif)",
          fontSize: "1.8rem",
          fontWeight: 700,
          color: "var(--mocha)",
          marginBottom: "0.5rem",
        }}>
          Marcela's <span style={{ color: "var(--gold)" }}>Space</span>
        </div>
        <div style={{
          fontSize: "0.83rem",
          color: "var(--gold-dk)",
          marginBottom: "2.5rem",
          lineHeight: 1.6,
        }}>
          Seu espaço pessoal · Rio de Janeiro
        </div>

        <button
          onClick={handleGoogle}
          disabled={loading}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.75rem",
            background: loading ? "var(--sand)" : "var(--espresso)",
            color: "var(--cream)",
            border: "none",
            borderRadius: 12,
            padding: "0.85rem 1.5rem",
            fontSize: "0.88rem",
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
            fontFamily: "var(--sans)",
            transition: "opacity 0.2s",
          }}
        >
          <Icon name="google" size={20} />
          {loading ? "Aguarde..." : "Entrar com Google"}
        </button>

        {error && (
          <div style={{ marginTop: "1rem", fontSize: "0.78rem", color: "var(--red)" }}>
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── App principal ── */
function App() {
  const [session, setSession] = useStateApp(null);
  const [authLoading, setAuthLoading] = useStateApp(true);
  const [tab, setTab] = useStateApp("hoje");

  // dados do Supabase
  const [tasks,    setTasksRaw]    = useStateApp(null);
  const [bills,    setBillsRaw]    = useStateApp(null);
  const [notes,    setNotesRaw]    = useStateApp(null);
  const [personal, setPersonalRaw] = useStateApp(null);
  const [house,    setHouseRaw]    = useStateApp(null);

  /* ── Auth listener ── */
  useEffectApp(() => {
    sb.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });
    const { data: { subscription } } = sb.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setAuthLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  /* ── Carrega dados quando logado ── */
  useEffectApp(() => {
    if (!session) return;
    const uid = session.user.id;

    const seed = async (table, seed, setter) => {
      let rows = await dbLoad(table, uid);
      if (rows && rows.length > 0) {
        setter(rows);
      } else {
        // primeira vez: sobe os seeds
        const withUser = seed.map(r => ({ ...r, id: crypto.randomUUID(), user_id: uid }));
        await dbUpsert(table, withUser);
        setter(withUser);
      }
    };

    seed("tasks",         TASKS_SEED,    setTasksRaw);
    seed("bills",         BILLS_SEED,    setBillsRaw);
    seed("notes",         NOTES_SEED,    setNotesRaw);
    seed("personal_list", PERSONAL_SEED, setPersonalRaw);
    seed("house_list",    HOUSE_SEED,    setHouseRaw);
  }, [session]);

  /* ── Sync helper: upsert novos/editados + delete removidos ── */
  const syncTable = async (table, prev, next, uid, extraFields) => {
    if (!prev) return;
    // detecta IDs removidos
    const prevIds = new Set(prev.map(r => String(r.id)));
    const nextIds = new Set(next.map(r => String(r.id)));
    const deletedIds = [...prevIds].filter(id => !nextIds.has(id));
    // deleta do Supabase
    for (const id of deletedIds) {
      await sb.from(table).delete().eq("id", id).eq("user_id", uid);
    }
    // upsert os que ficaram
    if (next.length > 0) {
      await dbUpsert(table, next.map(r => ({ ...r, user_id: uid, ...extraFields })));
    }
  };

  /* ── Wrappers que sincronizam com Supabase ── */
  const setTasks = async (updater) => {
    const next = typeof updater === "function" ? updater(tasks) : updater;
    setTasksRaw(next);
    await syncTable("tasks", tasks, next, session.user.id, {});
  };

  const setBills = async (updater) => {
    const next = typeof updater === "function" ? updater(bills) : updater;
    setBillsRaw(next);
    await syncTable("bills", bills, next, session.user.id, {});
  };

  const setNotes = async (updater) => {
    const next = typeof updater === "function" ? updater(notes) : updater;
    setNotesRaw(next);
    await syncTable("notes", notes, next, session.user.id, { updated_at: new Date().toISOString() });
  };

  const setPersonal = async (updater) => {
    const next = typeof updater === "function" ? updater(personal) : updater;
    setPersonalRaw(next);
    await syncTable("personal_list", personal, next, session.user.id, {});
  };

  const setHouse = async (updater) => {
    const next = typeof updater === "function" ? updater(house) : updater;
    setHouseRaw(next);
    await syncTable("house_list", house, next, session.user.id, {});
  };

  const handleLogout = async () => {
    await sb.auth.signOut();
    setSession(null);
  };

  /* ── Loading ── */
  if (authLoading) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "var(--cream)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--serif)",
        fontSize: "1.2rem",
        color: "var(--gold-dk)",
        fontStyle: "italic",
      }}>
        Carregando...
      </div>
    );
  }

  /* ── Login ── */
  if (!session) return <LoginScreen />;

  /* ── Dados ainda carregando ── */
  const dataReady = tasks && bills && notes && personal && house;
  if (!dataReady) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "var(--cream)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--serif)",
        fontSize: "1.2rem",
        color: "var(--gold-dk)",
        fontStyle: "italic",
      }}>
        Preparando seu espaço...
      </div>
    );
  }

  const userName = session.user.user_metadata?.name?.split(" ")[0] || "Marcela";
  const userAvatar = session.user.user_metadata?.avatar_url;

  const TAB_ICONS = {
    hoje: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/></svg>,
    noticias: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4 4h16v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4z"/><line x1="8" y1="9" x2="16" y2="9"/><line x1="8" y1="13" x2="12" y2="13"/></svg>,
    agenda: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="16" y1="2" x2="16" y2="6"/></svg>,
    financas: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>,
    notas: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>,
    listas: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="3" cy="6" r="1.2"/><circle cx="3" cy="12" r="1.2"/><circle cx="3" cy="18" r="1.2"/></svg>,
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
          {TABS.map((t) => (
            <button key={t.id} className={"sidebar-btn" + (tab === t.id ? " active" : "")} onClick={() => setTab(t.id)}>
              <span className="sb-icon">{TAB_ICONS[t.id]}</span>
              {t.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="sidebar-logout" onClick={handleLogout}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Sair
          </button>
        </div>
      </aside>

      <div className="shell">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
          <div>
            <div style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: "clamp(1.8rem,3vw,2.4rem)", fontWeight: 900, color: "var(--ink)", lineHeight: 1 }}>
              Marcela's <span style={{ color: "var(--rose)" }}>Space</span>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "var(--serif)", fontStyle: "italic", color: "var(--rose)", fontWeight: 700, fontSize: "1rem" }}>
              {DIAS[TODAY.getDay()].replace("-feira","").charAt(0).toUpperCase() + DIAS[TODAY.getDay()].replace("-feira","").slice(1)}
            </div>
            <div style={{ fontSize: 12, color: "var(--mocha)" }}>{TODAY.getDate()} {MESES_ABR[TODAY.getMonth()]} · {TODAY.getFullYear()}</div>
          </div>
        </div>

        <main>
          {tab === "hoje"     && <TabHoje     key="hoje"     tasks={tasks}    setTasks={setTasks} />}
          {tab === "noticias" && <TabNoticias key="noticias" />}
          {tab === "agenda"   && <TabAgenda   key="agenda"   />}
          {tab === "financas" && <TabFinancas key="financas" bills={bills}    setBills={setBills} />}
          {tab === "notas"    && <TabNotas    key="notas"    notes={notes}    setNotes={setNotes} />}
          {tab === "listas"   && <TabListas   key="listas"   personal={personal} setPersonal={setPersonal} house={house} setHouse={setHouse} />}
        </main>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);

/* ============================================================
   app.jsx — shell: ticker, header, nav, tab routing
   ============================================================ */
const { useState: useStateApp, useEffect: useEffectApp } = React;

const TABS = [
{ id: "hoje", label: "Hoje", icon: "sun" },
{ id: "noticias", label: "Notícias", icon: "note" },
{ id: "agenda", label: "Agenda", icon: "calendar" },
{ id: "financas", label: "Finanças", icon: "wallet" },
{ id: "notas", label: "Notas & Ideias", icon: "tag" },
{ id: "listas", label: "Listas", icon: "list" }];


// persistence helper
function usePersist(key, initial) {
  const [val, setVal] = useStateApp(() => {
    try {const s = localStorage.getItem("ms_" + key);return s ? JSON.parse(s) : initial;}
    catch (e) {return initial;}
  });
  useEffectApp(() => {
    try {localStorage.setItem("ms_" + key, JSON.stringify(val));} catch (e) {}
  }, [val]);
  return [val, setVal];
}

function Ticker() {
  const items = NEWS.slice(0, 9);
  const row =
  <span className="ticker-track">
      {[...items, ...items].map((n, i) =>
    <span className="ticker-item" key={i}>
          <span className="cat">{n.cat}</span>
          <span className="sep">·</span>
          <span>{n.title}</span>
        </span>
    )}
    </span>;

  return (
    <div className="ticker">
      <div className="ticker-label"><span className="dot"></span> Últimas</div>
      <div className="ticker-viewport">{row}</div>
    </div>);

}

function App() {
  const [tab, setTab] = usePersist("tab", "hoje");

  // shared persisted state
  const [tasks, setTasks] = usePersist("tasks", TASKS_SEED);
  const [bills, setBills] = usePersist("bills", BILLS_SEED);
  const [notes, setNotes] = usePersist("notes", NOTES_SEED);
  const [personal, setPersonal] = usePersist("personal", PERSONAL_SEED);
  const [house, setHouse] = usePersist("house", HOUSE_SEED);

  const headerDate =
  <div className="header-date">
      <div className="d1">{DIAS[TODAY.getDay()].replace("-feira", "")}</div>
      <div className="d2">{TODAY.getDate()} {MESES_ABR[TODAY.getMonth()]} · {TODAY.getFullYear()}</div>
    </div>;


  return (
    <div className="app">
      <Ticker />
      <div className="shell">
        <header className="header">
          <div className="wordmark">
            <div className="kicker">Espaço pessoal · Rio de Janeiro</div>
            <h1 style={{ fontFamily: "Raleway" }}>Marcela's Space</h1>
          </div>
          <div className="header-right">
            {headerDate}
            <div className="avatar">M</div>
          </div>
        </header>

        <nav className="nav">
          {TABS.map((t) =>
          <button key={t.id} className={tab === t.id ? "active" : ""} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          )}
        </nav>

        <main>
          {tab === "hoje" && <TabHoje key="hoje" tasks={tasks} setTasks={setTasks} />}
          {tab === "noticias" && <TabNoticias key="noticias" />}
          {tab === "agenda" && <TabAgenda key="agenda" />}
          {tab === "financas" && <TabFinancas key="financas" bills={bills} setBills={setBills} />}
          {tab === "notas" && <TabNotas key="notas" notes={notes} setNotes={setNotes} />}
          {tab === "listas" && <TabListas key="listas" personal={personal} setPersonal={setPersonal} house={house} setHouse={setHouse} />}
        </main>
      </div>
    </div>);

}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
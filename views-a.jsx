/* ============================================================
   views-a.jsx — Hoje, Notícias, Agenda
   ============================================================ */
const { useState, useMemo, useEffect } = React;

/* ---------------------------------------------------------------
   HOJE
--------------------------------------------------------------- */
function TabHoje({ tasks, setTasks }) {
  const [weather, setWeather] = useState(null);
  const [news, setNews] = useState([]);

  const { day } = cycleInfo(TODAY);
  const next = nextPeriodDate(TODAY);
  const daysToNext = daysBetween(TODAY, next);

  const toggleTask = (id) => setTasks((ts) => ts.map((t) => t.id === id ? { ...t, done: !t.done } : t));
  const deleteTask = (id) => setTasks((ts) => ts.filter((t) => t.id !== id));
  const doneCount = tasks ? tasks.filter((t) => t.done).length : 0;

  const pct = day / CYCLE.length;
  const R = 30, C = 2 * Math.PI * R;

  useEffect(() => {
    fetchWeather().then(setWeather);
    fetchNews("Geral").then(d => setNews(d.slice(0, 3)));
  }, []);

  const featured = news[0];

  return (
    <div className="tab-pane page-pad">
      <div className="greet">
        <div>
          <div className="section-eyebrow" style={{ marginBottom: 8 }}>
            <Icon name="sparkle" size={14} /><span>{longDate(TODAY)}</span>
          </div>
          <h2>{greeting()}, Marcela</h2>
          <div className="sub">
            {tasks ? `Você tem ${tasks.length - doneCount} tarefas para hoje.` : "Carregando..."}
          </div>
        </div>
        <div className="weather">
          {weather ? (
            <>
              <span className="wx-icon"><Icon name={weather.icon} size={56} stroke={1.4} /></span>
              <div><div className="temp">{weather.temp}°</div></div>
              <div className="wx-meta">
                <div className="cond">{weather.cond}</div>
                <div className="loc">{weather.loc}</div>
                <div className="hl">Máx {weather.hi}° · Mín {weather.lo}°</div>
              </div>
            </>
          ) : (
            <div style={{ color: "var(--gold-dk)", fontSize: 13 }}>Carregando clima...</div>
          )}
        </div>
      </div>

      <div className="hoje-grid" style={{ marginTop: 22 }}>
        <div className="hoje-col">
          {featured ? (
            <div className="featured">
              <span className="fcat"><Icon name="bolt" size={13} /> Destaque do dia</span>
              <h3>{featured.title}</h3>
              <p>{featured.summary}</p>
              <div className="src">
                <span className="who">{featured.src}</span>
                <span className="when">{featured.time}</span>
              </div>
            </div>
          ) : (
            <div className="featured" style={{ minHeight: 120, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--gold-dk)", fontSize: 13 }}>
              Carregando notícias...
            </div>
          )}

          <div className="card cream">
            <Eyebrow icon="check">Tarefas de hoje — {doneCount}/{tasks ? tasks.length : 0}</Eyebrow>
            <div>
              {tasks && tasks.map((t) => (
                <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <CheckRow done={t.done} meta={t.meta} label={t.label}
                      onToggle={() => toggleTask(t.id)} />
                  </div>
                  <button className="btn-delete" onClick={() => deleteTask(t.id)} title="Excluir tarefa"
                    style={{ opacity: 0.6, flexShrink: 0 }}
                    onMouseEnter={e => e.currentTarget.style.opacity = 1}
                    onMouseLeave={e => e.currentTarget.style.opacity = 0.6}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
            <AddTaskRow onAdd={(label) => {
              const newTask = { id: crypto.randomUUID(), label, meta: "", done: false };
              setTasks(ts => [...ts, newTask]);
            }} />
          </div>
        </div>

        <div className="hoje-col">
          <div className="cycle">
            <div className="top"><Eyebrow icon="flower">Ciclo menstrual</Eyebrow></div>
            <div className="ring">
              <svg className="cycle-ring-svg" width="76" height="76">
                <circle cx="38" cy="38" r={R} fill="none" stroke="var(--blush-soft)" strokeWidth="8" />
                <circle cx="38" cy="38" r={R} fill="none" stroke="var(--blush)" strokeWidth="8"
                  strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - pct)} />
              </svg>
              <div>
                <div className="day-num">Dia {day}</div>
                <div className="phase">Menstruação</div>
                <div className="next">Próxima em {daysToNext} dias · {next.getDate()}/{String(next.getMonth() + 1).padStart(2, "0")}</div>
              </div>
            </div>
            <div className="pips">
              {Array.from({ length: CYCLE.length }).map((_, i) => {
                const d = addDays(cycleInfo(TODAY).start, i);
                const st = cycleStatus(d);
                return <span key={i} className={"pip" + (st === "period" || st === "predicted" ? " on" : "") + (sameDay(d, TODAY) ? " today" : "")}></span>;
              })}
            </div>
          </div>

          <div className="card cream">
            <Eyebrow icon="calendar">Agenda de hoje</Eyebrow>
            <ManualEvents date={ymd(TODAY)} />
          </div>
        </div>
      </div>
    </div>
  );
}

function AddTaskRow({ onAdd }) {
  const [val, setVal] = useState("");
  return (
    <div style={{ display: "flex", gap: 8, marginTop: 10, borderTop: "1px solid var(--line)", paddingTop: 10 }}>
      <input value={val} placeholder="Adicionar tarefa..."
        onChange={e => setVal(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter" && val.trim()) { onAdd(val.trim()); setVal(""); } }}
        style={{ flex: 1, border: "1.5px solid var(--line)", borderRadius: 8, padding: "6px 10px", fontSize: 13, fontFamily: "var(--sans)", background: "var(--cream)", outline: "none", color: "var(--espresso)" }} />
      <button onClick={() => { if (val.trim()) { onAdd(val.trim()); setVal(""); } }}
        style={{ background: "var(--espresso)", color: "var(--cream)", border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 13, cursor: "pointer", fontFamily: "var(--sans)" }}>
        +
      </button>
    </div>
  );
}

/* ---------------------------------------------------------------
   MANUAL EVENTS (substituindo Google Calendar temporariamente)
--------------------------------------------------------------- */
const EVENTS_STORE_KEY = "ms_manual_events";

function loadEvents() {
  try { const s = localStorage.getItem(EVENTS_STORE_KEY); return s ? JSON.parse(s) : EVENTS_SEED; }
  catch(e) { return EVENTS_SEED; }
}

function saveEvents(evs) {
  try { localStorage.setItem(EVENTS_STORE_KEY, JSON.stringify(evs)); } catch(e) {}
}

function ManualEvents({ date }) {
  const [allEvents, setAllEvents] = useState(loadEvents);
  const [showAdd, setShowAdd] = useState(false);
  const [draft, setDraft] = useState({ time: "", title: "", place: "" });

  const dayEvents = allEvents.filter(e => e.date === date);

  const addEvent = () => {
    if (!draft.title) return;
    const ev = { id: crypto.randomUUID(), date, time: draft.time || "00:00", title: draft.title, place: draft.place };
    const next = [...allEvents, ev].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
    setAllEvents(next);
    saveEvents(next);
    setDraft({ time: "", title: "", place: "" });
    setShowAdd(false);
  };

  const deleteEvent = (id) => {
    const next = allEvents.filter(e => e.id !== id);
    setAllEvents(next);
    saveEvents(next);
  };

  return (
    <div>
      {dayEvents.length === 0 && !showAdd && (
        <div style={{ padding: "16px 4px", color: "var(--gold-dk)", fontSize: 13, textAlign: "center" }}>
          Nenhum compromisso neste dia.
        </div>
      )}
      {dayEvents.map(e => (
        <div className="evt" key={e.id} style={{ position: "relative" }}>
          <div className="time">{e.time}</div>
          <div className="bar"></div>
          <div className="ev-body">
            <div className="ti">{e.title}</div>
            {e.place && <div className="pl">{e.place}</div>}
          </div>
          <button className="btn-delete" onClick={() => deleteEvent(e.id)} title="Excluir evento"
            style={{ opacity: 0.5 }}
            onMouseEnter={e => e.currentTarget.style.opacity = 1}
            onMouseLeave={e => e.currentTarget.style.opacity = 0.5}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            </svg>
          </button>
        </div>
      ))}

      {showAdd && (
        <div className="add-form" style={{ marginTop: 8 }}>
          <div className="form-row">
            <input type="time" value={draft.time} onChange={e => setDraft(v => ({...v, time: e.target.value}))} style={{ maxWidth: 110 }} />
            <input placeholder="Título do evento" value={draft.title} onChange={e => setDraft(v => ({...v, title: e.target.value}))} />
          </div>
          <input placeholder="Local (opcional)" value={draft.place} onChange={e => setDraft(v => ({...v, place: e.target.value}))} />
          <div className="form-actions">
            <button className="btn-cancel" onClick={() => setShowAdd(false)}>Cancelar</button>
            <button className="btn-confirm" onClick={addEvent}>Adicionar</button>
          </div>
        </div>
      )}

      <button className="btn-add-trigger" onClick={() => setShowAdd(v => !v)}>
        {showAdd ? "— Fechar" : "+ Novo evento"}
      </button>
    </div>
  );
}

/* ---------------------------------------------------------------
   NOTÍCIAS
--------------------------------------------------------------- */
function TabNoticias() {
  const [filter, setFilter] = useState("Geral");
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchNews(filter).then(d => { setArticles(d); setLoading(false); });
  }, [filter]);

  return (
    <div className="tab-pane page-pad">
      <div className="page-head">
        <div className="section-eyebrow"><Icon name="note" size={14} /><span>Edição de hoje · {TODAY.getDate()} de {MESES[TODAY.getMonth()]}</span></div>
        <h2>Notícias</h2>
        <p>Seu resumo editorial do dia — esportes, Brasil, mundo e economia em um só lugar.</p>
      </div>

      <div className="filters">
        {CATEGORIES.map((c) => (
          <button key={c} className={filter === c ? "active" : ""} onClick={() => setFilter(c)}>{c}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: "3rem", textAlign: "center", color: "var(--gold-dk)", fontSize: 14, fontStyle: "italic" }}>
          Buscando notícias...
        </div>
      ) : (
        <div className="news-cols">
          {articles.map((n, i) => (
            <div key={n.id || i} className={"news-card" + (i === 0 ? " big" : "")}
              onClick={() => n.url && window.open(n.url, "_blank")}
              style={{ cursor: n.url ? "pointer" : "default" }}>
              <div className="nc-cat">{n.cat}</div>
              <h3>{n.title}</h3>
              <p>{n.summary}</p>
              <div className="nc-foot">
                <span className="who">{n.src}</span><span>·</span><span>{n.time}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------
   AGENDA
--------------------------------------------------------------- */
function TabAgenda() {
  const [view, setView] = useState({ y: TODAY.getFullYear(), m: TODAY.getMonth() });
  const [selected, setSelected] = useState(ymd(TODAY));
  const [allEvents, setAllEvents] = useState(loadEvents);

  const first = new Date(view.y, view.m, 1);
  const startDow = first.getDay();
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const prevDays = new Date(view.y, view.m, 0).getDate();

  const cells = [];
  for (let i = 0; i < startDow; i++) cells.push({ day: prevDays - startDow + 1 + i, muted: true });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, muted: false });
  while (cells.length % 7 !== 0) cells.push({ day: cells.length - daysInMonth - startDow + 1, muted: true });

  const move = (dir) => setView((v) => {
    let m = v.m + dir, y = v.y;
    if (m < 0) { m = 11; y--; } if (m > 11) { m = 0; y++; }
    return { y, m };
  });

  const selDate = new Date(selected + "T00:00:00");
  const selEvents = allEvents.filter(e => e.date === selected);

  const [showAdd, setShowAdd] = useState(false);
  const [draft, setDraft] = useState({ time: "", title: "", place: "" });

  const addEvent = () => {
    if (!draft.title) return;
    const ev = { id: crypto.randomUUID(), date: selected, time: draft.time || "00:00", title: draft.title, place: draft.place };
    const next = [...allEvents, ev].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
    setAllEvents(next);
    saveEvents(next);
    setDraft({ time: "", title: "", place: "" });
    setShowAdd(false);
  };

  const deleteEvent = (id) => {
    const next = allEvents.filter(e => e.id !== id);
    setAllEvents(next);
    saveEvents(next);
  };

  return (
    <div className="tab-pane page-pad">
      <div className="page-head">
        <div className="section-eyebrow"><Icon name="calendar" size={14} /><span>Calendário & ciclo</span></div>
        <h2>Agenda</h2>
        <p>Seus compromissos e o acompanhamento do ciclo menstrual.</p>
      </div>

      <div className="agenda-grid">
        <div>
          <div className="cal">
            <div className="cal-head">
              <h3>{MESES[view.m]} {view.y}</h3>
              <div className="cal-nav">
                <button onClick={() => move(-1)}><Icon name="chevL" size={18} /></button>
                <button onClick={() => move(1)}><Icon name="chevR" size={18} /></button>
              </div>
            </div>
            <div className="cal-dows">{DOWS.map((d) => <span key={d}>{d}</span>)}</div>
            <div className="cal-grid">
              {cells.map((c, i) => {
                if (c.muted) return <div key={i} className="cal-cell muted">{c.day}</div>;
                const dObj = new Date(view.y, view.m, c.day);
                const dstr = ymd(dObj);
                const st = cycleStatus(dObj);
                const evs = allEvents.filter(e => e.date === dstr);
                const cls = ["cal-cell"];
                if (st === "period") cls.push("period");
                else if (st === "predicted") cls.push("predicted");
                if (st === "ovulation") cls.push("ovul");
                if (sameDay(dObj, TODAY)) cls.push("today");
                if (selected === dstr) cls.push("sel");
                return (
                  <div key={i} className={cls.join(" ")} onClick={() => setSelected(dstr)} style={{ cursor: "pointer" }}>
                    {c.day}
                    {evs.length > 0 && <span className="evdot"></span>}
                  </div>
                );
              })}
            </div>
            <GoogleCalendarEmbed />
            <div className="cal-legend">
              <div className="lg"><span className="sw period"></span> Menstruação</div>
              <div className="lg"><span className="sw predicted"></span> Previsão</div>
              <div className="lg"><span className="sw ovul"></span> Ovulação</div>
              <div className="lg"><span className="sw evt"></span> Compromisso</div>
            </div>
          </div>
        </div>

        <div className="card cream">
          <Eyebrow icon="clock">{DIAS[selDate.getDay()]}, {selDate.getDate()} de {MESES[selDate.getMonth()]}</Eyebrow>

          {selEvents.length === 0 && !showAdd && (
            <div style={{ padding: "16px 4px", color: "var(--gold-dk)", fontSize: 13, textAlign: "center" }}>
              Nenhum compromisso neste dia.
            </div>
          )}

          {selEvents.map(e => (
            <div className="evt" key={e.id}>
              <div className="time">{e.time}</div>
              <div className="bar"></div>
              <div className="ev-body">
                <div className="ti">{e.title}</div>
                {e.place && <div className="pl">{e.place}</div>}
              </div>
              <button className="btn-delete" onClick={() => deleteEvent(e.id)} title="Excluir"
                style={{ opacity: 0.5 }}
                onMouseEnter={e => e.currentTarget.style.opacity = 1}
                onMouseLeave={e => e.currentTarget.style.opacity = 0.5}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                </svg>
              </button>
            </div>
          ))}

          {showAdd && (
            <div className="add-form" style={{ marginTop: 8 }}>
              <div className="form-row">
                <input type="time" value={draft.time} onChange={e => setDraft(v => ({...v, time: e.target.value}))} style={{ maxWidth: 110 }} />
                <input placeholder="Título do evento" value={draft.title} onChange={e => setDraft(v => ({...v, title: e.target.value}))} />
              </div>
              <input placeholder="Local (opcional)" value={draft.place} onChange={e => setDraft(v => ({...v, place: e.target.value}))} />
              <div className="form-actions">
                <button className="btn-cancel" onClick={() => setShowAdd(false)}>Cancelar</button>
                <button className="btn-confirm" onClick={addEvent}>Adicionar</button>
              </div>
            </div>
          )}

          <button className="btn-add-trigger" onClick={() => setShowAdd(v => !v)}>
            {showAdd ? "— Fechar" : "+ Novo evento"}
          </button>

          {cycleStatus(selDate) && (
            <div style={{ marginTop: 18, paddingTop: 16, borderTop: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 10, color: "var(--blush)", fontWeight: 600, fontSize: 13.5 }}>
              <Icon name="flower" size={16} />
              {cycleStatus(selDate) === "period" && "Dia de menstruação"}
              {cycleStatus(selDate) === "predicted" && "Menstruação prevista"}
              {cycleStatus(selDate) === "ovulation" && "Janela de ovulação"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { TabHoje, TabNoticias, TabAgenda });

/* ---------------------------------------------------------------
   GOOGLE CALENDAR EMBED
   O usuário cola o ID do calendário uma vez e fica salvo
--------------------------------------------------------------- */
function GoogleCalendarEmbed() {
  const [calId, setCalId] = useState(() => {
    return localStorage.getItem("ms_gcal_id") || "";
  });
  const [inputVal, setInputVal] = useState("");
  const [editing, setEditing] = useState(!calId);

  const save = () => {
    const val = inputVal.trim();
    if (!val) return;
    localStorage.setItem("ms_gcal_id", val);
    setCalId(val);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="gcal-setup">
        <div style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontWeight: 700, fontSize: 16, color: "var(--ink)", marginBottom: 6 }}>
          Conectar Google Calendar
        </div>
        <p>
          Para sincronizar, você precisa tornar seu calendário público e colar o ID abaixo.<br/>
          <strong>Google Calendar → Configurações → Seu calendário → Integrar calendário → ID do calendário</strong>
        </p>
        <input
          placeholder="seuemail@gmail.com ou ID do calendário"
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          onKeyDown={e => e.key === "Enter" && save()}
        />
        <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
          {calId && <button className="btn-cancel" onClick={() => setEditing(false)}>Cancelar</button>}
          <button className="btn-confirm" onClick={save}>Conectar</button>
        </div>
      </div>
    );
  }

  const src = `https://calendar.google.com/calendar/embed?src=${encodeURIComponent(calId)}&ctz=America%2FSao_Paulo&showTitle=0&showNav=1&showPrint=0&showTabs=0&showCalendars=0&mode=WEEK&hl=pt_BR`;

  return (
    <div className="gcal-embed">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "var(--cream-2)", borderBottom: "1px solid var(--line)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Icon name="google" size={16} />
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>Google Calendar</span>
        </div>
        <button onClick={() => setEditing(true)} style={{ background: "none", border: "none", fontSize: 11, color: "var(--gold-dk)", cursor: "pointer", fontFamily: "var(--sans)" }}>
          Alterar
        </button>
      </div>
      <iframe src={src} title="Google Calendar" />
    </div>
  );
}

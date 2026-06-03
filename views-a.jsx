/* ============================================================
   views-a.jsx — Hoje, Notícias, Agenda (com APIs reais)
   ============================================================ */
const { useState, useMemo, useEffect } = React;

/* ---------------------------------------------------------------
   HOJE
--------------------------------------------------------------- */
function TabHoje({ tasks, setTasks }) {
  const [weather, setWeather] = useState(null);
  const [news, setNews] = useState([]);
  const [todayEvents, setTodayEvents] = useState([]);

  const { day } = cycleInfo(TODAY);
  const next = nextPeriodDate(TODAY);
  const daysToNext = daysBetween(TODAY, next);

  const toggleTask = (id) => setTasks((ts) => ts.map((t) => t.id === id ? { ...t, done: !t.done } : t));
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
                <CheckRow key={t.id} done={t.done} meta={t.meta} label={t.label}
                  onToggle={() => toggleTask(t.id)} />
              ))}
            </div>
            <AddTaskRow onAdd={(label) => {
              const newTask = { id: Date.now(), label, meta: "", done: false };
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
            <GoogleCalendarWidget date={ymd(TODAY)} compact />
          </div>
        </div>
      </div>
    </div>
  );
}

function AddTaskRow({ onAdd }) {
  const [open, setOpen] = useState(false);
  const [val, setVal] = useState("");
  if (!open) return (
    <div style={{ padding: "8px 0 0", borderTop: "1px solid var(--line)", marginTop: 8 }}>
      <button onClick={() => setOpen(true)} style={{ background: "none", border: "none", color: "var(--gold)", fontSize: 13, cursor: "pointer", fontFamily: "var(--sans)", fontWeight: 600 }}>
        + Nova tarefa
      </button>
    </div>
  );
  return (
    <div style={{ display: "flex", gap: 8, marginTop: 10, borderTop: "1px solid var(--line)", paddingTop: 10 }}>
      <input autoFocus value={val} placeholder="Adicionar tarefa..."
        onChange={e => setVal(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter" && val.trim()) { onAdd(val.trim()); setVal(""); setOpen(false); } if (e.key === "Escape") setOpen(false); }}
        style={{ flex: 1, border: "1.5px solid var(--gold)", borderRadius: 8, padding: "6px 10px", fontSize: 13, fontFamily: "var(--sans)", background: "var(--cream)", outline: "none", color: "var(--espresso)" }} />
      <button onClick={() => { if (val.trim()) { onAdd(val.trim()); setVal(""); } setOpen(false); }}
        style={{ background: "var(--espresso)", color: "var(--cream)", border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 13, cursor: "pointer", fontFamily: "var(--sans)" }}>
        +
      </button>
    </div>
  );
}

/* ---------------------------------------------------------------
   GOOGLE CALENDAR WIDGET
--------------------------------------------------------------- */
const GCAL_API_KEY = "AIzaSyAt8Ps5iBmNm3atvwccso5edXAkrsgMhFU";

function GoogleCalendarWidget({ date, compact }) {
  const [events, setEvents] = useState(null);
  const [calendarId, setCalendarId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Tenta pegar o calendarId do usuário logado via Supabase session
    sb.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email) {
        setCalendarId(session.user.email);
      }
    });
  }, []);

  useEffect(() => {
    if (!calendarId || !date) return;
    const start = new Date(date + "T00:00:00").toISOString();
    const end   = new Date(date + "T23:59:59").toISOString();
    fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?timeMin=${start}&timeMax=${end}&singleEvents=true&orderBy=startTime&key=${GCAL_API_KEY}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) { setError("Calendário privado. Adicione eventos manualmente."); setEvents([]); return; }
        setEvents(d.items || []);
      })
      .catch(() => { setError("Erro ao carregar agenda."); setEvents([]); });
  }, [calendarId, date]);

  if (error) return (
    <div style={{ fontSize: 13, color: "var(--gold-dk)", padding: "12px 0" }}>{error}</div>
  );

  if (!events) return (
    <div style={{ fontSize: 13, color: "var(--gold-dk)", padding: "12px 0" }}>Carregando agenda...</div>
  );

  if (events.length === 0) return (
    <div style={{ fontSize: 13, color: "var(--gold-dk)", padding: "12px 0", textAlign: "center" }}>
      Nenhum compromisso neste dia.
    </div>
  );

  return (
    <div>
      {events.map((e, i) => (
        <div className="evt" key={e.id || i}>
          <div className="time">{e.start?.dateTime ? new Date(e.start.dateTime).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "Dia todo"}</div>
          <div className="bar"></div>
          <div className="ev-body">
            <div className="ti">{e.summary}</div>
            {e.location && <div className="pl">{e.location}</div>}
          </div>
        </div>
      ))}
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
                const cls = ["cal-cell"];
                if (st === "period") cls.push("period");
                else if (st === "predicted") cls.push("predicted");
                if (st === "ovulation") cls.push("ovul");
                if (sameDay(dObj, TODAY)) cls.push("today");
                if (selected === dstr) cls.push("sel");
                return (
                  <div key={i} className={cls.join(" ")} onClick={() => setSelected(dstr)} style={{ cursor: "pointer" }}>
                    {c.day}
                  </div>
                );
              })}
            </div>
            <div className="cal-legend">
              <div className="lg"><span className="sw period"></span> Menstruação</div>
              <div className="lg"><span className="sw predicted"></span> Previsão</div>
              <div className="lg"><span className="sw ovul"></span> Ovulação</div>
            </div>
          </div>

          <div className="gcal">
            <div className="gc-ico"><Icon name="google" size={22} /></div>
            <div className="gc-txt">
              <div className="t">Google Calendar</div>
              <div className="s">Sincronizado com sua conta Google</div>
            </div>
          </div>
        </div>

        <div className="card cream">
          <Eyebrow icon="clock">{DIAS[selDate.getDay()]}, {selDate.getDate()} de {MESES[selDate.getMonth()]}</Eyebrow>
          <GoogleCalendarWidget date={selected} />
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

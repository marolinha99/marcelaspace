/* ============================================================
   views-a.jsx — Hoje, Notícias, Agenda
   ============================================================ */
const { useState, useMemo } = React;

/* ---------------------------------------------------------------
   HOJE
--------------------------------------------------------------- */
function TabHoje({ tasks, setTasks }) {
  const featured = NEWS.find((n) => n.featured);
  const todayEvents = EVENTS.filter((e) => e.date === ymd(TODAY));
  const { day } = cycleInfo(TODAY);
  const next = nextPeriodDate(TODAY);
  const daysToNext = daysBetween(TODAY, next);

  const toggleTask = (id) => setTasks((ts) => ts.map((t) => t.id === id ? { ...t, done: !t.done } : t));
  const doneCount = tasks.filter((t) => t.done).length;

  // cycle ring
  const pct = day / CYCLE.length;
  const R = 30,C = 2 * Math.PI * R;

  return (
    <div className="tab-pane page-pad">
      {/* greeting + weather */}
      <div className="greet">
        <div>
          <div className="section-eyebrow" style={{ marginBottom: 8 }}>
            <Icon name="sparkle" size={14} /><span>{longDate(TODAY)}</span>
          </div>
          <h2>{greeting()}, Marcela</h2>
          <div className="sub">Você tem {todayEvents.length} compromissos e {tasks.length - doneCount} tarefas para hoje.</div>
        </div>
        <div className="weather">
          <span className="wx-icon"><Icon name={WEATHER.icon} size={56} stroke={1.4} /></span>
          <div>
            <div className="temp">{WEATHER.temp}°</div>
          </div>
          <div className="wx-meta">
            <div className="cond">{WEATHER.cond}</div>
            <div className="loc">{WEATHER.loc}</div>
            <div className="hl">Máx {WEATHER.hi}° · Mín {WEATHER.lo}°</div>
          </div>
        </div>
      </div>

      <div className="hoje-grid" style={{ marginTop: 22 }}>
        {/* LEFT column */}
        <div className="hoje-col">
          <div className="featured">
            <span className="fcat"><Icon name="bolt" size={13} /> Destaque do dia</span>
            <h3>{featured.title}</h3>
            <p>{featured.summary}</p>
            <div className="src">
              <span className="who">{featured.src}</span>
              <span className="when">{featured.time}</span>
            </div>
          </div>

          <div className="card cream">
            <Eyebrow icon="check">Tarefas de hoje — {doneCount}/{tasks.length}</Eyebrow>
            <div>
              {tasks.map((t) =>
              <CheckRow key={t.id} done={t.done} meta={t.meta} label={t.label}
              onToggle={() => toggleTask(t.id)} />
              )}
            </div>
          </div>
        </div>

        {/* RIGHT column */}
        <div className="hoje-col">
          {/* cycle mini */}
          <div className="cycle">
            <div className="top">
              <Eyebrow icon="flower">Ciclo menstrual</Eyebrow>
            </div>
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

          {/* agenda upcoming */}
          <div className="card cream">
            <Eyebrow icon="calendar">Agenda de hoje</Eyebrow>
            <div>
              {todayEvents.map((e) =>
              <div className="evt" key={e.id}>
                  <div className="time">{e.time}</div>
                  <div className="bar"></div>
                  <div className="ev-body">
                    <div className="ti">{e.title}</div>
                    <div className="pl">{e.place}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>);

}

/* ---------------------------------------------------------------
   NOTÍCIAS
--------------------------------------------------------------- */
function TabNoticias() {
  const [filter, setFilter] = useState("Geral");
  const list = useMemo(() => {
    if (filter === "Geral") return NEWS;
    return NEWS.filter((n) => n.cat === filter);
  }, [filter]);

  return (
    <div className="tab-pane page-pad">
      <div className="page-head">
        <div className="section-eyebrow"><Icon name="note" size={14} /><span>Edição de hoje · {TODAY.getDate()} de {MESES[TODAY.getMonth()]}</span></div>
        <h2 style={{ fontFamily: "Poppins" }}>Notícias</h2>
        <p>Seu resumo editorial do dia — esportes, Brasil, mundo e economia em um só lugar.</p>
      </div>

      <div className="filters">
        {CATEGORIES.map((c) =>
        <button key={c} className={filter === c ? "active" : ""} onClick={() => setFilter(c)}>{c}</button>
        )}
      </div>

      <div className="news-cols">
        {list.map((n, i) =>
        <div key={n.id} className={"news-card" + (n.featured && filter === "Geral" || i === 0 && n.featured ? " big" : "")}>
            <div className="nc-cat">{n.cat}</div>
            <h3>{n.title}</h3>
            <p>{n.summary}</p>
            <div className="nc-foot">
              <span className="who">{n.src}</span><span>·</span><span>{n.time}</span>
            </div>
          </div>
        )}
      </div>
    </div>);

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
    let m = v.m + dir,y = v.y;
    if (m < 0) {m = 11;y--;}if (m > 11) {m = 0;y++;}
    return { y, m };
  });

  const eventsByDate = (dstr) => EVENTS.filter((e) => e.date === dstr);
  const selEvents = eventsByDate(selected);
  const selDate = new Date(selected + "T00:00:00");

  return (
    <div className="tab-pane page-pad">
      <div className="page-head">
        <div className="section-eyebrow"><Icon name="calendar" size={14} /><span>Calendário & ciclo</span></div>
        <h2>Agenda</h2>
        <p>Seus compromissos e o acompanhamento do ciclo menstrual, com previsões para os próximos meses.</p>
      </div>

      <div className="agenda-grid">
        <div>
          <div className="cal">
            <div className="cal-head">
              <h3>{MESES[view.m]} {view.y}</h3>
              <div className="cal-nav">
                <button onClick={() => move(-1)} aria-label="anterior"><Icon name="chevL" size={18} /></button>
                <button onClick={() => move(1)} aria-label="próximo"><Icon name="chevR" size={18} /></button>
              </div>
            </div>
            <div className="cal-dows">{DOWS.map((d) => <span key={d}>{d}</span>)}</div>
            <div className="cal-grid">
              {cells.map((c, i) => {
                if (c.muted) return <div key={i} className="cal-cell muted">{c.day}</div>;
                const dObj = new Date(view.y, view.m, c.day);
                const dstr = ymd(dObj);
                const st = cycleStatus(dObj);
                const evs = eventsByDate(dstr);
                const cls = ["cal-cell"];
                if (st === "period") cls.push("period");else
                if (st === "predicted") cls.push("predicted");
                if (st === "ovulation") cls.push("ovul");
                if (sameDay(dObj, TODAY)) cls.push("today");
                if (selected === dstr) cls.push("sel");
                return (
                  <div key={i} className={cls.join(" ")} onClick={() => setSelected(dstr)} style={{ cursor: "pointer" }}>
                    {c.day}
                    {evs.length > 0 && <span className="evdot"></span>}
                  </div>);

              })}
            </div>
            <div className="cal-legend">
              <div className="lg"><span className="sw period"></span> Menstruação</div>
              <div className="lg"><span className="sw predicted"></span> Previsão</div>
              <div className="lg"><span className="sw ovul"></span> Ovulação</div>
              <div className="lg"><span className="sw evt"></span> Compromisso</div>
            </div>
          </div>

          <div className="gcal">
            <div className="gc-ico"><Icon name="google" size={22} /></div>
            <div className="gc-txt">
              <div className="t">Google Calendar</div>
              <div className="s">Sincronizado · última atualização há 5 min</div>
            </div>
            <button className="gc-btn">Sincronizar</button>
          </div>
        </div>

        <div className="card cream">
          <Eyebrow icon="clock">{DIAS[selDate.getDay()]}, {selDate.getDate()} de {MESES[selDate.getMonth()]}</Eyebrow>
          {selEvents.length === 0 ?
          <div style={{ padding: "30px 4px", color: "var(--gold-dk)", fontSize: 14, textAlign: "center" }}>
              Nenhum compromisso neste dia.
            </div> :

          <div>
              {selEvents.map((e) =>
            <div className="evt" key={e.id}>
                  <div className="time">{e.time}</div>
                  <div className="bar"></div>
                  <div className="ev-body">
                    <div className="ti">{e.title}</div>
                    <div className="pl">{e.place}</div>
                  </div>
                </div>
            )}
            </div>
          }
          {cycleStatus(selDate) &&
          <div style={{ marginTop: 18, paddingTop: 16, borderTop: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 10, color: "var(--blush)", fontWeight: 600, fontSize: 13.5 }}>
              <Icon name="flower" size={16} />
              {cycleStatus(selDate) === "period" && "Dia de menstruação"}
              {cycleStatus(selDate) === "predicted" && "Menstruação prevista"}
              {cycleStatus(selDate) === "ovulation" && "Janela de ovulação"}
            </div>
          }
        </div>
      </div>
    </div>);

}

Object.assign(window, { TabHoje, TabNoticias, TabAgenda });
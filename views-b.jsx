/* ============================================================
   views-b.jsx — Finanças, Notas & Ideias, Listas
   ============================================================ */
const { useState: useStateB } = React;

const brl = (n) => "R$ " + Math.abs(n).toLocaleString("pt-BR", { minimumFractionDigits: 0 });

/* ---------------------------------------------------------------
   FINANÇAS
--------------------------------------------------------------- */
function TabFinancas({ bills, setBills }) {
  const toggleBill = (id) => setBills(bs => bs.map(b => b.id === id ? { ...b, paid: !b.paid } : b));
  const pending = bills.filter(b => !b.paid).reduce((s, b) => s + b.amt, 0);
  const paidCount = bills.filter(b => b.paid).length;

  return (
    <div className="tab-pane page-pad">
      <div className="page-head">
        <div className="section-eyebrow"><Icon name="wallet" size={14} /><span>Junho de 2026</span></div>
        <h2>Finanças</h2>
        <p>Seu panorama financeiro do mês — receitas, despesas e as contas da casa.</p>
      </div>

      <div className="fin-cards">
        <div className="fin-card inc">
          <div className="fc-lbl"><Icon name="wallet" size={13} /> Receitas</div>
          <div className="fc-val" style={{color:"var(--green)"}}>{brl(FIN_SUMMARY.income)}</div>
          <div className="fc-sub">+12% em relação a maio</div>
        </div>
        <div className="fin-card exp">
          <div className="fc-lbl"><Icon name="cart" size={13} /> Despesas</div>
          <div className="fc-val" style={{color:"var(--red)"}}>{brl(FIN_SUMMARY.expense)}</div>
          <div className="fc-sub">61% da receita do mês</div>
        </div>
        <div className="fin-card bal">
          <div className="fc-lbl"><Icon name="sparkle" size={13} /> Saldo</div>
          <div className="fc-val">{brl(FIN_SUMMARY.balance)}</div>
          <div className="fc-sub">Disponível para guardar</div>
        </div>
      </div>

      <div className="fin-grid">
        <div className="card cream">
          <Eyebrow icon="clock">Lançamentos recentes</Eyebrow>
          <div>
            {TRANSACTIONS.map(t => (
              <div className="tx" key={t.id}>
                <div className="tx-ico"><Icon name={t.ico} size={20} /></div>
                <div className="tx-body">
                  <div className="tt">{t.title}</div>
                  <div className="tc">{t.cat}</div>
                </div>
                <div className={"tx-amt " + (t.type === "in" ? "pos" : "neg")}>
                  {t.type === "in" ? "+" : "−"}{brl(t.amt)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card cream">
          <Eyebrow icon="check">Contas da casa</Eyebrow>
          <div style={{fontSize:13, color:"var(--gold-dk)", marginBottom:8, marginTop:-6}}>
            {paidCount}/{bills.length} pagas · {brl(pending)} pendente
          </div>
          <div>
            {bills.map(b => (
              <div className={"bill" + (b.paid ? " paid" : "")} key={b.id} onClick={() => toggleBill(b.id)}>
                <div className="box"><Icon name="check" size={13} /></div>
                <div className="bl">{b.label}</div>
                <div className="bamt">{brl(b.amt)}</div>
                <div className={"bstat " + (b.paid ? "paid" : "due")}>{b.paid ? "Pago" : "Pendente"}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   NOTAS & IDEIAS
--------------------------------------------------------------- */
function TabNotas({ notes, setNotes }) {
  const [activeId, setActiveId] = useStateB(notes[0]?.id);
  const active = notes.find(n => n.id === activeId) || notes[0];

  const update = (field, value) =>
    setNotes(ns => ns.map(n => n.id === active.id ? { ...n, [field]: value } : n));

  const addNote = () => {
    const id = Date.now();
    setNotes(ns => [{ id, title: "", tags: [], body: "" }, ...ns]);
    setActiveId(id);
  };

  return (
    <div className="tab-pane page-pad">
      <div className="page-head">
        <div className="section-eyebrow"><Icon name="note" size={14} /><span>Seu caderno digital</span></div>
        <h2>Notas & Ideias</h2>
      </div>

      <div className="notes-grid">
        <div className="notes-side">
          <div className="ns-head">
            <span className="t">Minhas notas</span>
            <button className="ns-add" onClick={addNote} aria-label="nova nota">+</button>
          </div>
          {notes.map(n => (
            <div key={n.id} className={"note-item" + (n.id === active.id ? " active" : "")} onClick={() => setActiveId(n.id)}>
              <div className="ni-t">{n.title || "Sem título"}</div>
              <div className="ni-p">{n.body || "Comece a escrever…"}</div>
              {n.tags.length > 0 && (
                <div className="ni-tags">
                  {n.tags.map(t => <span key={t} className="ni-tag">{t}</span>)}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="note-editor">
          <input className="ne-title" value={active.title} placeholder="Título da nota…"
            onChange={e => update("title", e.target.value)} />
          <div className="ne-tags">
            {active.tags.map(t => (
              <span key={t} className="tag"><Icon name="tag" size={11} style={{marginRight:6}} />{t}</span>
            ))}
            <TagAdder onAdd={(t) => { if (t && !active.tags.includes(t)) update("tags", [...active.tags, t]); }} />
          </div>
          <div className="ne-meta"><Icon name="clock" size={13} /> Editado agora · {active.body.length} caracteres</div>
          <textarea className="ne-body" value={active.body} placeholder="Escreva suas ideias aqui…"
            onChange={e => update("body", e.target.value)} />
        </div>
      </div>
    </div>
  );
}

function TagAdder({ onAdd }) {
  const [open, setOpen] = useStateB(false);
  const [val, setVal] = useStateB("");
  if (!open) return <button className="tag" style={{cursor:"pointer", borderStyle:"dashed"}} onClick={() => setOpen(true)}>+ tag</button>;
  return (
    <input autoFocus value={val} placeholder="nova tag"
      style={{border:"1px solid var(--gold)", background:"var(--cream)", borderRadius:30, padding:"4px 11px", fontSize:11, fontFamily:"var(--sans)", outline:"none", width:90, textTransform:"uppercase", letterSpacing:"0.08em", color:"var(--mocha)"}}
      onChange={e => setVal(e.target.value)}
      onBlur={() => { onAdd(val.trim().toLowerCase()); setVal(""); setOpen(false); }}
      onKeyDown={e => { if (e.key === "Enter") { onAdd(val.trim().toLowerCase()); setVal(""); setOpen(false); } }} />
  );
}

/* ---------------------------------------------------------------
   LISTAS
--------------------------------------------------------------- */
function ShoppingList({ title, sub, items, setItems, sand }) {
  const [draft, setDraft] = useStateB("");
  const toggle = (id) => setItems(is => is.map(i => i.id === id ? { ...i, done: !i.done } : i));
  const add = () => {
    const label = draft.trim();
    if (!label) return;
    setItems(is => [...is, { id: Date.now(), label, price: 0, done: false }]);
    setDraft("");
  };
  const remaining = items.filter(i => !i.done).reduce((s, i) => s + i.price, 0);
  const doneCount = items.filter(i => i.done).length;

  return (
    <div className={"list-card" + (sand ? " sand" : "")}>
      <div className="list-head">
        <h3>{title}</h3>
        <span className="total">{brl(remaining)}</span>
      </div>
      <div className="list-sub">{sub} · {doneCount}/{items.length} concluídos · restante estimado</div>
      <div>
        {items.map(i => (
          <div className={"li" + (i.done ? " done" : "")} key={i.id} onClick={() => toggle(i.id)}>
            <div className="box"><Icon name="check" size={13} /></div>
            <div className="ll">{i.label}</div>
            {i.price > 0 && <div className="lp">{brl(i.price)}</div>}
          </div>
        ))}
      </div>
      <div className="list-add" onClick={e => e.stopPropagation()}>
        <input value={draft} placeholder="Adicionar item…" onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") add(); }} />
        <button onClick={add}>Adicionar</button>
      </div>
    </div>
  );
}

function TabListas({ personal, setPersonal, house, setHouse }) {
  return (
    <div className="tab-pane page-pad">
      <div className="page-head">
        <div className="section-eyebrow"><Icon name="list" size={14} /><span>Para não esquecer nada</span></div>
        <h2>Listas</h2>
        <p>Suas comprinhas pessoais e a lista de compras da casa, com preços estimados.</p>
      </div>
      <div className="lists-grid">
        <ShoppingList title="Comprinhas pessoais" sub="Desejos & extras"
          items={personal} setItems={setPersonal} />
        <ShoppingList title="Compras da casa" sub="Mercado & essenciais" sand
          items={house} setItems={setHouse} />
      </div>
    </div>
  );
}

Object.assign(window, { TabFinancas, TabNotas, TabListas });

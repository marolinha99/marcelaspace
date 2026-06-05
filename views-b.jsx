/* ============================================================
   views-b.jsx — Finanças, Notas & Ideias, Listas
   ============================================================ */
const { useState: useStateB } = React;

const brl = (n) => "R$ " + Math.abs(n).toLocaleString("pt-BR", { minimumFractionDigits: 0 });

/* ---------------------------------------------------------------
   FINANÇAS
--------------------------------------------------------------- */
function TabFinancas({ bills, setBills, transactions, setTransactions }) {
  const now = new Date();
  const [viewMonth, setViewMonth] = useStateB(now.getMonth());
  const [viewYear,  setViewYear]  = useStateB(now.getFullYear());
  const [showAddTx,   setShowAddTx]   = useStateB(false);
  const [showAddBill, setShowAddBill] = useStateB(false);
  const [newTx,   setNewTx]   = useStateB({ title:"", amt:"", type:"out", cat:"" });
  const [newBill, setNewBill] = useStateB({ label:"", amt:"" });

  const MESES_FIN = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

  const moveMonth = (dir) => {
    let m = viewMonth + dir, y = viewYear;
    if (m < 0) { m = 11; y--; } if (m > 11) { m = 0; y++; }
    setViewMonth(m); setViewYear(y);
  };

  const toggleBill = (id) => setBills(bs => bs.map(b => b.id === id ? { ...b, paid: !b.paid } : b));
  const deleteBill = (id) => setBills(bs => bs.filter(b => b.id !== id));
  const deleteTx   = (id) => setTransactions(ts => ts.filter(t => t.id !== id));

  const addTx = () => {
    if (!newTx.title || !newTx.amt) return;
    const amt = parseFloat(newTx.amt.replace(",", "."));
    const tx = { id: crypto.randomUUID(), title: newTx.title, cat: newTx.cat || "Outros", amt: newTx.type === "out" ? -amt : amt, type: newTx.type, ico: "wallet", month: viewMonth, year: viewYear };
    setTransactions(ts => [...ts, tx]);
    setNewTx({ title:"", amt:"", type:"out", cat:"" });
    setShowAddTx(false);
  };

  const addBill = () => {
    if (!newBill.label || !newBill.amt) return;
    setBills(bs => [...bs, { id: crypto.randomUUID(), label: newBill.label, amt: parseFloat(newBill.amt.replace(",",".")), paid: false, month: viewMonth, year: viewYear }]);
    setNewBill({ label:"", amt:"" });
    setShowAddBill(false);
  };

  /* filtra por mês/ano selecionado */
  const monthTx    = (transactions || []).filter(t => (t.month ?? now.getMonth()) === viewMonth && (t.year ?? now.getFullYear()) === viewYear);
  const monthBills = (bills || []).filter(b => (b.month ?? now.getMonth()) === viewMonth && (b.year ?? now.getFullYear()) === viewYear);

  const income  = monthTx.filter(t => t.type === "in").reduce((s,t) => s + t.amt, 0);
  const expense = monthTx.filter(t => t.type === "out").reduce((s,t) => s + Math.abs(t.amt), 0);
  const balance = income - expense;
  const pending  = monthBills.filter(b => !b.paid).reduce((s,b) => s + b.amt, 0);
  const paidCount = monthBills.filter(b => b.paid).length;

  return (
    <div className="tab-pane page-pad">
      <div className="page-head">
        <div className="section-eyebrow"><Icon name="wallet" size={14}/><span>Visão financeira</span></div>
        <h2>Finanças</h2>
        <p>Receitas, despesas e contas da casa — mês a mês.</p>
      </div>

      <div className="fin-month-nav">
        <button onClick={() => moveMonth(-1)}><Icon name="chevL" size={18}/></button>
        <div>
          <div className="month-label">{MESES_FIN[viewMonth]} {viewYear}</div>
          {(viewMonth !== now.getMonth() || viewYear !== now.getFullYear()) && (
            <div style={{ fontSize:11, color:"rgba(232,237,229,0.5)", textAlign:"center", marginTop:2, cursor:"pointer" }}
              onClick={() => { setViewMonth(now.getMonth()); setViewYear(now.getFullYear()); }}>
              Voltar ao mês atual
            </div>
          )}
        </div>
        <button onClick={() => moveMonth(1)}><Icon name="chevR" size={18}/></button>
      </div>

      <div className="fin-cards">
        <div className="fin-card inc">
          <div className="fc-lbl"><Icon name="wallet" size={13}/> Receitas</div>
          <div className="fc-val" style={{color:"var(--sage-dk)"}}>{brl(income)}</div>
          <div className="fc-sub">{MESES_FIN[viewMonth]}</div>
        </div>
        <div className="fin-card exp">
          <div className="fc-lbl"><Icon name="cart" size={13}/> Despesas</div>
          <div className="fc-val" style={{color:"var(--red)"}}>{brl(expense)}</div>
          <div className="fc-sub">{income > 0 ? Math.round(expense/income*100) : 0}% da receita</div>
        </div>
        <div className="fin-card bal">
          <div className="fc-lbl"><Icon name="sparkle" size={13}/> Saldo</div>
          <div className="fc-val">{brl(balance)}</div>
          <div className="fc-sub">Disponível</div>
        </div>
      </div>

      <div className="fin-grid">
        <div className="card cream">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <Eyebrow icon="clock">Lançamentos</Eyebrow>
            <button className="btn-add-trigger" style={{width:"auto",marginTop:0,padding:"6px 14px"}} onClick={() => setShowAddTx(v => !v)}>
              {showAddTx ? "— Fechar" : "+ Novo"}
            </button>
          </div>

          {showAddTx && (
            <div className="add-form">
              <div className="form-row">
                <input placeholder="Descrição" value={newTx.title} onChange={e => setNewTx(v => ({...v, title:e.target.value}))}/>
                <input placeholder="Valor (R$)" value={newTx.amt} onChange={e => setNewTx(v => ({...v, amt:e.target.value}))} style={{maxWidth:110}}/>
              </div>
              <div className="form-row">
                <select value={newTx.type} onChange={e => setNewTx(v => ({...v, type:e.target.value}))}>
                  <option value="out">Despesa</option>
                  <option value="in">Receita</option>
                </select>
                <input placeholder="Categoria" value={newTx.cat} onChange={e => setNewTx(v => ({...v, cat:e.target.value}))}/>
              </div>
              <div className="form-actions">
                <button className="btn-cancel" onClick={() => setShowAddTx(false)}>Cancelar</button>
                <button className="btn-confirm" onClick={addTx}>Adicionar</button>
              </div>
            </div>
          )}

          {monthTx.length === 0 && !showAddTx && (
            <div style={{padding:"20px 0",textAlign:"center",color:"var(--mocha)",fontSize:13,opacity:0.5}}>
              Nenhum lançamento em {MESES_FIN[viewMonth]}.
            </div>
          )}

          {monthTx.map(t => (
            <div className="tx" key={t.id}>
              <div className="tx-ico"><Icon name={t.ico || "wallet"} size={20}/></div>
              <div className="tx-body">
                <div className="tt">{t.title}</div>
                <div className="tc">{t.cat}</div>
              </div>
              <div className={"tx-amt " + (t.type === "in" ? "pos" : "neg")}>
                {t.type === "in" ? "+" : "−"}{brl(t.amt)}
              </div>
              <button className="btn-delete" onClick={() => deleteTx(t.id)} title="Excluir">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
              </button>
            </div>
          ))}
        </div>

        <div className="card cream">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <Eyebrow icon="check">Contas da casa</Eyebrow>
            <button className="btn-add-trigger" style={{width:"auto",marginTop:0,padding:"6px 14px"}} onClick={() => setShowAddBill(v => !v)}>
              {showAddBill ? "— Fechar" : "+ Nova"}
            </button>
          </div>
          <div style={{fontSize:12,color:"var(--mocha)",marginBottom:12}}>
            {paidCount}/{monthBills.length} pagas · {brl(pending)} pendente
          </div>

          {showAddBill && (
            <div className="add-form">
              <input placeholder="Nome da conta" value={newBill.label} onChange={e => setNewBill(v => ({...v, label:e.target.value}))}/>
              <input placeholder="Valor (R$)" value={newBill.amt} onChange={e => setNewBill(v => ({...v, amt:e.target.value}))}/>
              <div className="form-actions">
                <button className="btn-cancel" onClick={() => setShowAddBill(false)}>Cancelar</button>
                <button className="btn-confirm" onClick={addBill}>Adicionar</button>
              </div>
            </div>
          )}

          {monthBills.length === 0 && !showAddBill && (
            <div style={{padding:"20px 0",textAlign:"center",color:"var(--mocha)",fontSize:13,opacity:0.5}}>
              Nenhuma conta em {MESES_FIN[viewMonth]}.
            </div>
          )}

          {monthBills.map(b => (
            <div className={"bill" + (b.paid ? " paid" : "")} key={b.id}>
              <div className="box" onClick={() => toggleBill(b.id)}><Icon name="check" size={13}/></div>
              <div className="bl" onClick={() => toggleBill(b.id)}>{b.label}</div>
              <div className="bamt">{brl(b.amt)}</div>
              <div className={"bstat " + (b.paid ? "paid" : "due")}>{b.paid ? "Pago" : "Pendente"}</div>
              <button className="btn-delete" onClick={() => deleteBill(b.id)} title="Excluir">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
              </button>
            </div>
          ))}
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

  const update = (field, value) => setNotes(ns => ns.map(n => n.id === active.id ? { ...n, [field]: value } : n));

  const addNote = () => {
    const id = crypto.randomUUID();
    setNotes(ns => [{ id, title:"", tags:[], body:"" }, ...ns]);
    setActiveId(id);
  };

  const deleteNote = (id) => {
    setNotes(ns => ns.filter(n => n.id !== id));
    if (activeId === id) setActiveId(notes.find(n => n.id !== id)?.id);
  };

  return (
    <div className="tab-pane page-pad">
      <div className="page-head">
        <div className="section-eyebrow"><Icon name="note" size={14}/><span>Seu caderno digital</span></div>
        <h2>Notas & Ideias</h2>
      </div>
      <div className="notes-grid">
        <div className="notes-side">
          <div className="ns-head">
            <span className="t">Minhas notas</span>
            <button className="ns-add" onClick={addNote}>+</button>
          </div>
          {notes.map(n => (
            <div key={n.id} className={"note-item" + (n.id === active?.id ? " active" : "")} onClick={() => setActiveId(n.id)} style={{position:"relative"}}>
              <div className="ni-t">{n.title || "Sem título"}</div>
              <div className="ni-p">{n.body || "Comece a escrever…"}</div>
              {n.tags?.length > 0 && (
                <div className="ni-tags">{n.tags.map(t => <span key={t} className="ni-tag">{t}</span>)}</div>
              )}
              <button className="btn-delete" onClick={e => { e.stopPropagation(); deleteNote(n.id); }}
                style={{position:"absolute",top:10,right:10,opacity:0.4}} title="Excluir nota">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
              </button>
            </div>
          ))}
        </div>

        {active && (
          <div className="note-editor">
            <input className="ne-title" value={active.title} placeholder="Título da nota…" onChange={e => update("title", e.target.value)}/>
            <div className="ne-tags">
              {active.tags?.map(t => (
                <span key={t} className="tag" style={{cursor:"pointer"}} onClick={() => update("tags", active.tags.filter(x => x !== t))}>
                  <Icon name="tag" size={11} style={{marginRight:4}}/>{t} ×
                </span>
              ))}
              <TagAdder onAdd={(t) => { if (t && !active.tags?.includes(t)) update("tags", [...(active.tags||[]), t]); }}/>
            </div>
            <div className="ne-meta"><Icon name="clock" size={13}/> {active.body?.length || 0} caracteres</div>
            <textarea className="ne-body" value={active.body} placeholder="Escreva suas ideias aqui…" onChange={e => update("body", e.target.value)}/>
          </div>
        )}
      </div>
    </div>
  );
}

function TagAdder({ onAdd }) {
  const [open, setOpen] = useStateB(false);
  const [val,  setVal]  = useStateB("");
  if (!open) return <button className="tag" style={{cursor:"pointer",borderStyle:"dashed"}} onClick={() => setOpen(true)}>+ tag</button>;
  return (
    <input autoFocus value={val} placeholder="nova tag"
      style={{border:"1px solid var(--sage)",background:"var(--cream)",borderRadius:30,padding:"4px 11px",fontSize:11,fontFamily:"var(--sans)",outline:"none",width:90,textTransform:"uppercase",letterSpacing:"0.08em",color:"var(--mocha)"}}
      onChange={e => setVal(e.target.value)}
      onBlur={() => { onAdd(val.trim().toLowerCase()); setVal(""); setOpen(false); }}
      onKeyDown={e => { if (e.key==="Enter") { onAdd(val.trim().toLowerCase()); setVal(""); setOpen(false); }}}/>
  );
}

/* ---------------------------------------------------------------
   LISTAS
--------------------------------------------------------------- */
function ShoppingList({ title, sub, items, setItems, sand }) {
  const [draft,      setDraft]      = useStateB("");
  const [draftPrice, setDraftPrice] = useStateB("");

  const toggle = (id) => setItems(is => is.map(i => i.id === id ? { ...i, done: !i.done } : i));
  const remove = (id) => setItems(is => is.filter(i => i.id !== id));

  const add = () => {
    const label = draft.trim();
    if (!label) return;
    const price = parseFloat(draftPrice.replace(",",".")) || 0;
    setItems(is => [...is, { id: crypto.randomUUID(), label, price, done: false }]);
    setDraft(""); setDraftPrice("");
  };

  const remaining = items.filter(i => !i.done).reduce((s,i) => s + i.price, 0);
  const doneCount  = items.filter(i => i.done).length;

  return (
    <div className={"list-card" + (sand ? " sand" : "")}>
      <div className="list-head">
        <h3>{title}</h3>
        <span className="total">{brl(remaining)}</span>
      </div>
      <div className="list-sub">{sub} · {doneCount}/{items.length} concluídos</div>
      <div>
        {items.map(i => (
          <div className={"li" + (i.done ? " done" : "")} key={i.id}>
            <div className="box" onClick={() => toggle(i.id)}><Icon name="check" size={13}/></div>
            <div className="ll" onClick={() => toggle(i.id)}>{i.label}</div>
            {i.price > 0 && <div className="lp">{brl(i.price)}</div>}
            <button className="btn-delete" onClick={() => remove(i.id)} title="Remover" style={{opacity:0.4}}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
            </button>
          </div>
        ))}
      </div>
      <div className="list-add">
        <input value={draft} placeholder="Adicionar item…" onChange={e => setDraft(e.target.value)} onKeyDown={e => { if (e.key==="Enter") add(); }}/>
        <input value={draftPrice} placeholder="R$" style={{width:60,flex:"none"}} onChange={e => setDraftPrice(e.target.value)} onKeyDown={e => { if (e.key==="Enter") add(); }}/>
        <button onClick={add}>+</button>
      </div>
    </div>
  );
}

function TabListas({ personal, setPersonal, house, setHouse }) {
  return (
    <div className="tab-pane page-pad">
      <div className="page-head">
        <div className="section-eyebrow"><Icon name="list" size={14}/><span>Para não esquecer nada</span></div>
        <h2>Listas</h2>
        <p>Comprinhas pessoais e lista de compras da casa, com preços estimados.</p>
      </div>
      <div className="lists-grid">
        <ShoppingList title="Comprinhas pessoais" sub="Desejos & extras" items={personal} setItems={setPersonal}/>
        <ShoppingList title="Compras da casa" sub="Mercado & essenciais" sand items={house} setItems={setHouse}/>
      </div>
    </div>
  );
}

Object.assign(window, { TabFinancas, TabNotas, TabListas });

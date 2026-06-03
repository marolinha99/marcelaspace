/* ============================================================
   data.jsx — mock data + date / menstrual-cycle helpers
   ============================================================ */

/* ---- Date helpers (pt-BR) ---- */
const MESES = ["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"];
const MESES_ABR = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
const DIAS = ["domingo","segunda-feira","terça-feira","quarta-feira","quinta-feira","sexta-feira","sábado"];
const DOWS = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];

// "Today" is fixed to the brief's reference date for deterministic demo
const TODAY = new Date(2026, 5, 3); // June 3, 2026

function ymd(d) { return d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,"0") + "-" + String(d.getDate()).padStart(2,"0"); }
function sameDay(a, b) { return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate(); }
function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate()+n); return x; }
function daysBetween(a, b) { return Math.round((b - a) / 86400000); }

function longDate(d) {
  return DIAS[d.getDay()] + ", " + d.getDate() + " de " + MESES[d.getMonth()] + " de " + d.getFullYear();
}

/* ---- Menstrual cycle model ----
   Cycle length 31 days, period length 5 days, last period started 02/06/2026 */
const CYCLE = {
  length: 31,
  periodLen: 5,
  anchor: new Date(2026, 5, 2), // 02/06/2026
};

// returns {start, day} for the cycle that 'd' belongs to
function cycleInfo(d) {
  const diff = daysBetween(CYCLE.anchor, d);
  const mod = ((diff % CYCLE.length) + CYCLE.length) % CYCLE.length;
  const cycleStart = addDays(d, -mod);
  return { start: cycleStart, day: mod + 1 };
}
// status for a single date: 'period' | 'predicted' | 'ovulation' | null
function cycleStatus(d) {
  const { start, day } = cycleInfo(d);
  const isPast = d <= TODAY;
  if (day <= CYCLE.periodLen) {
    // is this period start in the past (real) or future (predicted)?
    return start <= TODAY ? "period" : "predicted";
  }
  // ovulation ~ 14 days before next period => day length-13
  if (day === CYCLE.length - 13) return "ovulation";
  return null;
}
function nextPeriodDate(d) {
  const { start } = cycleInfo(d);
  let next = addDays(start, CYCLE.length);
  if (daysBetween(d, next) < 0) next = addDays(next, CYCLE.length);
  return next;
}

/* ---- News ---- */
const NEWS = [
  { id:1, cat:"Flamengo", featured:true, title:"Flamengo goleia e assume ponta do Brasileirão com folga",
    summary:"Com dois gols de Gabigol e assistência de De la Cruz, Rubro-Negro venceu por 3 a 0 e abriu quatro pontos de vantagem para o segundo colocado.",
    src:"ESPN Brasil", time:"Há 2 horas" },
  { id:2, cat:"Libertadores", title:"Mengão conhece adversário das quartas da Libertadores",
    summary:"Sorteio define confronto contra equipe argentina; jogo de ida será no Maracanã.", src:"GE", time:"Há 4 horas" },
  { id:3, cat:"Brasil", title:"Governo anuncia novo pacote de incentivo à energia solar",
    summary:"Medida prevê linhas de crédito facilitadas para instalação residencial em 2026.", src:"G1", time:"Há 1 hora" },
  { id:4, cat:"Economia", title:"Dólar recua e Bolsa renova máxima histórica no pregão",
    summary:"Ibovespa fechou em alta de 1,4%, impulsionado por commodities e otimismo externo.", src:"Valor", time:"Há 3 horas" },
  { id:5, cat:"Mundo", title:"Cúpula do clima reúne líderes para acordo sobre oceanos",
    summary:"Países discutem metas de preservação marinha e financiamento para nações costeiras.", src:"BBC Brasil", time:"Há 5 horas" },
  { id:6, cat:"Brasileirão", title:"Palmeiras tropeça em casa e vê distância para o líder aumentar",
    summary:"Empate sem gols frustra torcida no Allianz Parque na rodada do meio de semana.", src:"UOL", time:"Há 6 horas" },
  { id:7, cat:"Esportes", title:"Rebeca Andrade confirma presença em etapa da Copa do Mundo de ginástica",
    summary:"Brasileira busca pontos importantes no ranking olímpico da temporada.", src:"GE", time:"Há 7 horas" },
  { id:8, cat:"Brasil", title:"Rio de Janeiro inaugura novo corredor de ônibus na Zona Sul",
    summary:"Trecho promete reduzir em 20 minutos o trajeto entre Copacabana e o Centro.", src:"O Globo", time:"Há 8 horas" },
  { id:9, cat:"Economia", title:"Inflação desacelera e fica abaixo do esperado em maio",
    summary:"Índice oficial veio em 0,28%, reforçando expectativa de corte na taxa de juros.", src:"InfoMoney", time:"Há 9 horas" },
  { id:10, cat:"Flamengo", title:"Joia da base renova contrato e tem multa fixada em 60 milhões de euros",
    summary:"Promessa de 18 anos é vista como peça de futuro no projeto rubro-negro.", src:"Coluna do Fla", time:"Há 10 horas" },
  { id:11, cat:"Mundo", title:"Eleições europeias movimentam cenário político no continente",
    summary:"Resultados apontam fortalecimento de partidos de centro em diversos países.", src:"DW Brasil", time:"Há 11 horas" },
  { id:12, cat:"Esportes", title:"Fórmula 1 confirma calendário com etapa inédita na América do Sul",
    summary:"Nova corrida entra no campeonato a partir da próxima temporada.", src:"Motorsport", time:"Há 12 horas" },
  { id:13, cat:"Geral", title:"Festival de cinema brasileiro abre inscrições para novos diretores",
    summary:"Mostra independente busca curtas e longas de realizadores estreantes.", src:"Folha", time:"Há 13 horas" },
  { id:14, cat:"Libertadores", title:"Tabela detalhada das quartas é divulgada pela Conmebol",
    summary:"Datas e horários dos jogos de ida e volta já estão confirmados.", src:"Conmebol", time:"Há 14 horas" },
];
const CATEGORIES = ["Geral","Brasil","Mundo","Flamengo","Brasileirão","Libertadores","Esportes","Economia"];

/* ---- Tasks ---- */
const TASKS_SEED = [
  { id:1, label:"Responder e-mail da cliente", meta:"Trabalho", done:false },
  { id:2, label:"Aula de pilates", meta:"18h", done:false },
  { id:3, label:"Comprar presente da Bia", meta:"Aniversário", done:false },
  { id:4, label:"Finalizar proposta do projeto", meta:"Urgente", done:true },
  { id:5, label:"Ligar para o dentista", meta:"Saúde", done:false },
  { id:6, label:"Regar as plantas da varanda", meta:"Casa", done:true },
];

/* ---- Events ---- */
const EVENTS = [
  { id:1, date:"2026-06-03", time:"09:00", title:"Reunião de equipe", place:"Google Meet" },
  { id:2, date:"2026-06-03", time:"12:30", title:"Almoço com Carol", place:"Bistrô da Lagoa" },
  { id:3, date:"2026-06-03", time:"18:00", title:"Aula de pilates", place:"Studio Move" },
  { id:4, date:"2026-06-03", time:"20:00", title:"Jantar em casa", place:"Apê" },
  { id:5, date:"2026-06-05", time:"15:00", title:"Consulta dermato", place:"Clínica Leblon" },
  { id:6, date:"2026-06-08", time:"19:30", title:"Cinema com as amigas", place:"Shopping Leblon" },
  { id:7, date:"2026-06-12", time:"10:00", title:"Aniversário da Bia", place:"Casa da Bia" },
  { id:8, date:"2026-06-20", time:"08:00", title:"Viagem Búzios", place:"Rodoviária" },
];

/* ---- Finances ---- */
const FIN_SUMMARY = { income: 8450, expense: 5120, balance: 3330 };
const TRANSACTIONS = [
  { id:1, title:"Salário", cat:"Receita · Trabalho", amt:7200, type:"in", ico:"wallet" },
  { id:2, title:"Freela design", cat:"Receita · Extra", amt:1250, type:"in", ico:"sparkle" },
  { id:3, title:"Mercado Zona Sul", cat:"Alimentação", amt:-680, type:"out", ico:"cart" },
  { id:4, title:"Pilates Studio Move", cat:"Saúde · Bem-estar", amt:-320, type:"out", ico:"heart" },
  { id:5, title:"Jantar Bistrô da Lagoa", cat:"Lazer", amt:-185, type:"out", ico:"cup" },
  { id:6, title:"Uber", cat:"Transporte", amt:-94, type:"out", ico:"car" },
  { id:7, title:"Farmácia", cat:"Saúde", amt:-128, type:"out", ico:"heart" },
  { id:8, title:"Assinatura streaming", cat:"Lazer · Recorrente", amt:-55, type:"out", ico:"play" },
];
const BILLS_SEED = [
  { id:1, label:"Aluguel", amt:2400, paid:true },
  { id:2, label:"Condomínio", amt:780, paid:true },
  { id:3, label:"Luz", amt:184, paid:false },
  { id:4, label:"Internet", amt:120, paid:false },
  { id:5, label:"Água", amt:96, paid:true },
  { id:6, label:"Gás", amt:88, paid:false },
];

/* ---- Notes ---- */
const NOTES_SEED = [
  { id:1, title:"Ideias para o apê", tags:["casa","decor"],
    body:"Trocar as cortinas da sala por um tom mais quente, cor de areia.\n\nProcurar uma estante de madeira clara para os livros e plantas.\n\nComprar velas aromáticas — baunilha e sândalo.\nMontar um cantinho de leitura perto da janela com a poltrona velha reformada." },
  { id:2, title:"Metas 2026", tags:["pessoal","foco"],
    body:"• Ler 24 livros no ano (2 por mês)\n• Viajar para fora pelo menos uma vez\n• Voltar para a aula de francês\n• Guardar 20% do salário todo mês\n• Correr a meia maratona do Rio em julho" },
  { id:3, title:"Lista de filmes & séries", tags:["lazer"],
    body:"Filmes:\n- Cidade de Deus (rever)\n- Aftersun\n- Past Lives\n\nSéries:\n- documentário sobre design\n- a nova temporada que a Carol indicou" },
  { id:4, title:"Receita de bolo da vó", tags:["receita","casa"],
    body:"Bolo de fubá cremoso\n\n3 ovos, 2 xíc. de leite, 1 xíc. de fubá, 1 xíc. de açúcar, 2 col. de farinha, 50g de queijo, 1 col. de fermento.\n\nBater tudo no liquidificador, assar a 180° por 40 min." },
  { id:5, title:"Brainstorm projeto cliente", tags:["trabalho"],
    body:"Direção editorial, paleta terrosa e quente.\nReferências: revistas de design escandinavo + toque tropical carioca.\nApresentar 3 conceitos na próxima reunião." },
];

/* ---- Lists ---- */
const PERSONAL_SEED = [
  { id:1, label:"Tênis de corrida novo", price:499, done:false },
  { id:2, label:"Livro indicado pela Carol", price:62, done:false },
  { id:3, label:"Esmalte cor nude", price:18, done:true },
  { id:4, label:"Necessaire de viagem", price:89, done:false },
  { id:5, label:"Óculos de sol", price:240, done:false },
  { id:6, label:"Vela aromática", price:75, done:true },
];
const HOUSE_SEED = [
  { id:1, label:"Café em grãos", price:38, done:false },
  { id:2, label:"Azeite extravirgem", price:42, done:false },
  { id:3, label:"Detergente & esponjas", price:24, done:true },
  { id:4, label:"Papel toalha", price:16, done:false },
  { id:5, label:"Frutas da feira", price:55, done:false },
  { id:6, label:"Ração da gata", price:120, done:true },
  { id:7, label:"Sabão de roupa", price:33, done:false },
];

/* ---- Weather (Rio de Janeiro) ---- */
const WEATHER = { temp: 27, cond: "Parcialmente nublado", hi: 30, lo: 22, loc: "Rio de Janeiro", icon: "partly" };

/* greeting by hour */
function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

Object.assign(window, {
  MESES, MESES_ABR, DIAS, DOWS, TODAY, CYCLE,
  ymd, sameDay, addDays, daysBetween, longDate,
  cycleInfo, cycleStatus, nextPeriodDate,
  NEWS, CATEGORIES, TASKS_SEED, EVENTS,
  FIN_SUMMARY, TRANSACTIONS, BILLS_SEED, NOTES_SEED,
  PERSONAL_SEED, HOUSE_SEED, WEATHER, greeting,
});

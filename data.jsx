/* ============================================================
   data.jsx — helpers + APIs reais (clima, notícias, agenda)
   ============================================================ */

/* ---- Date helpers (pt-BR) ---- */
const MESES = ["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"];
const MESES_ABR = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
const DIAS = ["domingo","segunda-feira","terça-feira","quarta-feira","quinta-feira","sexta-feira","sábado"];
const DOWS = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];

const TODAY = new Date();

function ymd(d) { return d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,"0") + "-" + String(d.getDate()).padStart(2,"0"); }
function sameDay(a, b) { return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate(); }
function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate()+n); return x; }
function daysBetween(a, b) { return Math.round((b - a) / 86400000); }
function longDate(d) {
  return DIAS[d.getDay()] + ", " + d.getDate() + " de " + MESES[d.getMonth()] + " de " + d.getFullYear();
}

/* ---- Menstrual cycle ---- */
const CYCLE = {
  length: 31,
  periodLen: 5,
  anchor: new Date(2026, 5, 2),
};

function cycleInfo(d) {
  const diff = daysBetween(CYCLE.anchor, d);
  const mod = ((diff % CYCLE.length) + CYCLE.length) % CYCLE.length;
  const cycleStart = addDays(d, -mod);
  return { start: cycleStart, day: mod + 1 };
}

function cycleStatus(d) {
  const { start, day } = cycleInfo(d);
  if (day <= CYCLE.periodLen) {
    return start <= TODAY ? "period" : "predicted";
  }
  if (day === CYCLE.length - 13) return "ovulation";
  return null;
}

function nextPeriodDate(d) {
  const { start } = cycleInfo(d);
  let next = addDays(start, CYCLE.length);
  if (daysBetween(d, next) < 0) next = addDays(next, CYCLE.length);
  return next;
}

/* ---- API Keys ---- */
const OPENWEATHER_KEY = "a31556f8f47c92de0adea11f0817f17b";
const NEWSAPI_KEY     = "e66cf4c71f5247e1bbf6a79b2d45bfbb";

/* ---- Weather API ---- */
async function fetchWeather() {
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=Rio+de+Janeiro,BR&appid=${OPENWEATHER_KEY}&units=metric&lang=pt_br`
    );
    const d = await res.json();
    return {
      temp:  Math.round(d.main.temp),
      hi:    Math.round(d.main.temp_max),
      lo:    Math.round(d.main.temp_min),
      cond:  d.weather[0].description.charAt(0).toUpperCase() + d.weather[0].description.slice(1),
      icon:  mapWeatherIcon(d.weather[0].id),
      loc:   "Rio de Janeiro",
    };
  } catch(e) {
    console.error("Weather error", e);
    return { temp: "--", hi: "--", lo: "--", cond: "Indisponível", icon: "partly", loc: "Rio de Janeiro" };
  }
}

function mapWeatherIcon(id) {
  if (id >= 200 && id < 300) return "cloud";
  if (id >= 300 && id < 600) return "drop";
  if (id >= 600 && id < 700) return "cloud";
  if (id === 800) return "sun";
  if (id > 800) return "partly";
  return "partly";
}

/* ---- News via Google News RSS + rss2json ---- */
const NEWS_QUERIES = {
  "Geral":        "Brasil",
  "Brasil":       "Brasil política",
  "Mundo":        "mundo internacional",
  "Flamengo":     "Flamengo futebol",
  "Brasileirão":  "Campeonato Brasileiro",
  "Libertadores": "Copa Libertadores",
  "Esportes":     "esportes Brasil",
  "Economia":     "economia Brasil mercado",
};

const CATEGORIES = ["Geral","Brasil","Mundo","Flamengo","Brasileirão","Libertadores","Esportes","Economia"];

async function fetchNews(category = "Geral") {
  try {
    const q = encodeURIComponent(NEWS_QUERIES[category] || "Brasil");
    const rssUrl = encodeURIComponent(
      `https://news.google.com/rss/search?q=${q}&hl=pt-BR&gl=BR&ceid=BR:pt-419`
    );
    const res = await fetch(
      `https://api.rss2json.com/v1/api.json?rss_url=${rssUrl}&count=10`
    );
    const d = await res.json();
    if (!d.items || d.items.length === 0) return fallbackNews(category);
    return d.items.map((a, i) => ({
      id: i + 1,
      cat: category,
      featured: i === 0,
      title: a.title,
      summary: a.description ? a.description.replace(/<[^>]*>/g, "").slice(0, 180) + "..." : "",
      src: a.author || a.source || "Google News",
      time: timeAgo(new Date(a.pubDate)),
      url: a.link,
    }));
  } catch(e) {
    console.error("News error", e);
    return fallbackNews(category);
  }
}

function timeAgo(date) {
  const diff = Math.floor((Date.now() - date) / 60000);
  if (diff < 60) return `Há ${diff} min`;
  if (diff < 1440) return `Há ${Math.floor(diff/60)} horas`;
  return `Há ${Math.floor(diff/1440)} dias`;
}

function fallbackNews(category) {
  return [
    { id:1, cat: category, featured: true,
      title: "Notícias indisponíveis no momento",
      summary: "Verifique sua conexão ou tente novamente em instantes.",
      src: "—", time: "—" }
  ];
}

/* ---- Seeds (usados na primeira vez e como fallback) ---- */
const TASKS_SEED = [
  { id:1, label:"Responder e-mail da cliente", meta:"Trabalho", done:false },
  { id:2, label:"Aula de pilates", meta:"18h", done:false },
  { id:3, label:"Comprar presente da Bia", meta:"Aniversário", done:false },
  { id:4, label:"Finalizar proposta do projeto", meta:"Urgente", done:true },
  { id:5, label:"Ligar para o dentista", meta:"Saúde", done:false },
];

const EVENTS_SEED = [
  { id:1, date: ymd(TODAY), time:"09:00", title:"Reunião de equipe", place:"Google Meet" },
  { id:2, date: ymd(TODAY), time:"12:30", title:"Almoço", place:"Restaurante" },
  { id:3, date: ymd(TODAY), time:"18:00", title:"Aula de pilates", place:"Studio Move" },
];

const FIN_SUMMARY = { income: 8450, expense: 5120, balance: 3330 };
const TRANSACTIONS = [
  { id:1, title:"Salário", cat:"Receita · Trabalho", amt:7200, type:"in", ico:"wallet" },
  { id:2, title:"Freela design", cat:"Receita · Extra", amt:1250, type:"in", ico:"sparkle" },
  { id:3, title:"Mercado Zona Sul", cat:"Alimentação", amt:-680, type:"out", ico:"cart" },
  { id:4, title:"Pilates Studio Move", cat:"Saúde · Bem-estar", amt:-320, type:"out", ico:"heart" },
  { id:5, title:"Jantar", cat:"Lazer", amt:-185, type:"out", ico:"cup" },
  { id:6, title:"Uber", cat:"Transporte", amt:-94, type:"out", ico:"car" },
];

const BILLS_SEED = [
  { id:1, label:"Aluguel", amt:2400, paid:true },
  { id:2, label:"Condomínio", amt:780, paid:true },
  { id:3, label:"Luz", amt:184, paid:false },
  { id:4, label:"Internet", amt:120, paid:false },
  { id:5, label:"Água", amt:96, paid:true },
  { id:6, label:"Gás", amt:88, paid:false },
];

const NOTES_SEED = [
  { id:1, title:"Ideias para o apê", tags:["casa","decor"],
    body:"Trocar as cortinas da sala por um tom mais quente.\nProcurar uma estante de madeira clara.\nComprar velas aromáticas — baunilha e sândalo." },
  { id:2, title:"Metas 2026", tags:["pessoal","foco"],
    body:"• Ler 24 livros no ano\n• Viajar para fora pelo menos uma vez\n• Guardar 20% do salário todo mês" },
];

const PERSONAL_SEED = [
  { id:1, label:"Tênis de corrida novo", price:499, done:false },
  { id:2, label:"Livro indicado pela Carol", price:62, done:false },
  { id:3, label:"Esmalte cor nude", price:18, done:true },
];

const HOUSE_SEED = [
  { id:1, label:"Café em grãos", price:38, done:false },
  { id:2, label:"Azeite extravirgem", price:42, done:false },
  { id:3, label:"Detergente & esponjas", price:24, done:true },
  { id:4, label:"Frutas da feira", price:55, done:false },
];

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
  fetchWeather, fetchNews, CATEGORIES,
  TASKS_SEED, EVENTS_SEED, FIN_SUMMARY, TRANSACTIONS,
  BILLS_SEED, NOTES_SEED, PERSONAL_SEED, HOUSE_SEED,
  greeting,
});

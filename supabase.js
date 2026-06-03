/* ============================================================
   supabase.js — Supabase client
   Carregado antes de todos os outros scripts no index.html
   ============================================================ */

const SUPABASE_URL = "https://hwkabdfqfbqqmfgvwxjy.supabase.co";
const SUPABASE_KEY = "sb_publishable_gwZrBuII10JDENCeXTyFhg_-vQflm-b";

const { createClient } = supabase;
const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

Object.assign(window, { sb });

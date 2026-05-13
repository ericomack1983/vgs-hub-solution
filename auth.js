/* ================================================================
   VGS Hub — Supabase Auth
   Project: oohkrpkmuvtqmwiueoms.supabase.co
   ================================================================ */

const _SUPA_URL = "https://oohkrpkmuvtqmwiueoms.supabase.co";
const _SUPA_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vaGtycGttdXZ0cW13aXVlb21zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxNDU1NjcsImV4cCI6MjA4NzcyMTU2N30.nNF-5KqW15V9O5DMtj6ZKXCf2qpGJRBFyvTKkvRfjP8";

const { createClient } = window.supabase;
const _sb = createClient(_SUPA_URL, _SUPA_KEY);

/* Redirect helper — works on file:// and hosted */
function _redirect(path) {
  const base = window.location.href.replace(/\/[^/]*$/, "/");
  window.location.replace(base + path);
}

/* Check session — redirect to login if none, returns session or null */
async function checkAuth() {
  const { data: { session } } = await _sb.auth.getSession();
  if (!session) {
    _redirect("login.html");
    return null;
  }
  return session;
}

/* Sign in with email + password */
async function signIn(email, password) {
  return _sb.auth.signInWithPassword({ email, password });
}

/* Sign out + redirect to login */
async function signOut() {
  await _sb.auth.signOut();
  _redirect("login.html");
}

/* Expose globally */
window.__auth = { checkAuth, signIn, signOut, client: _sb };

import { createClient } from '@supabase/supabase-js'
import './style.css'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
const app = document.querySelector('#app')
const db = url && key ? createClient(url, key) : null
let user = null
let records = []
let editing = null
let authMode = 'login'
let notice = ''

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]))
}
function showNotice(message, ok = false) {
  const el = document.querySelector('#message')
  if (el) { el.textContent = message; el.className = `message${ok ? ' ok' : ''}` }
}
function layout(content) {
  app.innerHTML = `<div class="shell"><header class="top"><div class="brand"><span class="mark">◇</span> Motion Session Tracker</div>${user ? `<button class="secondary" id="logout">Log out</button>` : ''}</header>${content}<footer class="footer">ED2 prototype · Use sample or non-identifying session data only.</footer></div>`
  document.querySelector('#logout')?.addEventListener('click', async () => {
    const { error } = await db.auth.signOut()
    if (error) showNotice(error.message)
  })
}
function renderAuth() {
  layout(`<section class="hero"><span class="eyebrow">Human joint keypoint estimation · ED2 prototype</span><h1>Keep motion sessions organized.</h1><p>Record a session, track its review status, and find the notes you need. Your entries are tied to your account.</p></section><div class="auth"><div class="card"><h2>${authMode === 'login' ? 'Welcome back' : 'Create an account'}</h2><p class="muted">${authMode === 'login' ? 'Log in to see your sessions.' : 'Sign up to start a private session list.'}</p><form id="auth-form"><label class="field">Email<input name="email" type="email" autocomplete="email" required></label><label class="field">Password<input name="password" type="password" minlength="6" autocomplete="${authMode === 'login' ? 'current-password' : 'new-password'}" required></label><div class="actions"><button class="primary" type="submit">${authMode === 'login' ? 'Log in' : 'Register'}</button></div><p id="message" class="message" role="status"></p></form><button class="switch" id="switch-mode">${authMode === 'login' ? 'New here? Register' : 'Already registered? Log in'}</button></div></div>`)
  document.querySelector('#switch-mode').onclick = () => { authMode = authMode === 'login' ? 'register' : 'login'; renderAuth() }
  document.querySelector('#auth-form').onsubmit = async event => {
    event.preventDefault()
    const form = event.currentTarget
    const button = form.querySelector('button[type=submit]')
    button.disabled = true
    const email = form.elements.namedItem('email').value.trim()
    const password = form.elements.namedItem('password').value
    const { data, error } = authMode === 'login'
      ? await db.auth.signInWithPassword({ email, password })
      : await db.auth.signUp({ email, password })
    button.disabled = false
    if (error) return showNotice(error.message)
    if (authMode === 'register' && !data.session) return showNotice('Account created. Check your email to confirm, then log in.', true)
    showNotice('Signed in.', true)
  }
}
function renderApp() {
  const record = records.find(row => row.id === editing)
  layout(`<section class="hero"><span class="eyebrow">Your workspace</span><h1>Motion sessions</h1><p>Plan a recording and keep track of progress from capture to review.</p><div class="muted">Signed in as ${escapeHtml(user.email)}</div></section><main class="grid"><section class="card"><h2>${record ? 'Edit session' : 'New session'}</h2><p class="muted">Keep this prototype free of names and medical details.</p><form id="session-form"><label class="field">Session title<input name="title" maxlength="120" required value="${escapeHtml(record?.title || '')}" placeholder="e.g. Walk cycle trial 01"></label><label class="field">Activity<input name="activity" maxlength="80" required value="${escapeHtml(record?.activity || '')}" placeholder="e.g. Walking"></label><label class="field">Session date<input name="session_date" type="date" required value="${escapeHtml(record?.session_date || new Date().toLocaleDateString('en-CA'))}"></label><label class="field">Status<select name="status">${['Planned','Recorded','Reviewed'].map(status => `<option ${record?.status === status ? 'selected' : ''}>${status}</option>`).join('')}</select></label><label class="field">Notes<textarea name="notes" maxlength="1000" placeholder="Short, non-identifying notes">${escapeHtml(record?.notes || '')}</textarea></label><div class="row actions"><button type="submit" class="primary">${record ? 'Save changes' : 'Add session'}</button>${record ? '<button type="button" class="secondary" id="cancel">Cancel</button>' : ''}</div><p id="message" class="message" role="status"></p></form></section><section class="card"><div class="row spread"><div><h2>Session list</h2><p class="muted">${records.length} ${records.length === 1 ? 'session' : 'sessions'} saved</p></div><button id="refresh" class="secondary">Refresh</button></div>${records.length ? `<div class="list">${records.map(row => `<article class="item"><div class="row spread"><h3>${escapeHtml(row.title)}</h3><span class="pill">${escapeHtml(row.status)}</span></div><div class="meta">${escapeHtml(row.activity)} · ${escapeHtml(row.session_date)}</div>${row.notes ? `<p>${escapeHtml(row.notes)}</p>` : ''}<div class="row"><button class="secondary" data-edit="${row.id}">Edit</button><button class="secondary danger" data-delete="${row.id}">Delete</button></div></article>`).join('')}</div>` : '<div class="empty">No sessions yet. Add one to get started.</div>'}</section></main>`)
  document.querySelector('#cancel')?.addEventListener('click', () => { editing = null; renderApp() })
  document.querySelector('#refresh').onclick = loadRecords
  document.querySelectorAll('[data-edit]').forEach(button => button.onclick = () => { editing = button.dataset.edit; renderApp(); document.querySelector('#session-form').scrollIntoView({behavior:'smooth'}) })
  document.querySelectorAll('[data-delete]').forEach(button => button.onclick = async () => {
    if (!confirm('Delete this session?')) return
    button.disabled = true
    const { error } = await db.from('sessions').delete().eq('id', button.dataset.delete).eq('user_id', user.id)
    if (error) { alert(error.message); button.disabled = false; return }
    if (editing === button.dataset.delete) editing = null
    await loadRecords()
  })
  document.querySelector('#session-form').onsubmit = async event => {
    event.preventDefault()
    const form = event.currentTarget
    const button = form.querySelector('[type=submit]')
    button.disabled = true
    const payload = {
      title: form.elements.namedItem('title').value.trim(), activity: form.elements.namedItem('activity').value.trim(),
      session_date: form.elements.namedItem('session_date').value, status: form.elements.namedItem('status').value, notes: form.elements.namedItem('notes').value.trim()
    }
    if (!payload.title || !payload.activity) { button.disabled = false; return showNotice('Title and activity are required.') }
    const { error } = editing
      ? await db.from('sessions').update(payload).eq('id', editing).eq('user_id', user.id)
      : await db.from('sessions').insert({ ...payload, user_id: user.id })
    button.disabled = false
    if (error) return showNotice(error.message)
    editing = null
    await loadRecords()
    showNotice('Session saved.', true)
  }
}
async function loadRecords() {
  if (!user) return
  const { data, error } = await db.from('sessions').select('id,title,activity,session_date,status,notes').eq('user_id', user.id).order('session_date', { ascending: false })
  if (error) { layout(`<section class="hero"><h1>Could not load sessions</h1><p>${escapeHtml(error.message)}</p></section>`); return }
  records = data || []
  renderApp()
}
if (!db) {
  layout('<section class="hero"><h1>Setup needed</h1><p>Add your Supabase project URL and publishable key to a <code>.env</code> file, then restart the app. See README.md.</p></section>')
} else {
  db.auth.onAuthStateChange((_event, session) => {
    const nextUser = session?.user || null
    if (nextUser?.id === user?.id) return
    user = nextUser
    editing = null
    if (user) loadRecords()
    else { records = []; renderAuth() }
  })
  db.auth.getSession().then(({ data }) => {
    if (data.session?.user && !user) { user = data.session.user; loadRecords() }
    else if (!user) renderAuth()
  })
}

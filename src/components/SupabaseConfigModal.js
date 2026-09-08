import { getSupabaseConfig, updateSupabaseConfig, testSupabaseConnection, resetSupabaseConfig } from '../services/supabase.js';
import { showToast } from '../utils/toast.js';

export function renderSupabaseConfigModal() {
  const config = getSupabaseConfig();

  const modalHtml = `
    <div id="supabase-modal" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in" style="display: none;">
      <div class="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-emerald-100 flex flex-col max-h-[90vh]">
        <!-- Header -->
        <div class="bg-gradient-to-r from-emerald-800 to-green-700 p-6 text-white flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center font-bold">
              ⚡
            </div>
            <div>
              <h2 class="text-xl font-extrabold leading-tight">Supabase Connection Center</h2>
              <p class="text-xs text-emerald-100">Project: <span class="font-bold underline">${config.projectName}</span></p>
            </div>
          </div>
          <button id="close-supabase-modal" class="p-2 rounded-full hover:bg-white/20 transition-colors">
            <span class="material-symbols-outlined text-white text-xl">close</span>
          </button>
        </div>

        <!-- Content Body -->
        <div class="p-6 overflow-y-auto space-y-5 text-gray-800">
          <div class="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-950 flex items-center gap-3">
            <span class="material-symbols-outlined text-emerald-700 text-2xl">verified</span>
            <div>
              <p class="font-bold">Connected Project: ${config.projectName}</p>
              <p class="text-xs text-emerald-800">Authentication configured for Mobile OTP SMS and Google Sign-In.</p>
            </div>
          </div>

          <!-- URL input -->
          <div class="space-y-1.5">
            <label class="block text-sm font-bold text-gray-700" for="sb-modal-url">Supabase Project URL</label>
            <input 
              id="sb-modal-url" 
              type="url" 
              value="${config.url}" 
              placeholder="https://your-project.supabase.co" 
              class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 font-mono text-sm"
            />
          </div>

          <!-- Anon Key input -->
          <div class="space-y-1.5">
            <label class="block text-sm font-bold text-gray-700" for="sb-modal-key">Supabase API / Anon Key</label>
            <input 
              id="sb-modal-key" 
              type="text" 
              value="${config.anonKey}" 
              placeholder="BqtU6lFwVcs1sEZb" 
              class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 font-mono text-sm"
            />
            <p class="text-xs text-gray-500">Your provided API parameter: <code class="bg-gray-100 px-1 py-0.5 rounded text-emerald-800 font-mono">BqtU6lFwVcs1sEZb</code></p>
          </div>

          <!-- Connection test output -->
          <div id="sb-test-status" class="hidden p-3 rounded-xl text-sm font-medium"></div>

          <!-- Action buttons -->
          <div class="flex flex-col sm:flex-row gap-3 pt-2">
            <button id="sb-test-btn" type="button" class="flex-1 py-3 px-4 rounded-xl border border-emerald-600 text-emerald-700 font-bold hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2">
              <span class="material-symbols-outlined text-lg">network_check</span>
              Test Connection
            </button>
            <button id="sb-save-btn" type="button" class="flex-1 py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold shadow-md transition-colors flex items-center justify-center gap-2">
              <span class="material-symbols-outlined text-lg">save</span>
              Save Settings
            </button>
          </div>

          <!-- Optional Database Schema Setup Snippet -->
          <div class="pt-4 border-t border-gray-200">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-bold text-gray-600 uppercase tracking-wider">Quick SQL Schema for Sahara</span>
              <button id="sb-copy-sql" type="button" class="text-xs text-emerald-700 hover:underline font-bold flex items-center gap-1">
                <span class="material-symbols-outlined text-sm">content_copy</span> Copy SQL
              </button>
            </div>
            <pre class="bg-gray-900 text-emerald-300 p-3 rounded-xl text-[11px] overflow-x-auto font-mono leading-relaxed">
-- Run in Supabase SQL Editor:
CREATE TABLE IF NOT EXISTS public.reminders (
  id text primary key,
  title text not null,
  category text not null,
  scheduled_time text not null,
  taken boolean default false,
  created_at timestamp with time zone default now()
);</pre>
          </div>
        </div>
      </div>
    </div>
  `;

  // Append or replace
  const existing = document.getElementById('supabase-modal');
  if (existing) existing.remove();
  
  const wrapper = document.createElement('div');
  wrapper.innerHTML = modalHtml;
  document.body.appendChild(wrapper.firstElementChild);

  // Bind Events
  const modal = document.getElementById('supabase-modal');
  const closeBtn = document.getElementById('close-supabase-modal');
  const testBtn = document.getElementById('sb-test-btn');
  const saveBtn = document.getElementById('sb-save-btn');
  const copySqlBtn = document.getElementById('sb-copy-sql');
  const statusBox = document.getElementById('sb-test-status');

  closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
  });

  testBtn.addEventListener('click', async () => {
    testBtn.innerText = 'Testing...';
    testBtn.disabled = true;
    
    const res = await testSupabaseConnection();
    testBtn.disabled = false;
    testBtn.innerHTML = '<span class="material-symbols-outlined text-lg">network_check</span> Test Connection';

    statusBox.classList.remove('hidden', 'bg-emerald-50', 'text-emerald-900', 'bg-amber-50', 'text-amber-900');
    if (res.success) {
      statusBox.classList.add('bg-emerald-50', 'text-emerald-900', 'border', 'border-emerald-300');
      statusBox.innerHTML = `🟢 <strong>Connected:</strong> ${res.message}`;
    } else {
      statusBox.classList.add('bg-amber-50', 'text-amber-900', 'border', 'border-amber-300');
      statusBox.innerHTML = `⚠️ <strong>Connection Status:</strong> ${res.message}. Sahara is currently operating in <em>Smart Sandbox Mode</em> with local state synchronization.`;
    }
  });

  saveBtn.addEventListener('click', () => {
    const newUrl = document.getElementById('sb-modal-url').value;
    const newKey = document.getElementById('sb-modal-key').value;
    updateSupabaseConfig(newUrl, newKey, 'sahara');
    showToast('Supabase configuration updated successfully!', 'success');
    modal.style.display = 'none';
    window.location.reload();
  });

  copySqlBtn.addEventListener('click', () => {
    const sql = `CREATE TABLE IF NOT EXISTS public.reminders (id text primary key, title text not null, category text not null, scheduled_time text not null, taken boolean default false, created_at timestamp with time zone default now());`;
    navigator.clipboard.writeText(sql);
    showToast('SQL Schema copied to clipboard!', 'success');
  });
}

export function openSupabaseConfigModal() {
  renderSupabaseConfigModal();
  const modal = document.getElementById('supabase-modal');
  if (modal) modal.style.display = 'flex';
}

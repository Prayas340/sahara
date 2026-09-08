// Sahara Accessible Toast System

export function showToast(message, type = 'info', duration = 4500) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast-item';
  
  let iconName = 'info';
  let iconColor = 'var(--color-primary)';
  
  if (type === 'success') {
    iconName = 'check_circle';
    iconColor = 'var(--color-primary)';
  } else if (type === 'error') {
    iconName = 'warning';
    iconColor = 'var(--color-error)';
  } else if (type === 'heart') {
    iconName = 'favorite';
    iconColor = 'var(--color-secondary)';
  }

  toast.innerHTML = `
    <span class="material-symbols-outlined" style="color: ${iconColor}; font-size: 28px; font-variation-settings: 'FILL' 1;">${iconName}</span>
    <div style="flex: 1; font-size: 15px; line-height: 1.4; font-weight: 600; color: var(--color-on-surface);">
      ${message}
    </div>
    <button style="border: none; background: transparent; cursor: pointer; color: var(--color-outline); display: flex; align-items: center;" onclick="this.parentElement.remove()">
      <span class="material-symbols-outlined" style="font-size: 20px;">close</span>
    </button>
  `;

  container.appendChild(toast);

  // Gentle accessibility chime using Web Audio API
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(type === 'success' ? 587.33 : 440, audioCtx.currentTime); // D5 or A4
    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.3);
  } catch (e) {
    // AudioContext may be blocked before user gesture
  }

  setTimeout(() => {
    if (toast.parentElement) {
      toast.style.transition = 'opacity 0.3s, transform 0.3s';
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }
  }, duration);
}

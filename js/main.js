// =====================================================
// SMART ROOM - Main Utility Functions
// =====================================================

function formatDate(dateString) {
  if (!dateString) return '-';
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', options);
}

function formatTime(timeString) {
  return timeString ? timeString : '-';
}

function formatDateTime(timestamp) {
  if (!timestamp) return '-';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric', 
    hour: '2-digit', minute: '2-digit'
  });
}

function calculateDuration(startTime, endTime) {
  const start = startTime.split(':');
  const end = endTime.split(':');
  const startMins = parseInt(start[0]) * 60 + parseInt(start[1]);
  const endMins = parseInt(end[0]) * 60 + parseInt(end[1]);
  return Math.max(0, endMins - startMins);
}

function calculateLateDuration(endTimeStr, returnTimeDate) {
  const [hours, minutes] = endTimeStr.split(':');
  const expectedDate = new Date();
  expectedDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  
  if (returnTimeDate > expectedDate) {
    return Math.floor((returnTimeDate - expectedDate) / 60000);
  }
  return 0;
}

function isTimeConflict(start1, end1, start2, end2) {
  return (start1 < end2 && end1 > start2);
}

function formatDuration(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h} jam ${m} menit`;
  if (h > 0) return `${h} jam`;
  return `${m} menit`;
}

function getStatusBadgeHtml(status) {
  let cls = 'secondary';
  let text = status;
  
  switch(status.toLowerCase()) {
    case 'pending': cls = 'warning'; text = 'Menunggu'; break;
    case 'approved': cls = 'primary'; text = 'Disetujui'; break;
    case 'active': cls = 'success'; text = 'Berlangsung'; break;
    case 'completed': cls = 'info'; text = 'Selesai'; break;
    case 'rejected': cls = 'danger'; text = 'Ditolak'; break;
    case 'available': cls = 'success'; text = 'Tersedia'; break;
    case 'unavailable': cls = 'danger'; text = 'Tidak Tersedia'; break;
  }
  return `<span class="badge bg-${cls}">${text}</span>`;
}

function getStatusLockerHtml(status) {
  let cls = 'success';
  let text = 'Tersedia';
  let icon = 'box';
  
  if (status === 'borrowed') {
    cls = 'warning';
    text = 'Dipinjam';
    icon = 'box-open';
  } else if (status === 'maintenance') {
    cls = 'danger';
    text = 'Perbaikan';
    icon = 'tools';
  }
  
  return `<span class="badge bg-${cls}"><i class="fas fa-${icon} me-1"></i>${text}</span>`;
}

function initSidebar() {
  const toggleBtn = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('sidebar');
  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      document.body.classList.toggle('sb-sidenav-toggled');
    });
  }
}

function initTheme() {
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-bs-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-bs-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      
      const icon = themeToggle.querySelector('i');
      if (icon) {
        icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
      }
    });
    
    // Load saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      document.documentElement.setAttribute('data-bs-theme', savedTheme);
      const icon = themeToggle.querySelector('i');
      if (icon) {
        icon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
      }
    }
  }
}

function formatCountdown(seconds) {
  if (seconds <= 0) return "00:00:00";
  const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
}

function startCountdown(endTimeStr, elementId) {
  const el = document.getElementById(elementId);
  if (!el) return null;
  
  const [hours, minutes] = endTimeStr.split(':');
  const expectedDate = new Date();
  expectedDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  
  const interval = setInterval(() => {
    const now = new Date();
    const diff = Math.floor((expectedDate - now) / 1000);
    
    if (diff <= 0) {
      clearInterval(interval);
      el.innerHTML = '<span class="text-danger fw-bold">Waktu Habis!</span>';
    } else {
      el.textContent = formatCountdown(diff);
    }
  }, 1000);
  
  return interval;
}

function debounce(fn, ms) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, ms);
  };
}

function generateInitials(name) {
  if (!name) return 'U';
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}

function getRandomColor(seed) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    color += ('00' + value.toString(16)).substr(-2);
  }
  return color;
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  initSidebar();
  initTheme();
});

const fs = require('fs');

let content = fs.readFileSync('c:/Users/USER/OneDrive/Desktop/Roamly_Platform-Chethiya/Roamly_Platform-Chethiya/admin-dashboard.html', 'utf8');

// 1. Unified Review Modal
const reviewModalStr = `<!-- ══ Unified Review Modal ══════════════════════════════════════════════════ -->
<div class="reason-modal-overlay" id="reviewModal" role="dialog" aria-modal="true" aria-labelledby="reviewModalTitle">
  <div class="reason-modal-box scroll-reveal" style="max-width:700px; max-height:90vh; overflow-y:auto; width:90%; display:flex; flex-direction:column;">
    <h3 id="reviewModalTitle" style="margin-bottom:16px; color:var(--ink);">Review Details</h3>
    <div id="reviewModalBody" style="font-size:0.9rem; color:var(--ink); flex:1; overflow-y:auto; padding-right:8px;"></div>
    <div class="reason-modal-actions" style="margin-top:24px; border-top:1px solid var(--line); padding-top:16px;">
      <button class="btn-neutral" onclick="closeReviewModal()">Close</button>
      <button class="btn-reject" id="reviewRejectBtn">Reject</button>
      <button class="btn-approve" id="reviewApproveBtn">Approve</button>
    </div>
  </div>
</div>

<!-- ══ Reject / Reason Modal ══════════════════════════════════════════════════ -->
<div class="reason-modal-overlay" id="reasonModal" role="dialog" aria-modal="true" aria-labelledby="reasonModalTitle">`;
content = content.replace('<!-- ══ Reject / Reason Modal ══════════════════════════════════════════════════ -->\n<div class="reason-modal-overlay" id="reasonModal"', reviewModalStr);


// 2. Topbar Bell
const topbarStr = `<div class="adm-topbar">
      <h1 id="topbarTitle">Overview</h1>
      <div style="display:flex; align-items:center; gap:16px;">
        <div style="position:relative;">
          <button id="notifBellBtn" style="background:none;border:none;color:var(--ink);cursor:pointer;position:relative;display:flex;align-items:center;justify-content:center;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            <span id="notifBadge" style="position:absolute;top:-4px;right:-4px;background:var(--red);color:#fff;font-size:10px;font-weight:bold;border-radius:10px;padding:2px 5px;display:none;">0</span>
          </button>
          
          <div id="notifDropdown" style="display:none;position:absolute;top:35px;right:0;width:300px;background:var(--surface);border:1px solid var(--line);box-shadow:var(--shadow);border-radius:var(--radius-md);z-index:100;max-height:400px;overflow-y:auto;flex-direction:column;">
             <div style="padding:12px 16px;border-bottom:1px solid var(--line);display:flex;justify-content:space-between;align-items:center;">
               <h4 style="margin:0;font-size:0.9rem;color:var(--ink);">Notifications</h4>
               <button id="markAllReadBtn" style="background:none;border:none;color:var(--red);font-size:0.8rem;cursor:pointer;">Mark all read</button>
             </div>
             <div id="notifList" style="padding:0;display:flex;flex-direction:column;">
                <div class="adm-empty" style="padding:20px;">No notifications.</div>
             </div>
          </div>
        </div>
        <span class="adm-badge-role" id="adminName">Admin</span>
      </div>
    </div>`;
content = content.replace(/<div class="adm-topbar">[\s\S]*?<span class="adm-badge-role" id="adminName">Admin<\/span>\s*<\/div>/, topbarStr);


// 3. Recent Activity Table
const overviewStr = `<!-- ── OVERVIEW ───────────────────────────────────────────────────── -->
      <section class="adm-section active" id="section-overview">
        <div class="adm-stats-grid" id="statsGrid">
          <!-- Filled by JS -->
          <div class="adm-stat"><div class="adm-stat-label">Loading…</div></div>
        </div>
        
        <div style="margin-top:32px;">
          <h2 style="font-family:var(--font-display); font-size:1.45rem; color:var(--ink); margin-bottom:16px;">Recent Activity</h2>
          <div class="adm-table-wrap">
            <table class="adm-table" id="activityTable">
              <thead><tr><th>Time</th><th>Type</th><th>Message</th></tr></thead>
              <tbody id="activityTbody"><tr><td colspan="3" class="adm-empty">Loading…</td></tr></tbody>
            </table>
          </div>
        </div>
      </section>`;
content = content.replace(/<!-- ── OVERVIEW ───────────────────────────────────────────────────── -->[\s\S]*?<\/section>/, overviewStr);


// 4. Update Biz Actions
content = content.replace(
  /\<div class="btn-gap"\>[\s\S]*?\<\/div\>/, 
  `<button class="btn-neutral" onclick="openReviewModal('business', '\${b._id}')">View Details</button>`
);

// 5. Update Spot Actions (second match of btn-gap in the script)
content = content.replace(
  /\<div class="btn-gap"\>[\s\S]*?\<\/div\>/, 
  `<button class="btn-neutral" onclick="openReviewModal('spot', '\${s._id}')">View Details</button>`
);


// 6. Javascript logic
const jsStr = `// ── REVIEW MODAL & NOTIFICATIONS ─────────────────────────────────────────────
let _currentReviewId = null;
let _currentReviewType = null;

async function openReviewModal(type, id) {
  _currentReviewType = type;
  _currentReviewId = id;
  const modal = document.getElementById('reviewModal');
  const body = document.getElementById('reviewModalBody');
  const rejectBtn = document.getElementById('reviewRejectBtn');
  const approveBtn = document.getElementById('reviewApproveBtn');
  
  body.innerHTML = '<div class="adm-empty">Loading...</div>';
  modal.classList.add('active');
  
  try {
    const { data } = await api(type === 'business' ? '/businesses/'+id : '/spots/'+id);
    
    if(data.status !== 'pending') {
      rejectBtn.style.display = 'none';
      approveBtn.style.display = 'none';
    } else {
      rejectBtn.style.display = 'inline-block';
      approveBtn.style.display = 'inline-block';
    }
    
    let html = '';
    if(type === 'business') {
      html = \`
        <div style="display:flex;gap:16px;margin-bottom:16px;flex-wrap:wrap;">
          \${data.images?.logo ? \`<img src="\${data.images.logo}" style="width:80px;height:80px;object-fit:cover;border-radius:8px;" />\` : ''}
          \${data.images?.cover ? \`<img src="\${data.images.cover}" style="flex:1;min-width:200px;height:80px;object-fit:cover;border-radius:8px;" />\` : ''}
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">
          <div><strong>Name:</strong> \${esc(data.name)}</div>
          <div><strong>Category:</strong> \${esc(data.category)}</div>
          <div><strong>Owner:</strong> \${esc(data.ownerFullName)}</div>
          <div><strong>Email:</strong> <a href="mailto:\${esc(data.contact?.businessEmail)}" style="color:var(--red);">\${esc(data.contact?.businessEmail)}</a></div>
          <div><strong>Phone:</strong> \${esc(data.contact?.businessPhone)}</div>
          <div><strong>Location:</strong> \${esc(data.location?.city)}, \${esc(data.location?.district)}</div>
        </div>
        <div style="margin-bottom:16px;background:rgba(0,0,0,0.02);padding:12px;border-radius:8px;"><strong>Description:</strong><br>\${esc(data.description)}</div>
        <div style="margin-bottom:16px;"><strong>Facilities:</strong> \${data.facilities?.join(', ')}</div>
        <div style="margin-bottom:16px;">
          <strong>Documents:</strong><br>
          \${data.verification?.licenseDocUrl ? \`<a href="\${data.verification.licenseDocUrl}" target="_blank" style="display:inline-block;padding:4px 10px;background:var(--navy-900);color:#fff;border-radius:4px;text-decoration:none;font-size:0.8rem;margin-top:6px;">View License</a>\` : '<span style="color:var(--ink-faint);">No License</span>'}
          \${data.verification?.nicDocUrl ? \`<a href="\${data.verification.nicDocUrl}" target="_blank" style="display:inline-block;padding:4px 10px;background:var(--navy-700);color:#fff;border-radius:4px;text-decoration:none;font-size:0.8rem;margin-top:6px;margin-left:6px;">View NIC</a>\` : ''}
        </div>
        \${data.images?.gallery?.length ? \`
          <div style="margin-bottom:16px;"><strong>Gallery:</strong><br>
            <div style="display:flex;gap:8px;overflow-x:auto;padding-top:8px;">
              \${data.images.gallery.map(img => \`<img src="\${img}" style="width:100px;height:80px;object-fit:cover;border-radius:4px;"/>\`).join('')}
            </div>
          </div>
        \` : ''}
      \`;
    } else {
      html = \`
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">
          <div><strong>Name:</strong> \${esc(data.name)}</div>
          <div><strong>Category:</strong> \${esc(data.category)}</div>
          <div><strong>Submitted By:</strong> \${esc(data.submittedBy?.name)}</div>
          <div><strong>Entry Fee:</strong> LKR \${data.entryFee || '0'}</div>
          <div><strong>Location:</strong> \${esc(data.destination?.name)}</div>
          <div><strong>Opening Hours:</strong> \${esc(data.openingHours)}</div>
        </div>
        <div style="margin-bottom:16px;background:rgba(0,0,0,0.02);padding:12px;border-radius:8px;"><strong>Description:</strong><br>\${esc(data.description)}</div>
        \${data.photos?.length ? \`
          <div style="margin-bottom:16px;"><strong>Photos:</strong><br>
            <div style="display:flex;gap:8px;overflow-x:auto;padding-top:8px;">
              \${data.photos.map(img => \`<img src="\${img}" style="width:100px;height:80px;object-fit:cover;border-radius:4px;"/>\`).join('')}
            </div>
          </div>
        \` : ''}
      \`;
    }
    body.innerHTML = html;
    modal.querySelector('.scroll-reveal').classList.add('visible');
    
  } catch(e) {
    body.innerHTML = '<div class="adm-empty">Failed to load details.</div>';
  }
}

function closeReviewModal() {
  document.getElementById('reviewModal').classList.remove('active');
  _currentReviewId = null;
  _currentReviewType = null;
}

document.getElementById('reviewApproveBtn').addEventListener('click', async () => {
  if(!_currentReviewId) return;
  try {
    if(_currentReviewType === 'business') {
      await api(\`/admin/businesses/\${_currentReviewId}/approve\`, { method: 'PUT' });
    } else {
      await api(\`/admin/spots/\${_currentReviewId}/approve\`, { method: 'PUT' });
    }
    toast('Approved ✓');
    closeReviewModal();
    _currentReviewType === 'business' ? loadBusinesses() : loadSpots();
    loadStats();
  } catch(e) { toast(e.message, false); }
});

document.getElementById('reviewRejectBtn').addEventListener('click', () => {
  if(!_currentReviewId) return;
  closeReviewModal();
  openReject(_currentReviewType, _currentReviewId);
});

document.getElementById('reviewModal').addEventListener('click', (e) => {
  if (e.target === document.getElementById('reviewModal')) closeReviewModal();
});

// Notifications
async function loadUnreadCount() {
  try {
    const { count } = await api('/admin/notifications/unread-count');
    const badge = document.getElementById('notifBadge');
    if(count > 0) {
      badge.textContent = count > 99 ? '99+' : count;
      badge.style.display = 'block';
    } else {
      badge.style.display = 'none';
    }
  } catch(e) {}
}

setInterval(loadUnreadCount, 30000);
loadUnreadCount();

document.getElementById('notifBellBtn').addEventListener('click', async () => {
  const dropdown = document.getElementById('notifDropdown');
  if(dropdown.style.display === 'flex') {
    dropdown.style.display = 'none';
  } else {
    dropdown.style.display = 'flex';
    try {
      const { data } = await api('/admin/notifications?limit=10');
      const list = document.getElementById('notifList');
      if(!data.length) {
         list.innerHTML = \`<div class="adm-empty" style="padding:20px;">No notifications.</div>\`;
      } else {
         list.innerHTML = data.map(n => \`
           <div onclick="handleNotifClick('\${n._id}', '\${n.relatedType}', '\${n.relatedId}')" style="padding:12px 16px;border-bottom:1px solid var(--line);cursor:pointer;background:\${n.read ? 'transparent' : 'rgba(215,38,61,0.05)'};transition:0.2s;">
             <div style="font-size:0.85rem;color:var(--ink);">\${esc(n.message)}</div>
             <div style="font-size:0.75rem;color:var(--ink-faint);margin-top:4px;">\${timeAgo(new Date(n.createdAt))}</div>
           </div>
         \`).join('');
      }
    } catch(e) {}
  }
});

async function handleNotifClick(notifId, relType, relId) {
  document.getElementById('notifDropdown').style.display = 'none';
  try { await api(\`/admin/notifications/\${notifId}/read\`, { method: 'PUT' }); } catch(e){}
  loadUnreadCount();
  switchSection(relType === 'business' ? 'businesses' : 'spots');
  openReviewModal(relType, relId);
}

document.getElementById('markAllReadBtn').addEventListener('click', async () => {
  try { 
    await api('/admin/notifications/read-all', { method: 'PUT' }); 
    loadUnreadCount();
    document.getElementById('notifDropdown').style.display = 'none';
    toast('All notifications marked as read ✓');
  } catch(e) {}
});

function timeAgo(date) {
  const s = Math.floor((new Date() - date) / 1000);
  if(s < 60) return s + 's ago';
  if(s < 3600) return Math.floor(s/60) + 'm ago';
  if(s < 86400) return Math.floor(s/3600) + 'h ago';
  return Math.floor(s/86400) + 'd ago';
}

async function loadRecentActivity() {
  try {
    const { data } = await api('/admin/notifications?limit=10');
    const tbody = document.getElementById('activityTbody');
    if(!data.length) { tbody.innerHTML = \`<tr><td colspan="3"><div class="adm-empty">No activity.</div></td></tr>\`; return; }
    tbody.innerHTML = data.map(n => \`
      <tr>
        <td style="color:var(--ink-faint);font-size:0.8rem;">\${timeAgo(new Date(n.createdAt))}</td>
        <td><span class="status-badge \${n.type==='business_registered'?'status-pending':'status-approved'}">\${n.type === 'business_registered' ? 'Business' : 'Spot'}</span></td>
        <td>\${esc(n.message)}</td>
      </tr>
    \`).join('');
  } catch(e) {}
}

// ── Boot ─────────────────────────────────────────────────────────────────────
loadStats();
loadRecentActivity();`;

content = content.replace('// ── Boot ─────────────────────────────────────────────────────────────────────\nloadStats();', jsStr);

// add loadRecentActivity to loadStats callback
content = content.replace('}).join(\'\');\n  } catch(e)', '}).join(\'\');\n    loadRecentActivity();\n  } catch(e)');

fs.writeFileSync('c:/Users/USER/OneDrive/Desktop/Roamly_Platform-Chethiya/Roamly_Platform-Chethiya/admin-dashboard.html', content);
console.log('admin-dashboard.html successfully updated.');

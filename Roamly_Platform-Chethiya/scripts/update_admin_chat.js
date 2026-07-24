const fs = require('fs');
let content = fs.readFileSync('c:/Users/USER/OneDrive/Desktop/Roamly_Platform-Chethiya/Roamly_Platform-Chethiya/admin-dashboard.html', 'utf8');

// 1. Add "Message Thread" button to Review Modal
// Find `<button class="btn-reject" id="reviewRejectBtn">Reject</button>`
const messageBtnHTML = `<button class="btn-neutral" id="reviewMessageBtn" style="margin-right:auto; border-color:var(--navy-900); color:var(--navy-900);">Message Thread</button>`;
content = content.replace(
    '<button class="btn-reject" id="reviewRejectBtn">Reject</button>',
    messageBtnHTML + '\n      <button class="btn-reject" id="reviewRejectBtn">Reject</button>'
);

// 2. Add Chat Modal HTML
const chatModalHTML = `
<!-- ══ Chat Modal ══════════════════════════════════════════════════════════ -->
<div class="reason-modal-overlay" id="chatModal" role="dialog" aria-modal="true" aria-labelledby="chatModalTitle">
  <div class="reason-modal-box scroll-reveal" style="max-width:600px; max-height:85vh; width:90%; display:flex; flex-direction:column; padding:0; overflow:hidden;">
    <div style="padding:16px 24px; border-bottom:1px solid var(--line); display:flex; justify-content:space-between; align-items:center; background:var(--surface);">
      <h3 id="chatModalTitle" style="margin:0; font-size:1.2rem; color:var(--ink);">Message Thread</h3>
      <button onclick="closeChatModal()" style="background:none; border:none; cursor:pointer; color:var(--ink-faint); font-size:1.2rem;">&times;</button>
    </div>
    
    <div id="chatMessages" style="flex:1; overflow-y:auto; padding:20px 24px; display:flex; flex-direction:column; gap:16px; background:#f9fafb; min-height:300px;">
      <!-- Bubbles -->
    </div>
    
    <div style="padding:16px 24px; border-top:1px solid var(--line); background:var(--surface); display:flex; gap:12px;">
      <input type="text" id="chatInput" placeholder="Type a message..." style="flex:1; padding:10px 16px; border:1px solid var(--line); border-radius:999px; font-family:inherit; outline:none;" onkeypress="if(event.key==='Enter') sendChatMessage()">
      <button onclick="sendChatMessage()" style="background:var(--navy-900); color:#fff; border:none; padding:10px 20px; border-radius:999px; font-weight:600; cursor:pointer;">Send</button>
    </div>
  </div>
</div>
`;

// Insert it before the toast
content = content.replace('<!-- ══ Toast ══════════════════════════════════════════════════════════════════ -->', chatModalHTML + '\n<!-- ══ Toast ══════════════════════════════════════════════════════════════════ -->');

// 3. Add JS Logic
const jsLogic = `
let chatPollInterval = null;
let currentChatBusinessId = null;

function openChatModal(businessId, businessName) {
  currentChatBusinessId = businessId;
  document.getElementById('chatModalTitle').textContent = 'Thread: ' + (businessName || 'Business');
  document.getElementById('chatModal').classList.add('active');
  document.getElementById('chatInput').value = '';
  document.getElementById('chatMessages').innerHTML = '<div style="text-align:center; color:var(--ink-faint); font-size:0.9rem;">Loading messages...</div>';
  
  loadChatMessages();
  if (chatPollInterval) clearInterval(chatPollInterval);
  chatPollInterval = setInterval(loadChatMessages, 5000);
}

function closeChatModal() {
  document.getElementById('chatModal').classList.remove('active');
  if (chatPollInterval) clearInterval(chatPollInterval);
  chatPollInterval = null;
  currentChatBusinessId = null;
}

async function loadChatMessages() {
  if (!currentChatBusinessId) return;
  try {
    const { data } = await api('/messages/' + currentChatBusinessId);
    const container = document.getElementById('chatMessages');
    
    if (data.length === 0) {
      container.innerHTML = '<div style="text-align:center; color:var(--ink-faint); font-size:0.9rem; margin-top:auto; margin-bottom:auto;">No messages yet. Start the conversation!</div>';
      return;
    }
    
    // Check if we need to auto-scroll (only if we were already at bottom)
    const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 50;
    
    container.innerHTML = data.map(msg => {
      const isAdmin = msg.senderRole === 'admin';
      return \`
        <div style="display:flex; flex-direction:column; align-items: \${isAdmin ? 'flex-end' : 'flex-start'};">
          <div style="font-size:0.75rem; color:var(--ink-faint); margin-bottom:4px; margin-left:4px; margin-right:4px;">
            \${isAdmin ? 'Admin' : (msg.sender?.name || 'Owner')} • \${new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </div>
          <div style="max-width:80%; padding:10px 16px; border-radius:18px; \${isAdmin ? 'background:var(--navy-900); color:#fff; border-bottom-right-radius:4px;' : 'background:#fff; color:var(--ink); border:1px solid var(--line); border-bottom-left-radius:4px;'}">
            \${esc(msg.text)}
          </div>
        </div>
      \`;
    }).join('');
    
    if (isAtBottom) {
      container.scrollTop = container.scrollHeight;
    }
  } catch(e) {
    console.error('Failed to load thread', e);
  }
}

async function sendChatMessage() {
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if (!text || !currentChatBusinessId) return;
  
  input.disabled = true;
  try {
    await api('/messages', {
      method: 'POST',
      body: JSON.stringify({ businessId: currentChatBusinessId, text })
    });
    input.value = '';
    await loadChatMessages();
    const container = document.getElementById('chatMessages');
    container.scrollTop = container.scrollHeight; // Force scroll to bottom on my send
  } catch(e) {
    toast(e.message, false);
  } finally {
    input.disabled = false;
    input.focus();
  }
}

// Hook reviewMessageBtn to open chat
document.addEventListener('click', (e) => {
  if (e.target && e.target.id === 'reviewMessageBtn') {
    if (_currentReviewType === 'business' && _currentReviewId) {
      const bizName = document.querySelector('#reviewModalBody strong') ? document.querySelector('#reviewModalBody strong').nextSibling.textContent.trim() : '';
      openChatModal(_currentReviewId, bizName);
    }
  }
});
`;

content = content.replace('// ── Boot ─────────────────────────────────────────────────────────────────────', jsLogic + '\n// ── Boot ─────────────────────────────────────────────────────────────────────');

// Hide the Message button for spots
const spotHideLogic = `
    if(type === 'business') {
      document.getElementById('reviewMessageBtn').style.display = 'inline-block';
`;
content = content.replace(`if(type === 'business') {`, spotHideLogic);

const spotHideLogic2 = `
    } else {
      document.getElementById('reviewMessageBtn').style.display = 'none';
`;
content = content.replace(`} else {`, spotHideLogic2);

fs.writeFileSync('c:/Users/USER/OneDrive/Desktop/Roamly_Platform-Chethiya/Roamly_Platform-Chethiya/admin-dashboard.html', content);
console.log('admin-dashboard.html successfully updated.');

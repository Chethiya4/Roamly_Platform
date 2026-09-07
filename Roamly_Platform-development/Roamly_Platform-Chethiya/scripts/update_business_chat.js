const fs = require('fs');
let content = fs.readFileSync('c:/Users/USER/OneDrive/Desktop/Roamly_Platform-Chethiya/Roamly_Platform-Chethiya/business.html', 'utf8');

const messagesSectionHTML = `
      <div class="section-box" id="dashboardMessagesSection">
        <div class="section-title">Messages from Admin</div>
        <div id="chatMessages" style="height:350px; overflow-y:auto; padding:20px; display:flex; flex-direction:column; gap:16px; background:#f9fafb; border:1px solid var(--line); border-radius:var(--radius-md) var(--radius-md) 0 0;">
          <div style="text-align:center; color:var(--ink-faint); font-size:0.9rem; margin-top:auto; margin-bottom:auto;">Loading messages...</div>
        </div>
        <div style="padding:16px; border:1px solid var(--line); border-top:none; border-radius:0 0 var(--radius-md) var(--radius-md); background:var(--surface); display:flex; gap:12px;">
          <input type="text" id="chatInput" placeholder="Type a reply to admin..." style="flex:1; padding:10px 16px; border:1px solid var(--line); border-radius:999px; font-family:inherit; outline:none;" onkeypress="if(event.key==='Enter') sendChatMessage()">
          <button onclick="sendChatMessage()" class="btn-primary" style="padding:10px 20px; border-radius:999px;">Send</button>
        </div>
      </div>
`;

// Insert the messages section after the listings section
content = content.replace(
  '<div class="section-box" id="dashboardListingsSection">',
  messagesSectionHTML + '\n      <div class="section-box" id="dashboardListingsSection">'
);

// Add the JS logic for the chat
const jsLogic = `
    let chatPollInterval = null;

    async function loadChatMessages() {
      if (!businessData || !businessData._id) return;
      try {
        const res = await authFetch('/api/messages/' + businessData._id);
        const json = await res.json();
        if(!json.success) return;
        const data = json.data;
        
        const container = document.getElementById('chatMessages');
        
        if (data.length === 0) {
          container.innerHTML = '<div style="text-align:center; color:var(--ink-faint); font-size:0.9rem; margin-top:auto; margin-bottom:auto;">No messages from admin yet. You can start a conversation if you need help.</div>';
          return;
        }
        
        const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 50;
        
        container.innerHTML = data.map(msg => {
          const isOwner = msg.senderRole === 'business_owner';
          return \`
            <div style="display:flex; flex-direction:column; align-items: \${isOwner ? 'flex-end' : 'flex-start'};">
              <div style="font-size:0.75rem; color:var(--ink-faint); margin-bottom:4px; margin-left:4px; margin-right:4px;">
                \${isOwner ? 'You' : 'Admin'} • \${new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </div>
              <div style="max-width:80%; padding:10px 16px; border-radius:18px; \${isOwner ? 'background:var(--red); color:#fff; border-bottom-right-radius:4px;' : 'background:#fff; color:var(--ink); border:1px solid var(--line); border-bottom-left-radius:4px;'}">
                \${msg.text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
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
      if (!text || !businessData || !businessData._id) return;
      
      input.disabled = true;
      try {
        const res = await authFetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ businessId: businessData._id, text })
        });
        const json = await res.json();
        if(json.success) {
          input.value = '';
          await loadChatMessages();
          const container = document.getElementById('chatMessages');
          container.scrollTop = container.scrollHeight;
        }
      } catch(e) {
        alert(e.message);
      } finally {
        input.disabled = false;
        input.focus();
      }
    }
`;

// Insert it at the bottom of the script block
content = content.replace(
  'document.getElementById(\'logoutBtn\').addEventListener(\'click\', () => {',
  jsLogic + '\n    document.getElementById(\'logoutBtn\').addEventListener(\'click\', () => {'
);

// We need to start polling in initDashboard after we get the business ID
content = content.replace(
  'renderProfile(bizJson.data);',
  'renderProfile(bizJson.data);\n          loadChatMessages();\n          if(!chatPollInterval) chatPollInterval = setInterval(loadChatMessages, 5000);'
);

fs.writeFileSync('c:/Users/USER/OneDrive/Desktop/Roamly_Platform-Chethiya/Roamly_Platform-Chethiya/business.html', content);
console.log('business.html successfully updated.');

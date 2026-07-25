document.addEventListener('DOMContentLoaded', () => {
  /* ---------------- ADMIN ACCESS GUARD & HEARTBEAT TRACKING ---------------- */
  initTrackingAndAuthGuard();

  function initTrackingAndAuthGuard() {
    const token = localStorage.getItem('roamly_token');
    const role = localStorage.getItem('roamly_role');
    const currentPath = window.location.pathname.toLowerCase();
    const isAuthPage = currentPath.endsWith('auth.html');
    const isAdminDashboard = currentPath.endsWith('admin-dashboard.html');

    // Rule: Admins can ONLY see the admin dashboard. Redirect admins away from visitor/business pages.
    if (token && role === 'admin' && !isAdminDashboard && !isAuthPage) {
      window.location.href = 'admin-dashboard.html';
      return;
    }

    // Initialize visitor session ID in sessionStorage
    let sessionId = sessionStorage.getItem('roamly_session_id');
    if (!sessionId) {
      sessionId = 'sess_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now();
      sessionStorage.setItem('roamly_session_id', sessionId);
    }

    // Function to ping heartbeat API
    async function sendPing() {
      try {
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        
        await fetch('/api/tracking/heartbeat', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            sessionId,
            page: window.location.pathname + window.location.search,
            title: document.title
          })
        });
      } catch (err) {
        // Silent catch for network pings
      }
    }

    // Send immediate ping on page load
    sendPing();

    // Periodic heartbeat every 15 seconds
    setInterval(sendPing, 15000);
  }

  /* ---------------- AUTH STATE HEADER ---------------- */
  updateHeaderAuthState();

  function updateHeaderAuthState() {
    const token = localStorage.getItem('roamly_token');
    const role = localStorage.getItem('roamly_role');
    const name = localStorage.getItem('roamly_name');
    
    // Select all btn-signin elements (there might be multiple if mobile/desktop nav differs, usually just one)
    const signinBtns = document.querySelectorAll('.btn-signin');
    
    if (token) {
      signinBtns.forEach(btn => {
        // Create a user menu container to replace the sign-in button
        const userContainer = document.createElement('div');
        userContainer.className = 'user-header-menu';
        userContainer.style.display = 'flex';
        userContainer.style.alignItems = 'center';
        userContainer.style.gap = '12px';
        
        // Dashboard link
        const dest = {
          visitor: 'account.html',
          business_owner: 'business-dashboard.html',
          admin: 'admin-dashboard.html'
        }[role] || 'index.html';
        
        const nameLink = document.createElement('a');
        nameLink.href = dest;
        nameLink.textContent = name || 'My Account';
        nameLink.style.fontWeight = '700';
        nameLink.style.color = '#fff'; // Fixed light color for visibility against the dark header
        nameLink.style.textDecoration = 'none';
        
        // Log out button
        const logoutBtn = document.createElement('a');
        logoutBtn.href = '#';
        logoutBtn.textContent = 'Log Out';
        logoutBtn.className = 'btn-signin'; 
        logoutBtn.style.textDecoration = 'none';
        
        logoutBtn.addEventListener('click', (e) => {
          e.preventDefault();
          localStorage.removeItem('roamlyUser');
          localStorage.removeItem('roamly_token');
          localStorage.removeItem('roamly_role');
          localStorage.removeItem('roamly_name');
          window.location.reload();
        });
        
        userContainer.appendChild(nameLink);
        userContainer.appendChild(logoutBtn);
        
        // Replace the sign in button with the new container
        btn.parentNode.replaceChild(userContainer, btn);
      });
    } else {
      signinBtns.forEach(btn => {
        // Make sure it points to auth.html if not logged in
        btn.addEventListener('click', (e) => {
          // If it's an anchor, href handles it. If it's a button, we set location.
          if (btn.tagName.toLowerCase() === 'button') {
            e.preventDefault();
            window.location.href = 'auth.html';
          }
        });
        // Also just set onclick directly as fallback for inline handlers
        btn.setAttribute('onclick', "window.location.href='auth.html'");
      });
    }
  }


  /* ---------------- WISHLIST HEADER & BADGE ---------------- */
  initWishlistHeader();

  async function initWishlistHeader() {
    const wishlistBtns = document.querySelectorAll('.icon-btn[aria-label="Wishlist"]');
    const token = localStorage.getItem('roamly_token');

    if (token) {
      try {
        const res = await fetch('/api/wishlist/mine', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const body = await res.json();
        if (body.success && Array.isArray(body.data)) {
          const count = body.data.length;
          document.querySelectorAll('.icon-btn[aria-label="Wishlist"] .badge').forEach(b => {
            b.textContent = count;
          });
        }
      } catch (e) {}
    }

    wishlistBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const currentToken = localStorage.getItem('roamly_token');
        if (currentToken) {
          window.location.href = 'account.html';
        } else {
          window.location.href = 'auth.html';
        }
      });
    });
  }
  window.refreshWishlistBadge = initWishlistHeader;

  /* ---------------- LANGUAGE & CURRENCY (i18n Text Engine) ---------------- */
  const TRANSLATIONS = {
    EN: {
      "Home": "Home",
      "Map": "Map",
      "Bookings": "Bookings",
      "Emergency": "Emergency",
      "Gallery": "Gallery",
      "About Us": "About Us",
      "Explore": "Explore",
      "Plan a Trip": "Plan a Trip",
      "Sign In": "Sign In",
      "Log Out": "Log Out",
      "Where do you want to go?": "Where do you want to go?",
      "Explore by District": "Explore by District",
      "About Roamly": "About Roamly",
      "Key Features": "Key Features",
      "Meet the Team": "Meet the Team",
      "Traveller Reviews": "Traveller Reviews",
      "Emergency Numbers": "Emergency Numbers",
      "Quick Links": "Quick Links",
      "Popular:": "Popular:"
    },
    SI: {
      "Home": "මුල් පිටුව",
      "Map": "සිතියම",
      "Bookings": "වෙන් කිරීම්",
      "Emergency": "අදිසි සහන",
      "Gallery": "ඡායාරූප",
      "About Us": "අප ගැන",
      "Explore": "ගවේෂණය කරන්න",
      "Plan a Trip": "ගමනක් සැලසුම් කරන්න",
      "Sign In": "ඇතුළු වන්න",
      "Log Out": "ඉවත් වන්න",
      "Where do you want to go?": "ඔබට යන්න අවශ්‍ය කොහේද?",
      "Explore by District": "දිස්ත්‍රික්ක අනුව ගවේෂණය කරන්න",
      "About Roamly": "රෝම්ලි ගැන",
      "Key Features": "ප්‍රධාන ලක්ෂණ",
      "Meet the Team": "අපගේ කණ්ඩායම",
      "Traveller Reviews": "සංචාරක අදහස්",
      "Emergency Numbers": "අදිසි සහන අංක",
      "Quick Links": "ඉක්මන් යොමු",
      "Popular:": "ජනප්‍රිය:"
    },
    TA: {
      "Home": "முகப்பு",
      "Map": "வரைபடம்",
      "Bookings": "பதிவுகள்",
      "Emergency": "அவசரம்",
      "Gallery": "கேலரி",
      "About Us": "எங்களைப் பற்றி",
      "Explore": "ஆராயுங்கள்",
      "Plan a Trip": "பயணம் திட்டமிடுங்கள்",
      "Sign In": "உள்நுழையவும்",
      "Log Out": "வெளியேறவும்",
      "Where do you want to go?": "நீங்கள் எங்கு செல்ல விரும்புகிறீர்கள்?",
      "Explore by District": "மாவட்டங்கள் வாரியாக ஆராயுங்கள்",
      "About Roamly": "ரோம்லி பற்றி",
      "Key Features": "முக்கிய அம்சங்கள்",
      "Meet the Team": "எங்கள் குழு",
      "Traveller Reviews": "பயணிகளின் விமர்சனங்கள்",
      "Emergency Numbers": "அவசர எண்கள்",
      "Quick Links": "விரைவு இணைப்புகள்",
      "Popular:": "பிரபலமானவை:"
    },
    ZH: {
      "Home": "首页",
      "Map": "地图",
      "Bookings": "预订",
      "Emergency": "紧急情况",
      "Gallery": "画廊",
      "About Us": "关于我们",
      "Explore": "探索",
      "Plan a Trip": "计划旅行",
      "Sign In": "登录",
      "Log Out": "退出",
      "Where do you want to go?": "你想去哪里？",
      "Explore by District": "按地区探索",
      "About Roamly": "关于 Roamly",
      "Key Features": "主要特点",
      "Meet the Team": "团队成员",
      "Traveller Reviews": "游客评价",
      "Emergency Numbers": "紧急电话",
      "Quick Links": "快速链接",
      "Popular:": "热门："
    },
    DE: {
      "Home": "Startseite",
      "Map": "Karte",
      "Bookings": "Buchungen",
      "Emergency": "Notfall",
      "Gallery": "Galerie",
      "About Us": "Über uns",
      "Explore": "Entdecken",
      "Plan a Trip": "Reise planen",
      "Sign In": "Anmelden",
      "Log Out": "Abmelden",
      "Where do you want to go?": "Wohin möchten Sie reisen?",
      "Explore by District": "Nach Distrikt erkunden",
      "About Roamly": "Über Roamly",
      "Key Features": "Hauptmerkmale",
      "Meet the Team": "Unser Team",
      "Traveller Reviews": "Reisebewertungen",
      "Emergency Numbers": "Notrufnummern",
      "Quick Links": "Quick-Links",
      "Popular:": "Beliebt:"
    }
  };

  function translateNode(node, dict) {
    if (node.nodeType === Node.TEXT_NODE) {
      const trimmed = node.nodeValue.trim();
      if (trimmed.length > 0) {
        if (!node._origText) {
          node._origText = trimmed;
        }
        const orig = node._origText;
        if (dict[orig]) {
          node.nodeValue = node.nodeValue.replace(orig, dict[orig]);
        }
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const tag = node.tagName.toLowerCase();
      if (tag === 'script' || tag === 'style' || tag === 'svg' || tag === 'iframe' || node.id === 'langMenu') {
        return;
      }

      if (node.placeholder) {
        if (!node._origPlaceholder) {
          node._origPlaceholder = node.placeholder;
        }
        const origP = node._origPlaceholder;
        if (dict[origP]) {
          node.placeholder = dict[origP];
        }
      }

      for (let child of node.childNodes) {
        translateNode(child, dict);
      }
    }
  }

  function applyLanguageText(langCodeVal) {
    if (!TRANSLATIONS[langCodeVal]) langCodeVal = 'EN';
    const dict = TRANSLATIONS[langCodeVal];
    translateNode(document.body, dict);
  }

  const langTrigger = document.getElementById('langTrigger');
  const langMenu = document.getElementById('langMenu');
  const langCode = document.getElementById('langCode');

  if (langTrigger && langMenu && langCode) {
    const savedLang = localStorage.getItem('roamly_lang') || 'EN';
    langCode.textContent = savedLang;
    applyLanguageText(savedLang);

    langMenu.querySelectorAll('button').forEach((b) => {
      if (b.dataset.code === savedLang) b.classList.add('active');
      else b.classList.remove('active');
    });

    langTrigger.addEventListener('click', () => {
      const isOpen = !langMenu.hidden;
      langMenu.hidden = isOpen;
      langTrigger.setAttribute('aria-expanded', String(!isOpen));
    });

    langMenu.querySelectorAll('button').forEach((btn) => {
      btn.addEventListener('click', () => {
        const code = btn.dataset.code;
        langMenu.querySelectorAll('button').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        langCode.textContent = code;
        localStorage.setItem('roamly_lang', code);
        langMenu.hidden = true;
        langTrigger.setAttribute('aria-expanded', 'false');
        applyLanguageText(code);
      });
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.lang-select')) {
        langMenu.hidden = true;
        langTrigger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  const currencySelect = document.getElementById('currencySelect');
  if (currencySelect) {
    currencySelect.querySelectorAll('button').forEach((btn) => {
      btn.addEventListener('click', () => {
        currencySelect.querySelectorAll('button').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
  }

  /* ---------------- DARK MODE TOGGLE ---------------- */
  const darkModeToggle = document.getElementById('darkModeToggle');
  if (darkModeToggle) {
    darkModeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
    });
  }

  /* ---------------- 3D SCROLL REVEAL ---------------- */
  const revealElements = document.querySelectorAll('.scroll-reveal');
  const revealOptions = { 
    threshold: 0.1, 
    rootMargin: "0px 0px -50px 0px" 
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, revealOptions);

  revealElements.forEach(el => revealObserver.observe(el));

  /* ---------------- POPUP MODAL & SLIDESHOW ---------------- */
  const modal = document.getElementById('locationModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalDesc = document.getElementById('modalDesc');
  const slideElements = document.querySelectorAll('#modalSlides .slide');
  let currentSlideIndex = 0;

  // Attached to window so it can be called directly from HTML inline clicks
  window.openModal = (title, desc) => {
    if (modalTitle) modalTitle.textContent = title;
    if (modalDesc) modalDesc.textContent = desc;
    currentSlideIndex = 0;
    
    // Automatically inject unique, high-quality images based on the location name!
    if (slideElements.length > 0) {
      slideElements.forEach((img, i) => {
        const cleanTitle = title.replace(/\s+/g, '').toLowerCase();
        // Using Picsum API to fetch a random image for this specific location + slide index
        img.src = `https://picsum.photos/seed/${cleanTitle}${i}/800/500`;
      });
      updateSlides();
    }
    
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden'; // Stop background from scrolling
    } else {
      alert(`Information on ${title}:\n${desc}`);
    }
  };

  window.closeModal = () => {
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  window.changeSlide = (step) => {
    currentSlideIndex += step;
    if (currentSlideIndex >= slideElements.length) currentSlideIndex = 0;
    if (currentSlideIndex < 0) currentSlideIndex = slideElements.length - 1;
    updateSlides();
  };

  function updateSlides() {
    slideElements.forEach((slide, index) => {
      slide.classList.remove('active');
      if (index === currentSlideIndex) {
        slide.classList.add('active');
      }
    });
  }

  // Close modal if user clicks the dark background overlay
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
  }
});


/* ---- SVG DISTRICT MAP (map.html) ----------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  /* SVG label → official DB name mapping */
  const DISTRICT_MAP = {
    "Trinkomalee":"Trincomalee","Mulativ":"Mullaitivu","Jaffna":"Jaffna",
    "Kilinochchi":"Kilinochchi","Mannarama":"Mannar","Puttalama":"Puttalam",
    "Gampaha":"Gampaha","Colombo":"Colombo","Kaluthara":"Kalutara","Galle":"Galle",
    "Matara":"Matara","Hambanthota":"Hambantota","Ampara":"Ampara",
    "Madakalapuwa":"Batticaloa","Ratnapura":"Ratnapura","Monaragala":"Monaragala",
    "Kegalle":"Kegalle","Badulla":"Badulla","Matale":"Matale","Polonnaruwa":"Polonnaruwa",
    "Kurunegala":"Kurunegala","Anuradapura":"Anuradhapura","Nuwara Eliya":"Nuwara Eliya",
    "Vavuniyawa":"Vavuniya","Mahanuwara":"Kandy"
  };

  const overlay    = document.getElementById('districtModal');
  const nameEl     = document.getElementById('modalDistrictName');
  const listEl     = document.getElementById('destinationsList');

  if (!overlay || !nameEl || !listEl) return; // Not on map.html

  /* District metadata dictionary for hover card popup */
  const DISTRICT_DATA = {
    "Trincomalee": {
      province: "Eastern Province",
      tagline: "Natural deep-water harbor, Koneswaram Temple, & Pigeon Island snorkeling.",
      photo: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800"
    },
    "Mullaitivu": {
      province: "Northern Province",
      tagline: "Pristine eastern beaches, scenic lagoons, & tranquil coastal shores.",
      photo: "https://images.unsplash.com/photo-1620619767323-b95a89183081?q=80&w=800"
    },
    "Jaffna": {
      province: "Northern Province",
      tagline: "Historic Jaffna Fort, Nallur Kovil, unique culture, & northern islands.",
      photo: "https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=800"
    },
    "Kilinochchi": {
      province: "Northern Province",
      tagline: "Iranamadu Reservoir, agricultural heritage, and serene northern landscapes.",
      photo: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=800"
    },
    "Mannar": {
      province: "Northern Province",
      tagline: "Ancient Baobab trees, Adam's Bridge, & flamingo birdwatching sanctuaries.",
      photo: "https://images.unsplash.com/photo-1616422285623-13ff0162193c?q=80&w=800"
    },
    "Puttalam": {
      province: "North Western Province",
      tagline: "Wilpattu National Park safari, Kalpitiya dolphin watching, & salt pans.",
      photo: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800"
    },
    "Gampaha": {
      province: "Western Province",
      tagline: "Henarathgoda Botanical Garden, coastal resorts, & vibrant local markets.",
      photo: "https://images.unsplash.com/photo-1590001155093-a3c66ab0c3ff?q=80&w=800"
    },
    "Colombo": {
      province: "Western Province",
      tagline: "Vibrant coastal capital, Lotus Tower, Gangaramaya & oceanfront dining.",
      photo: "images/colombo.jpg"
    },
    "Kalutara": {
      province: "Western Province",
      tagline: "Kalutara Bodhiya stupa, river safaris, & golden palm beach resorts.",
      photo: "https://images.unsplash.com/photo-1605538032432-a9f0c8d9baac?q=80&w=800"
    },
    "Galle": {
      province: "Southern Province",
      tagline: "UNESCO World Heritage Galle Fort, Dutch lighthouse, & coral surf beaches.",
      photo: "images/gallfort1.jpg"
    },
    "Matara": {
      province: "Southern Province",
      tagline: "Mirissa whale watching, Dondra Head Lighthouse, & Secret Beach.",
      photo: "images/mirissa1.jpg"
    },
    "Hambantota": {
      province: "Southern Province",
      tagline: "Yala National Park leopard safaris, Ridiyagama, & coastal salt lagoons.",
      photo: "images/yala1.jpg"
    },
    "Ampara": {
      province: "Eastern Province",
      tagline: "World-famous Arugam Bay surfing, Senanayake Samudraya, & wildlife parks.",
      photo: "images/arugambay1.jpg"
    },
    "Batticaloa": {
      province: "Eastern Province",
      tagline: "Famous singing fish lagoon, Dutch Fort, & Pasikuda coral bay.",
      photo: "https://images.unsplash.com/photo-1506929562872-bb421503ef21?q=80&w=800"
    },
    "Ratnapura": {
      province: "Sabaragamuwa Province",
      tagline: "City of Gems — Adam's Peak pilgrimage, Sinharaja & sapphire mines.",
      photo: "images/adamspeak1.jpg"
    },
    "Monaragala": {
      province: "Uva Province",
      tagline: "Gal Oya National Park, Buduruwagala ancient rock carvings, & wilderness.",
      photo: "https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=800"
    },
    "Kegalle": {
      province: "Sabaragamuwa Province",
      tagline: "Pinnawala Elephant Orphanage, rubber groves, & lush hill cascades.",
      photo: "https://images.unsplash.com/photo-1581888227599-779811939961?q=80&w=800"
    },
    "Badulla": {
      province: "Uva Province",
      tagline: "Ella Gap, Nine Arch Bridge, tea plantations, & Dunhinda Falls.",
      photo: "images/ella1.jpg"
    },
    "Matale": {
      province: "Central Province",
      tagline: "Majestic Sigiriya Rock Fortress, Pidurangala, & spice gardens.",
      photo: "images/Sigiriya1.jpg"
    },
    "Polonnaruwa": {
      province: "North Central Province",
      tagline: "Ancient royal kingdom, Gal Viharaya rock statues, & Parakrama Samudra.",
      photo: "https://images.unsplash.com/photo-1596402184320-417e7178b2cd?q=80&w=800"
    },
    "Kurunegala": {
      province: "North Western Province",
      tagline: "Royal rock citadel, giant Ethagala Buddha statue, & coconut groves.",
      photo: "https://images.unsplash.com/photo-1542856391-010fb87dcfed?q=80&w=800"
    },
    "Anuradhapura": {
      province: "North Central Province",
      tagline: "UNESCO ancient sacred city, Jaya Sri Maha Bodhi, & grand stupas.",
      photo: "https://images.unsplash.com/photo-1596402184320-417e7178b2cd?q=80&w=800"
    },
    "Nuwara Eliya": {
      province: "Central Province",
      tagline: "Little England — rolling tea estates, waterfalls, & chilly Gregory Lake.",
      photo: "images/nuwaraeliya1.jpg"
    },
    "Vavuniya": {
      province: "Northern Province",
      tagline: "Ancient reservoirs, cultural crossroad, & historic northern monuments.",
      photo: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=800"
    },
    "Kandy": {
      province: "Central Province",
      tagline: "Sacred Temple of the Tooth Relic, Kandy Lake, & Royal Botanical Gardens.",
      photo: "images/Esala.jpg"
    }
  };

  const bgImageEl = document.getElementById('mapBgImage');

  /* ── Close handler ── */
  window.closeDistrictModal = () => {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  };
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) window.closeDistrictModal();
  });

  /* ── Style SVG paths for interactivity ── */
  let tooltip = document.getElementById('map-tooltip');
  if (!tooltip) {
    tooltip = document.createElement('div');
    tooltip.id = 'map-tooltip';
    tooltip.className = 'map-tooltip';
    document.body.appendChild(tooltip);
  } else if (tooltip.parentNode !== document.body) {
    document.body.appendChild(tooltip);
  }

  function updateCardViewportTop(clientY) {
    if (!clientY) return;
    const cardHeight = 260;
    let topPos = clientY - 60;
    topPos = Math.max(85, Math.min(window.innerHeight - cardHeight - 20, topPos));
    tooltip.style.top = topPos + 'px';
  }

  const paths = document.querySelectorAll('svg path.district');
  paths.forEach(path => {
    path.style.cursor = 'pointer';

    path.addEventListener('mouseenter', (e) => {
      const svgName      = path.id || path.getAttribute('name');
      const officialName = DISTRICT_MAP[svgName];
      if (!officialName) return;

      // Reset hover highlights on all other districts first
      paths.forEach(p => p.classList.remove('district-hover'));
      path.classList.add('district-hover');

      const data = DISTRICT_DATA[officialName] || {
        province: 'Sri Lanka',
        tagline: `Explore top attractions and landmarks in ${officialName}.`,
        photo: 'images/colombo.jpg'
      };

      updateCardViewportTop(e.clientY);

      // Populate right-aligned destination card template
      tooltip.innerHTML = `
        <div class="district-popup-card" style="cursor: pointer;" onclick="window.location.href='destination-detail.html?name=${encodeURIComponent(officialName)}'">
          <div class="popup-card-media">
            <img src="${data.photo}" alt="${officialName}" loading="lazy" />
            <span class="popup-card-badge">${data.province}</span>
          </div>
          <div class="popup-card-body">
            <div class="popup-card-header">
              <h4 class="popup-card-title">${officialName}</h4>
              <span class="popup-card-sub">District</span>
            </div>
            <p class="popup-card-desc">${data.tagline}</p>
            <div class="popup-card-footer">
              <span class="popup-card-action">
                <span>Explore Spots</span>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </span>
            </div>
          </div>
        </div>
      `;

      tooltip.classList.add('visible');

      // Change background image of the map container
      if (bgImageEl && data.photo) {
        bgImageEl.style.backgroundImage = `url('${data.photo}')`;
        bgImageEl.classList.add('visible');
      }
    });

    path.addEventListener('mousemove', (e) => {
      updateCardViewportTop(e.clientY);
    });

    path.addEventListener('mouseleave', () => {
      // Keep card and highlight visible when mouse leaves the district
    });

    path.addEventListener('click', async () => {
      const svgName      = path.id || path.getAttribute('name');
      const officialName = DISTRICT_MAP[svgName];
      if (!officialName) return;

      paths.forEach(p => p.classList.remove('district-hover'));
      tooltip.classList.remove('visible');
      if (bgImageEl) bgImageEl.classList.remove('visible');

      try {
        const res  = await fetch(`/api/destinations/by-name/${encodeURIComponent(officialName)}`);
        const body = await res.json();

        if (body.success && body.data) {
          window.location.href = `destination-detail.html?id=${body.data._id}`;
        } else {
          window.location.href = `destination-detail.html?name=${encodeURIComponent(officialName)}`;
        }
      } catch (err) {
        console.error(err);
        window.location.href = `destination-detail.html?name=${encodeURIComponent(officialName)}`;
      }
    });
  });

  // Global listener for SVG map
  const mainSvg = document.querySelector('svg');
  if (mainSvg) {
    mainSvg.addEventListener('mouseleave', () => {
      // Keep card visible when mouse leaves SVG container
    });
  }

  // Populate Featured District Photo Showcase Grid at bottom of map.html
  const featuredGrid = document.getElementById('featuredDistrictsGrid');
  if (featuredGrid) {
    const districtsList = Object.keys(DISTRICT_DATA);
    featuredGrid.innerHTML = districtsList.map(distName => {
      const data = DISTRICT_DATA[distName];
      return `
        <div class="district-gallery-card" onclick="window.location.href='destination-detail.html?name=${encodeURIComponent(distName)}'">
          <img src="${data.photo}" alt="${esc(distName)}" loading="lazy" />
          <div class="district-gallery-overlay">
            <span class="district-gallery-province">${esc(data.province)}</span>
            <h3 class="district-gallery-title">${esc(distName)}</h3>
            <p class="district-gallery-desc">${esc(data.tagline)}</p>
            <div class="district-gallery-action">
              <span>Explore Spots</span>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  function esc(str) {
    return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
});
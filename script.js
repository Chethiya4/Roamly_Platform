document.addEventListener('DOMContentLoaded', () => {
  /* ---------------- ADMIN ACCESS GUARD & HEARTBEAT TRACKING ---------------- */
  initTrackingAndAuthGuard();
  function applyLanguage(lang) {
  const languageCode = String(lang || "EN")
    .trim()
    .toUpperCase();

  const selectedTranslations =
    window.translations?.[languageCode];

  if (!selectedTranslations) {
    console.log("Translation not found:", languageCode);
    return;
  }

  document.documentElement.lang =
    languageCode === "SI"
      ? "si"
      : languageCode === "TA"
        ? "ta"
        : "en";

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.dataset.i18n;

    if (selectedTranslations[key] !== undefined) {
      element.textContent = selectedTranslations[key];
    }
  });

  document
    .querySelectorAll("[data-i18n-placeholder]")
    .forEach((element) => {
      const key = element.dataset.i18nPlaceholder;

      if (selectedTranslations[key] !== undefined) {
        element.placeholder = selectedTranslations[key];
      }
    });

  const languageLabel = document.getElementById("langCode");

  if (languageLabel) {
    languageLabel.textContent = languageCode;
  }

  document
    .querySelectorAll("#langMenu button")
    .forEach((button) => {
      button.classList.toggle(
        "active",
        button.dataset.code === languageCode
      );
    });
}

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
  const wishlistBtns = document.querySelectorAll(
    '.icon-btn[aria-label="Wishlist"]'
  );

  const token = localStorage.getItem('roamly_token');

  let homeWishlistCount = 0;
  let databaseWishlistCount = 0;

  /* Home page localStorage wishlist */
  try {
    const homeWishlist = JSON.parse(
      localStorage.getItem('roamly_home_wishlist') || '[]'
    );

    if (Array.isArray(homeWishlist)) {
      homeWishlistCount = homeWishlist.length;
    }
  } catch (error) {
    console.error('Unable to read home wishlist:', error);
  }

  /* Database wishlist */
  if (token) {
    try {
      const res = await fetch('/api/wishlist/mine', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const body = await res.json();

      if (body.success && Array.isArray(body.data)) {
        databaseWishlistCount = body.data.length;
      }
    } catch (error) {
      console.error('Unable to load database wishlist:', error);
    }
  }

  
  const totalCount = homeWishlistCount;

  document
    .querySelectorAll(
      '.icon-btn[aria-label="Wishlist"] .badge'
    )
    .forEach((badge) => {
      badge.textContent = totalCount;
    });

  wishlistBtns.forEach((btn) => {
    if (btn.dataset.wishlistListenerAdded === 'true') {
      return;
    }

    btn.dataset.wishlistListenerAdded = 'true';

    btn.addEventListener('click', (event) => {
      event.preventDefault();

      window.location.href = 'wishlist.html';
    });
  });
}
  window.refreshWishlistBadge = initWishlistHeader;

  /* ---------------- GOOGLE TRANSLATE INTEGRATION ---------------- */
  const LANG_MAPPING = {
    'EN': 'en',
    'SI': 'si',
    'TA': 'ta',
    'ZH': 'zh-CN',
    'DE': 'de',
    'FR': 'fr',
    'ES': 'es',
    'RU': 'ru',
    'JA': 'ja',
    'KO': 'ko',
    'AR': 'ar',
    'HI': 'hi'
  };

  function setTranslateCookie(targetLang) {
    const domain = window.location.hostname;
    document.cookie = `googtrans=/en/${targetLang}; path=/; domain=${domain}`;
    document.cookie = `googtrans=/en/${targetLang}; path=/;`;
  }

  function applyGoogleTranslate(code) {
    const targetLang = LANG_MAPPING[code] || code.toLowerCase();
    setTranslateCookie(targetLang);

    const combo = document.querySelector('.goog-te-combo');
    if (combo) {
      combo.value = targetLang;
      combo.dispatchEvent(new Event('change'));
    } else {
      let retries = 0;
      const interval = setInterval(() => {
        retries++;
        const c = document.querySelector('.goog-te-combo');
        if (c) {
          c.value = targetLang;
          c.dispatchEvent(new Event('change'));
          clearInterval(interval);
        } else if (retries > 10) {
          clearInterval(interval);
          window.location.reload();
        }
      }, 300);
    }
  }

  function initGoogleTranslateScript() {
    if (!document.getElementById('google_translate_element')) {
      const gDiv = document.createElement('div');
      gDiv.id = 'google_translate_element';
      gDiv.style.display = 'none';
      document.body.appendChild(gDiv);
    }

    window.googleTranslateElementInit = function() {
      new google.translate.TranslateElement({
        pageLanguage: 'en',
        includedLanguages: 'en,si,ta,zh-CN,de,fr,es,ru,ja,ko,it,ar,hi',
        layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
        autoDisplay: false,
        multilanguagePage: true
      }, 'google_translate_element');
    };

    if (!document.getElementById('google-translate-js')) {
      const script = document.createElement('script');
      script.id = 'google-translate-js';
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.head.appendChild(script);
    }
  }

  function suppressGoogleTranslateBanner() {
    if (document.documentElement) {
      document.documentElement.style.setProperty('top', '0px', 'important');
      document.documentElement.style.setProperty('position', 'static', 'important');
      document.documentElement.style.setProperty('margin-top', '0px', 'important');
      document.documentElement.style.setProperty('padding-top', '0px', 'important');
    }
    if (document.body) {
      document.body.style.setProperty('top', '0px', 'important');
      document.body.style.setProperty('position', 'static', 'important');
      document.body.style.setProperty('margin-top', '0px', 'important');
      document.body.style.setProperty('padding-top', '0px', 'important');
    }

    const elements = document.querySelectorAll('iframe, .goog-te-banner-frame, .goog-te-banner, .VIpgJd-yD54df-SkJuBc-i5tdBd, .VIpgJd-ZGain-SCstLd, #goog-gt-tt, .goog-te-balloon-frame, .goog-tooltip');
    elements.forEach(el => {
      if (!el.classList.contains('goog-te-combo') && !el.querySelector('.goog-te-combo') && el.id !== 'google_translate_element') {
        el.style.setProperty('display', 'none', 'important');
        el.style.setProperty('visibility', 'hidden', 'important');
        el.style.setProperty('height', '0px', 'important');
        el.style.setProperty('width', '0px', 'important');
        el.style.setProperty('opacity', '0', 'important');
        el.style.setProperty('position', 'absolute', 'important');
        el.style.setProperty('top', '-9999px', 'important');
        el.style.setProperty('left', '-9999px', 'important');
        el.style.setProperty('z-index', '-99999', 'important');
      }
    });
  }

  const translateObserver = new MutationObserver(() => {
    suppressGoogleTranslateBanner();
  });
  
  if (document.body) {
    translateObserver.observe(document.body, { childList: true, subtree: true, attributes: true });
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      if (document.body) translateObserver.observe(document.body, { childList: true, subtree: true, attributes: true });
    });
  }

  setInterval(suppressGoogleTranslateBanner, 100);

  initGoogleTranslateScript();

  const langTrigger = document.getElementById('langTrigger');
  const langMenu = document.getElementById('langMenu');
  const langCode = document.getElementById('langCode');

  const savedLang = localStorage.getItem('roamly_lang') || localStorage.getItem('selectedLanguage') || 'EN';
  if (langCode) langCode.textContent = savedLang;
  applyLanguage(savedLang);

  if (savedLang !== 'EN') {
    const targetLang = LANG_MAPPING[savedLang] || savedLang.toLowerCase();
    setTranslateCookie(targetLang);
  }

  if (langTrigger && langMenu && langCode) {
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
        localStorage.setItem('selectedLanguage', code);
        langMenu.hidden = true;
        langTrigger.setAttribute('aria-expanded', 'false');
        
        applyLanguage(code);
        applyGoogleTranslate(code);
      });
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.lang-select')) {
        langMenu.hidden = true;
        langTrigger.setAttribute('aria-expanded', 'false');
      }
    });
  }
  const savedLanguage =
  localStorage.getItem("selectedLanguage") || "EN";

applyLanguage(savedLanguage);

  /* ---------------- CURRENCY SELECTOR INTEGRATION ---------------- */
  window.formatPriceFromUSD = function(usdAmount, targetCurrency) {
    const code = targetCurrency || localStorage.getItem('roamly_currency') || 'LKR';
    const val = parseFloat(usdAmount);
    if (isNaN(val)) return usdAmount;
    if (code === 'LKR') {
      return `LKR ${Math.round(val * 300).toLocaleString()}`;
    } else if (code === 'EUR') {
      return `€${Math.round(val * 0.92).toLocaleString()}`;
    } else {
      return `$${Math.round(val).toLocaleString()}`;
    }
  };

  window.formatPriceFromLKR = function(lkrAmount, targetCurrency) {
    const code = targetCurrency || localStorage.getItem('roamly_currency') || 'LKR';
    const val = parseFloat(lkrAmount);
    if (isNaN(val)) return lkrAmount;
    if (code === 'USD') {
      return `$${Math.round(val / 300).toLocaleString()}`;
    } else if (code === 'EUR') {
      return `€${Math.round(val / 325).toLocaleString()}`;
    } else {
      return `LKR ${Math.round(val).toLocaleString()}`;
    }
  };

  function updateCurrencyUI(currency) {
    const code = currency || localStorage.getItem('roamly_currency') || 'LKR';
    
    document.querySelectorAll('.currency-select button, #currencySelect button').forEach((btn) => {
      const bCode = btn.dataset.currency || btn.textContent.trim();
      btn.classList.toggle('active', bCode === code);
    });

    document.querySelectorAll('[data-price-usd]').forEach(el => {
      const usdVal = parseFloat(el.dataset.priceUsd);
      if (!isNaN(usdVal)) {
        const textNode = el.childNodes[0];
        if (textNode && textNode.nodeType === Node.TEXT_NODE) {
          textNode.nodeValue = window.formatPriceFromUSD(usdVal, code);
        } else {
          el.textContent = window.formatPriceFromUSD(usdVal, code);
        }
      }
    });

    document.querySelectorAll('[data-price-lkr]').forEach(el => {
      const lkrVal = parseFloat(el.dataset.priceLkr);
      if (!isNaN(lkrVal)) {
        const textNode = el.childNodes[0];
        if (textNode && textNode.nodeType === Node.TEXT_NODE) {
          textNode.nodeValue = window.formatPriceFromLKR(lkrVal, code);
        } else {
          el.textContent = window.formatPriceFromLKR(lkrVal, code);
        }
      }
    });

    window.dispatchEvent(new CustomEvent('currencyChange', { detail: { currency: code } }));
  }

  document.querySelectorAll('.currency-select button, #currencySelect button').forEach((btn) => {
    btn.addEventListener('click', () => {
      const code = btn.dataset.currency || btn.textContent.trim();
      localStorage.setItem('roamly_currency', code);
      updateCurrencyUI(code);
    });
  });

  const savedCurrency = localStorage.getItem('roamly_currency') || 'LKR';
  updateCurrencyUI(savedCurrency);

 /* ---------------- DARK MODE TOGGLE ---------------- */
const darkModeToggle = document.getElementById('darkModeToggle');

/* Restore saved theme when a page loads */
const savedTheme = localStorage.getItem('roamly_theme');

if (savedTheme === 'dark') {
  document.body.classList.add('dark-mode');
} else {
  document.body.classList.remove('dark-mode');
}

/* Toggle and save theme */
if (darkModeToggle) {
  darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');

    const isDarkMode =
      document.body.classList.contains('dark-mode');

    localStorage.setItem(
      'roamly_theme',
      isDarkMode ? 'dark' : 'light'
    );
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
  const MAP_TEXT = {
  EN: {
    district: "District",
    exploreSpots: "Explore Spots"
  },
  

  SI: {
    district: "දිස්ත්‍රික්කය",
    exploreSpots: "ස්ථාන ගවේෂණය කරන්න"
  },

  TA: {
    district: "மாவட்டம்",
    exploreSpots: "இடங்களை ஆராயுங்கள்"
  }
};
const DISTRICT_DATA = {
  "Trincomalee": {
    province: {
      EN: "Eastern Province",
      SI: "නැගෙනහිර පළාත",
      TA: "கிழக்கு மாகாணம்"
    },
    tagline: {
      EN: "Natural deep-water harbor, Koneswaram Temple, & Pigeon Island snorkeling.",
      SI: "ස්වාභාවික ගැඹුරු වරාය, කෝණේශ්වරම් දේවාලය සහ පරවි දූපතේ ස්නෝකලින් අත්දැකීම්.",
      TA: "இயற்கை ஆழ்கடல் துறைமுகம், கோணேஸ்வரம் கோவில் மற்றும் புறா தீவில் ஸ்னோர்க்லிங் அனுபவங்கள்."
    },
    photo: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800"
  },

  "Mullaitivu": {
    province: {
      EN: "Northern Province",
      SI: "උතුරු පළාත",
      TA: "வடக்கு மாகாணம்"
    },
    tagline: {
      EN: "Pristine eastern beaches, scenic lagoons, & tranquil coastal shores.",
      SI: "පිරිසිදු නැගෙනහිර වෙරළ, සුන්දර කලපු සහ නිස්කලංක මුහුදු තීර.",
      TA: "அழகிய கிழக்கு கடற்கரைகள், இயற்கை நிறைந்த களப்புகள் மற்றும் அமைதியான கடலோரப் பகுதிகள்."
    },
    photo: "https://images.unsplash.com/photo-1620619767323-b95a89183081?q=80&w=800"
  },

  "Jaffna": {
    province: {
      EN: "Northern Province",
      SI: "උතුරු පළාත",
      TA: "வடக்கு மாகாணம்"
    },
    tagline: {
      EN: "Historic Jaffna Fort, Nallur Kovil, unique culture, & northern islands.",
      SI: "ඓතිහාසික යාපනය කොටුව, නල්ලූර් කෝවිල, සුවිශේෂී සංස්කෘතිය සහ උතුරු දූපත්.",
      TA: "வரலாற்றுச் சிறப்புமிக்க யாழ்ப்பாணக் கோட்டை, நல்லூர் கோவில், தனித்துவமான கலாசாரம் மற்றும் வடக்கு தீவுகள்."
    },
    photo: "https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=800"
  },

  "Kilinochchi": {
    province: {
      EN: "Northern Province",
      SI: "උතුරු පළාත",
      TA: "வடக்கு மாகாணம்"
    },
    tagline: {
      EN: "Iranamadu Reservoir, agricultural heritage, and serene northern landscapes.",
      SI: "ඉරණමඩු ජලාශය, කෘෂිකාර්මික උරුමය සහ නිස්කලංක උතුරු භූ දර්ශන.",
      TA: "இரணைமடு நீர்த்தேக்கம், விவசாய பாரம்பரியம் மற்றும் அமைதியான வடக்கு நிலப்பரப்புகள்."
    },
    photo: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=800"
  },

  "Mannar": {
    province: {
      EN: "Northern Province",
      SI: "උතුරු පළාත",
      TA: "வடக்கு மாகாணம்"
    },
    tagline: {
      EN: "Ancient Baobab trees, Adam's Bridge, & flamingo birdwatching sanctuaries.",
      SI: "පැරණි බයෝබැබ් ගස්, ආදම්ගේ පාලම සහ ෆ්ලෙමින්ගෝ පක්ෂීන් නැරඹිය හැකි ස්ථාන.",
      TA: "பழமையான பாவோபாப் மரங்கள், ஆதாம் பாலம் மற்றும் ஃபிளமிங்கோ பறவைகளை காணும் சரணாலயங்கள்."
    },
    photo: "https://images.unsplash.com/photo-1616422285623-13ff0162193c?q=80&w=800"
  },

  "Puttalam": {
    province: {
      EN: "North Western Province",
      SI: "වයඹ පළාත",
      TA: "வடமேற்கு மாகாணம்"
    },
    tagline: {
      EN: "Wilpattu National Park safari, Kalpitiya dolphin watching, & salt pans.",
      SI: "විල්පත්තු ජාතික වනෝද්‍යානයේ සෆාරි, කල්පිටිය ඩොල්ෆින් නැරඹීම සහ ලුණු ලේවායන්.",
      TA: "வில்பத்து தேசிய பூங்கா சஃபாரி, கல்பிட்டியாவில் டால்பின் பார்வை மற்றும் உப்பு வயல்கள்."
    },
    photo: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800"
  },

  "Gampaha": {
    province: {
      EN: "Western Province",
      SI: "බස්නාහිර පළාත",
      TA: "மேல் மாகாணம்"
    },
    tagline: {
      EN: "Henarathgoda Botanical Garden, coastal resorts, & vibrant local markets.",
      SI: "හෙනරත්ගොඩ උද්භිද උද්‍යානය, වෙරළ නිවාඩු නිකේතන සහ සජීවී දේශීය වෙළඳපොළ.",
      TA: "ஹெனரத்கொட தாவரவியல் பூங்கா, கடற்கரை விடுதிகள் மற்றும் உற்சாகமான உள்ளூர் சந்தைகள்."
    },
    photo: "https://images.unsplash.com/photo-1590001155093-a3c66ab0c3ff?q=80&w=800"
  },

  "Colombo": {
    province: {
      EN: "Western Province",
      SI: "බස්නාහිර පළාත",
      TA: "மேல் மாகாணம்"
    },
    tagline: {
      EN: "Vibrant coastal capital, Lotus Tower, Gangaramaya & oceanfront dining.",
      SI: "නෙළුම් කුළුණ, ගංගාරාමය සහ මුහුදුබඩ අවන්හල්වලින් සමන්විත සජීවී අගනුවර.",
      TA: "தாமரை கோபுரம், கங்காராமய மற்றும் கடற்கரை உணவகங்களைக் கொண்ட பரபரப்பான தலைநகரம்."
    },
    photo: "images/colombo.jpg"
  },

  "Kalutara": {
    province: {
      EN: "Western Province",
      SI: "බස්නාහිර පළාත",
      TA: "மேல் மாகாணம்"
    },
    tagline: {
      EN: "Kalutara Bodhiya stupa, river safaris, & golden palm beach resorts.",
      SI: "කළුතර බෝධිය, ගංගා සෆාරි සහ රන්වන් වෙරළ නිවාඩු නිකේතන.",
      TA: "களுத்துறை போதியா, நதி சஃபாரி மற்றும் தங்க நிற கடற்கரை விடுதிகள்."
    },
    photo: "https://images.unsplash.com/photo-1605538032432-a9f0c8d9baac?q=80&w=800"
  },

  "Galle": {
    province: {
      EN: "Southern Province",
      SI: "දකුණු පළාත",
      TA: "தென் மாகாணம்"
    },
    tagline: {
      EN: "UNESCO World Heritage Galle Fort, Dutch lighthouse, & coral surf beaches.",
      SI: "යුනෙස්කෝ ලෝක උරුම ගාලු කොටුව, ලන්දේසි ප්‍රදීපාගාරය සහ කොරල් වෙරළ.",
      TA: "யுனெஸ்கோ உலக பாரம்பரிய காலி கோட்டை, டச்சு கலங்கரை விளக்கம் மற்றும் பவளக் கடற்கரைகள்."
    },
    photo: "images/gallfort1.jpg"
  },

  "Matara": {
    province: {
      EN: "Southern Province",
      SI: "දකුණු පළාත",
      TA: "தென் மாகாணம்"
    },
    tagline: {
      EN: "Mirissa whale watching, Dondra Head Lighthouse, & Secret Beach.",
      SI: "මිරිස්ස තල්මසුන් නැරඹීම, දෙවුන්දර තුඩුව ප්‍රදීපාගාරය සහ රහස් වෙරළ.",
      TA: "மிரிஸ்ஸாவில் திமிங்கலப் பார்வை, தெவுந்தர கலங்கரை விளக்கம் மற்றும் இரகசிய கடற்கரை."
    },
    photo: "images/mirissa1.jpg"
  },

  "Hambantota": {
    province: {
      EN: "Southern Province",
      SI: "දකුණු පළාත",
      TA: "தென் மாகாணம்"
    },
    tagline: {
      EN: "Yala National Park leopard safaris, Ridiyagama, & coastal salt lagoons.",
      SI: "යාල ජාතික වනෝද්‍යානයේ දිවියන් සෆාරි, රිදියගම සහ මුහුදුබඩ ලුණු කලපු.",
      TA: "யால தேசிய பூங்காவில் சிறுத்தை சஃபாரி, ரிடியகம மற்றும் கடலோர உப்பு களப்புகள்."
    },
    photo: "images/yala1.jpg"
  },

  "Ampara": {
    province: {
      EN: "Eastern Province",
      SI: "නැගෙනහිර පළාත",
      TA: "கிழக்கு மாகாணம்"
    },
    tagline: {
      EN: "World-famous Arugam Bay surfing, Senanayake Samudraya, & wildlife parks.",
      SI: "ලෝකප්‍රසිද්ධ ආරුගම්බේ රළ පැදීම, සේනානායක සමුද්‍රය සහ වනජීවී උද්‍යාන.",
      TA: "உலகப் புகழ்பெற்ற அறுகம்பே அலைச்சறுக்கு, சேனாநாயக்க சமுத்திரம் மற்றும் வனவிலங்கு பூங்காக்கள்."
    },
    photo: "images/arugambay1.jpg"
  },

  "Batticaloa": {
    province: {
      EN: "Eastern Province",
      SI: "නැගෙනහිර පළාත",
      TA: "கிழக்கு மாகாணம்"
    },
    tagline: {
      EN: "Famous singing fish lagoon, Dutch Fort, & Pasikuda coral bay.",
      SI: "ප්‍රසිද්ධ ගායනා කරන මසුන්ගේ කලපුව, ලන්දේසි කොටුව සහ පාසිකුඩා කොරල් බොක්ක.",
      TA: "புகழ்பெற்ற பாடும் மீன் களப்பு, டச்சு கோட்டை மற்றும் பாசிக்குடா பவள வளைகுடா."
    },
    photo: "https://images.unsplash.com/photo-1506929562872-bb421503ef21?q=80&w=800"
  },

  "Ratnapura": {
    province: {
      EN: "Sabaragamuwa Province",
      SI: "සබරගමුව පළාත",
      TA: "சபரகமுவ மாகாணம்"
    },
    tagline: {
      EN: "City of Gems — Adam's Peak pilgrimage, Sinharaja & sapphire mines.",
      SI: "මැණික් නගරය — ශ්‍රී පාද වන්දනාව, සිංහරාජ වනාන්තරය සහ නිල් මැණික් පතල්.",
      TA: "இரத்தின நகரம் — சிவனொளிபாதமலை யாத்திரை, சிங்கராஜ வனம் மற்றும் நீலக்கல் சுரங்கங்கள்."
    },
    photo: "images/adamspeak1.jpg"
  },

  "Monaragala": {
    province: {
      EN: "Uva Province",
      SI: "ඌව පළාත",
      TA: "ஊவா மாகாணம்"
    },
    tagline: {
      EN: "Gal Oya National Park, Buduruwagala ancient rock carvings, & wilderness.",
      SI: "ගල්ඔය ජාතික වනෝද්‍යානය, බුදුරුවගල පුරාණ ගල් කැටයම් සහ වනගත සුන්දරත්වය.",
      TA: "கல் ஓயா தேசிய பூங்கா, புதுருவகல பழமையான பாறைச் சிற்பங்கள் மற்றும் வனப்பகுதிகள்."
    },
    photo: "https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=800"
  },

  "Kegalle": {
    province: {
      EN: "Sabaragamuwa Province",
      SI: "සබරගමුව පළාත",
      TA: "சபரகமுவ மாகாணம்"
    },
    tagline: {
      EN: "Pinnawala Elephant Orphanage, rubber groves, & lush hill cascades.",
      SI: "පින්නවල අලි අනාථාගාරය, රබර් වතු සහ හරිත කඳුකර දියඇලි.",
      TA: "பின்னவல யானைகள் சரணாலயம், இறப்பர் தோட்டங்கள் மற்றும் பசுமையான மலை அருவிகள்."
    },
    photo: "https://images.unsplash.com/photo-1581888227599-779811939961?q=80&w=800"
  },

  "Badulla": {
    province: {
      EN: "Uva Province",
      SI: "ඌව පළාත",
      TA: "ஊவா மாகாணம்"
    },
    tagline: {
      EN: "Ella Gap, Nine Arch Bridge, tea plantations, & Dunhinda Falls.",
      SI: "ඇල්ල කපොල්ල, ආරුක්කු නවයේ පාලම, තේ වතු සහ දුන්හිඳ දියඇල්ල.",
      TA: "எல்ல இடைவெளி, ஒன்பது வளைவு பாலம், தேயிலைத் தோட்டங்கள் மற்றும் துன்ஹிந்த நீர்வீழ்ச்சி."
    },
    photo: "images/ella1.jpg"
  },

  "Matale": {
    province: {
      EN: "Central Province",
      SI: "මධ්‍යම පළාත",
      TA: "மத்திய மாகாணம்"
    },
    tagline: {
      EN: "Majestic Sigiriya Rock Fortress, Pidurangala, & spice gardens.",
      SI: "විශිෂ්ට සීගිරිය ගල් බලකොටුව, පිදුරංගල සහ කුළුබඩු උද්‍යාන.",
      TA: "மகத்தான சிகிரியா பாறைக் கோட்டை, பிதுரங்கல மற்றும் மசாலா தோட்டங்கள்."
    },
    photo: "images/Sigiriya1.jpg"
  },

  "Polonnaruwa": {
    province: {
      EN: "North Central Province",
      SI: "උතුරු මැද පළාත",
      TA: "வடமத்திய மாகாணம்"
    },
    tagline: {
      EN: "Ancient royal kingdom, Gal Viharaya rock statues, & Parakrama Samudra.",
      SI: "පුරාණ රාජධානිය, ගල් විහාරයේ ගල් පිළිම සහ පරාක්‍රම සමුද්‍රය.",
      TA: "பழமையான அரச இராச்சியம், கல் விஹாரை பாறைச் சிலைகள் மற்றும் பராக்கிரம சமுத்திரம்."
    },
    photo: "https://images.unsplash.com/photo-1596402184320-417e7178b2cd?q=80&w=800"
  },

  "Kurunegala": {
    province: {
      EN: "North Western Province",
      SI: "වයඹ පළාත",
      TA: "வடமேற்கு மாகாணம்"
    },
    tagline: {
      EN: "Royal rock citadel, giant Ethagala Buddha statue, & coconut groves.",
      SI: "රාජකීය ගල් බලකොටුව, ඇතුගල දැවැන්ත බුද්ධ ප්‍රතිමාව සහ පොල් වතු.",
      TA: "அரச பாறைக் கோட்டை, எத்தகல பிரம்மாண்ட புத்தர் சிலை மற்றும் தென்னைத் தோட்டங்கள்."
    },
    photo: "https://images.unsplash.com/photo-1542856391-010fb87dcfed?q=80&w=800"
  },

  "Anuradhapura": {
    province: {
      EN: "North Central Province",
      SI: "උතුරු මැද පළාත",
      TA: "வடமத்திய மாகாணம்"
    },
    tagline: {
      EN: "UNESCO ancient sacred city, Jaya Sri Maha Bodhi, & grand stupas.",
      SI: "යුනෙස්කෝ පුරාණ පූජනීය නගරය, ජය ශ්‍රී මහා බෝධිය සහ විශාල ස්තූප.",
      TA: "யுனெஸ்கோ பழமையான புனித நகரம், ஜய ஸ்ரீ மகா போதி மற்றும் பிரம்மாண்ட தாதுகோபுரங்கள்."
    },
    photo: "https://images.unsplash.com/photo-1596402184320-417e7178b2cd?q=80&w=800"
  },

  "Nuwara Eliya": {
    province: {
      EN: "Central Province",
      SI: "මධ්‍යම පළාත",
      TA: "மத்திய மாகாணம்"
    },
    tagline: {
      EN: "Little England — rolling tea estates, waterfalls, & chilly Gregory Lake.",
      SI: "කුඩා එංගලන්තය — කඳුකර තේ වතු, දියඇලි සහ සිසිල් ග්‍රෙගරි වැව.",
      TA: "குட்டி இங்கிலாந்து — பரந்த தேயிலைத் தோட்டங்கள், நீர்வீழ்ச்சிகள் மற்றும் குளிரான கிரெகரி ஏரி."
    },
    photo: "images/nuwaraeliya1.jpg"
  },

  "Vavuniya": {
    province: {
      EN: "Northern Province",
      SI: "උතුරු පළාත",
      TA: "வடக்கு மாகாணம்"
    },
    tagline: {
      EN: "Ancient reservoirs, cultural crossroad, & historic northern monuments.",
      SI: "පුරාණ ජලාශ, සංස්කෘතික සන්ධිස්ථානය සහ ඓතිහාසික උතුරු ස්මාරක.",
      TA: "பழமையான நீர்த்தேக்கங்கள், கலாசார சந்திப்பு மற்றும் வரலாற்றுச் சிறப்புமிக்க வடக்கு நினைவுச்சின்னங்கள்."
    },
    photo: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=800"
  },

  "Kandy": {
    province: {
      EN: "Central Province",
      SI: "මධ්‍යම පළාත",
      TA: "மத்திய மாகாணம்"
    },
    tagline: {
      EN: "Sacred Temple of the Tooth Relic, Kandy Lake, & Royal Botanical Gardens.",
      SI: "පූජනීය ශ්‍රී දළදා මාලිගාව, මහනුවර වැව සහ රාජකීය උද්භිද උද්‍යානය.",
      TA: "புனித தலதா மாளிகை, கண்டி ஏரி மற்றும் அரச தாவரவியல் பூங்கா."
    },
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

      const currentLanguage =
  localStorage.getItem("selectedLanguage") || "EN";

const mapText =
  MAP_TEXT[currentLanguage] || MAP_TEXT.EN;

      const data = DISTRICT_DATA[officialName] || {
        province: 'Sri Lanka',
        tagline: `Explore top attractions and landmarks in ${officialName}.`,
        photo: 'images/colombo.jpg'
      };
      const province =
  typeof data.province === "string"
    ? data.province
    : (data.province[currentLanguage] || data.province.EN);

const tagline =
  typeof data.tagline === "string"
    ? data.tagline
    : (data.tagline[currentLanguage] || data.tagline.EN);

    const translatedDistrictName =
  mapText.districtNames?.[officialName] || officialName;

      updateCardViewportTop(e.clientY);

      // Populate right-aligned destination card template
      tooltip.innerHTML = `
  <div
    class="district-popup-card"
    style="cursor: pointer;"
    onclick="window.location.href='destination-detail.html?name=${encodeURIComponent(officialName)}'"
  >
    <div class="popup-card-media">
      <img
        src="${data.photo}"
        alt="${translatedDistrictName}"
        loading="lazy"
      />
      <span class="popup-card-badge">${province}</span>
    </div>

    <div class="popup-card-body">
      <div class="popup-card-header">
        <h4 class="popup-card-title">${translatedDistrictName}</h4>
        <span class="popup-card-sub">${mapText.district}</span>
      </div>

      <p class="popup-card-desc">${tagline}</p>

      <div class="popup-card-footer">
        <span class="popup-card-action">
          <span>${mapText.exploreSpots}</span>

          <svg
            viewBox="0 0 24 24"
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
          >
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

function renderFeaturedDistricts(language) {
  if (!featuredGrid) return;

  const currentLanguage =
    String(language || localStorage.getItem("selectedLanguage") || "EN")
      .toUpperCase();

  const mapText = MAP_TEXT[currentLanguage] || MAP_TEXT.EN;
  const districtsList = Object.keys(DISTRICT_DATA);

  featuredGrid.innerHTML = districtsList.map((distName) => {
    const data = DISTRICT_DATA[distName];

    const translatedDistrictName =
      mapText.districtNames?.[distName] || distName;

    const translatedProvince =
      typeof data.province === "string"
        ? data.province
        : (data.province[currentLanguage] || data.province.EN);

    const translatedTagline =
      typeof data.tagline === "string"
        ? data.tagline
        : (data.tagline[currentLanguage] || data.tagline.EN);

    return `
      <div
        class="district-gallery-card"
        onclick="window.location.href='destination-detail.html?name=${encodeURIComponent(distName)}'"
      >
        <img
          src="${data.photo}"
          alt="${esc(translatedDistrictName)}"
          loading="lazy"
        />

        <div class="district-gallery-overlay">
          <span class="district-gallery-province">
            ${esc(translatedProvince)}
          </span>

          <h3 class="district-gallery-title">
            ${esc(translatedDistrictName)}
          </h3>

          <p class="district-gallery-desc">
            ${esc(translatedTagline)}
          </p>

          <div class="district-gallery-action">
            <span>${esc(mapText.exploreSpots)}</span>

            <svg
              viewBox="0 0 24 24"
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
            >
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

renderFeaturedDistricts();

 
  function esc(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
});


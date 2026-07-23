document.addEventListener('DOMContentLoaded', () => {
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
        nameLink.style.color = 'var(--ink)';
        nameLink.style.textDecoration = 'none';
        
        // Log out button
        const logoutBtn = document.createElement('button');
        logoutBtn.textContent = 'Log Out';
        logoutBtn.className = 'btn-secondary'; // Assuming btn-secondary exists or just basic styling
        logoutBtn.style.padding = '6px 12px';
        logoutBtn.style.fontSize = '0.8rem';
        logoutBtn.style.border = '1px solid var(--line)';
        logoutBtn.style.borderRadius = 'var(--radius-sm)';
        logoutBtn.style.background = 'transparent';
        logoutBtn.style.cursor = 'pointer';
        
        logoutBtn.addEventListener('click', () => {
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


  /* ---------------- LANGUAGE & CURRENCY ---------------- */
  const langTrigger = document.getElementById('langTrigger');
  const langMenu = document.getElementById('langMenu');
  const langCode = document.getElementById('langCode');

  if (langTrigger && langMenu && langCode) {
    langTrigger.addEventListener('click', () => {
      const isOpen = !langMenu.hidden;
      langMenu.hidden = isOpen;
      langTrigger.setAttribute('aria-expanded', String(!isOpen));
    });

    langMenu.querySelectorAll('button').forEach((btn) => {
      btn.addEventListener('click', () => {
        langMenu.querySelectorAll('button').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        langCode.textContent = btn.dataset.code;
        langMenu.hidden = true;
        langTrigger.setAttribute('aria-expanded', 'false');
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
/* The Highcharts block has been removed — #srilanka-map never existed on the  */
/* page. This block wires the real SVG paths to the existing #districtModal.   */
document.addEventListener('DOMContentLoaded', () => {
  /* SVG label → official DB name mapping (hardcoded as per spec) */
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

  /* ── Close handler ── */
  window.closeDistrictModal = () => {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  };
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) window.closeDistrictModal();
  });

  /* ── Style SVG paths for interactivity ── */
  const paths = document.querySelectorAll('svg path.district');
  paths.forEach(path => {
    path.style.cursor = 'pointer';
    path.style.transition = 'fill 0.2s ease';
    path.addEventListener('mouseenter', () => { path.style.fill = '#D7263D'; });
    path.addEventListener('mouseleave', () => { path.style.fill = ''; });

    path.addEventListener('click', async () => {
      const svgName      = path.getAttribute('name') || path.id;
      const officialName = DISTRICT_MAP[svgName];
      if (!officialName) return;

      nameEl.textContent = officialName;
      listEl.innerHTML   = '<p style="color:var(--ink-faint);text-align:center;padding:20px">Loading…</p>';
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';

      try {
        const res  = await fetch(`/api/destinations/by-name/${encodeURIComponent(officialName)}`);
        const body = await res.json();

        if (!body.success || !body.data) {
          listEl.innerHTML = '<p style="color:var(--ink-faint);text-align:center;padding:20px">Destination not found.</p>';
          return;
        }

        const dest = body.data;

        /* Destination description */
        let html = '';
        if (dest.description) {
          html += `<p style="color:var(--ink-soft);font-size:1rem;line-height:1.6;margin-bottom:20px">${esc(dest.description)}</p>`;
        }

        /* Approved tourist spots (populated via virtual from backend) */
        const spots = Array.isArray(dest.touristSpots) ? dest.touristSpots.filter(s => s.status === 'approved') : [];
        if (spots.length) {
          html += `<h4 style="font-family:var(--font-display);font-size:1.1rem;margin-bottom:14px;color:var(--ink)">Tourist Spots (${spots.length})</h4>`;
          spots.forEach(s => {
            const stars = '★'.repeat(Math.round(s.averageRating || 0)) + '☆'.repeat(5 - Math.round(s.averageRating || 0));
            html += `
              <div class="dest-card" onclick="window.location.href='destination-detail.html?id=${esc(dest._id)}'">
                <h4>${esc(s.name)} <span class="rating-badge">${stars}</span></h4>
                <p>${esc(s.category)} ${s.description ? '· ' + esc(s.description.slice(0, 100)) + (s.description.length > 100 ? '…' : '') : ''}</p>
              </div>`;
          });
        } else {
          html += '<p style="color:var(--ink-faint);text-align:center;padding:16px 0">No approved tourist spots yet for this district.</p>';
        }

        html += `<a href="destination-detail.html?id=${esc(dest._id)}" class="btn-primary" style="margin-top:16px;display:block;text-align:center">View Full Destination →</a>`;
        listEl.innerHTML = html;
      } catch {
        listEl.innerHTML = '<p style="color:var(--red);text-align:center;padding:20px">Failed to load destination data.</p>';
      }
    });
  });

  function esc(str) {
    return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
});
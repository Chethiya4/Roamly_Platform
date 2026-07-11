document.addEventListener('DOMContentLoaded', () => {
  /* ---------------- LANGUAGE DROPDOWN ----------------
     Opens/closes the menu and highlights the chosen option.
     No translation logic yet — that comes in a later step. */
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

  /* ---------------- CURRENCY SELECTOR ----------------
     Highlights the chosen currency only — no conversion logic yet. */
  const currencySelect = document.getElementById('currencySelect');
  if (currencySelect) {
    currencySelect.querySelectorAll('button').forEach((btn) => {
      btn.addEventListener('click', () => {
        currencySelect.querySelectorAll('button').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
  }

  /* ---------------- DARK MODE TOGGLE ---------------- 
     Adds dark mode behavior to the layout. */
  const darkModeToggle = document.getElementById('darkModeToggle');
  if (darkModeToggle) {
    darkModeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
    });
  }

  /* Sign In, Wishlist, and the hero buttons are
     intentionally left without behavior for now. */
});
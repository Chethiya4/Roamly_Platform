document.addEventListener('DOMContentLoaded', () => {
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
    modalTitle.textContent = title;
    modalDesc.textContent = desc;
    currentSlideIndex = 0;
    
    // Automatically inject unique, high-quality images based on the location name!
    slideElements.forEach((img, i) => {
      const cleanTitle = title.replace(/\s+/g, '').toLowerCase();
      // Using Picsum API to fetch a random image for this specific location + slide index
      img.src = `https://picsum.photos/seed/${cleanTitle}${i}/800/500`;
    });

    updateSlides();
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Stop background from scrolling
  };

  window.closeModal = () => {
    modal.classList.remove('active');
    document.body.style.overflow = '';
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

/* ========================================================
   MAP PAGE LOGIC (Only runs if the map container exists)
   ======================================================== */
document.addEventListener('DOMContentLoaded', () => {
  const mapContainer = document.getElementById('srilanka-map');
  
  if (mapContainer && typeof Highcharts !== 'undefined') {
    
    const destinationsDB = {
      "Colombo": [
        { name: "Galle Face Green", desc: "Urban ocean-side park stretching along the coast.", rating: "4.5" },
        { name: "Gangaramaya Temple", desc: "One of the most important and beautiful temples.", rating: "4.7" },
        { name: "National Museum", desc: "The largest museum in Sri Lanka.", rating: "4.6" }
      ],
      "Kandy": [
        { name: "Temple of the Tooth", desc: "Sacred Buddhist temple housing the relic of the tooth of Buddha.", rating: "4.9" },
        { name: "Royal Botanical Gardens", desc: "Stunning flora and massive trees in Peradeniya.", rating: "4.8" },
        { name: "Kandy Lake", desc: "Scenic artificial lake in the heart of the city.", rating: "4.5" }
      ],
      "Galle": [
        { name: "Galle Fort", desc: "Historical Portuguese fort and UNESCO World Heritage site.", rating: "4.8" },
        { name: "Unawatuna Beach", desc: "Famous sandy beach popular with tourists.", rating: "4.6" }
      ],
      "Matale": [
        { name: "Sigiriya", desc: "Ancient rock fortress and palace ruin.", rating: "4.9" },
        { name: "Dambulla Cave Temple", desc: "World heritage site with ancient Buddhist statues.", rating: "4.8" }
      ],
      "Badulla": [
        { name: "Ella Rock", desc: "Famous hiking destination with stunning valley views.", rating: "4.8" },
        { name: "Nine Arch Bridge", desc: "Iconic colonial-era railway bridge.", rating: "4.9" }
      ],
      "Nuwara Eliya": [
        { name: "Horton Plains", desc: "National park covered by montane grassland.", rating: "4.8" },
        { name: "Gregory Lake", desc: "A large scenic lake in the middle of town.", rating: "4.5" }
      ]
    };

    const mapColor = 'rgba(74, 91, 120, 0.15)';
    const borderColor = '#4A5B78';

    // Extract the map data automatically loaded by the HTML script tag
    const mapData = Highcharts.maps['countries/lk/lk-all'];

    if (!mapData) {
      mapContainer.innerHTML = "<p style='text-align:center; padding: 100px; color: var(--ink);'>Map data not found. Please ensure your internet connection is active.</p>";
      return;
    }

    try {
      // Initialize Main Map
      Highcharts.mapChart('srilanka-map', {
        chart: {
          backgroundColor: 'transparent'
        },
        title: { text: null },
        credits: { enabled: false },
        mapNavigation: {
          enabled: true,
          buttonOptions: { 
            verticalAlign: 'bottom',
            theme: { fill: '#FFFFFF', stroke: '#E0E0E0', style: { color: '#0A1B33' } } 
          }
        },
        tooltip: {
          headerFormat: '',
          pointFormat: '<b style="font-size:15px; color: #122A4D;">{point.name} District</b>',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderColor: 'rgba(10, 27, 51, 0.1)',
          borderRadius: 8,
          shadow: true
        },
        plotOptions: {
          series: {
            cursor: 'pointer',
            point: {
              events: {
                click: function () {
                  openDistrictModal(this.name, this['hc-key']);
                }
              }
            },
            states: {
              hover: { color: '#D7263D', borderColor: '#A81B2E' } 
            }
          }
        },
        series: [{
          mapData: mapData,
          name: 'Districts',
          color: mapColor,
          borderColor: borderColor,
          nullColor: mapColor,
          showInLegend: false,
          dataLabels: {
            enabled: true,
            format: '{point.name}',
            style: { fontWeight: '600', textOutline: '2px #FFFFFF', color: '#122A4D' }
          }
        }]
      });

      // Modal Logic
      const distModal = document.getElementById('districtModal');
      
      window.openDistrictModal = (name, hcKey) => {
        document.getElementById('modalDistrictName').textContent = name;
        const list = document.getElementById('destinationsList');
        list.innerHTML = '';
        
        const dests = destinationsDB[name] || [
          { name: "Explore " + name, desc: "Discover natural beauty, local cuisine, and hidden gems in this district.", rating: "4.5" }
        ];
        
        dests.forEach(d => {
          list.innerHTML += `
            <div class="dest-card">
              <h4>${d.name} <span class="rating-badge">⭐ ${d.rating}</span></h4>
              <p>${d.desc}</p>
            </div>
          `;
        });

        distModal.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Render Mini-Map shape
        setTimeout(() => {
          Highcharts.mapChart('mini-map', {
            chart: { backgroundColor: 'transparent', margin: [20, 20, 20, 20] },
            title: { text: null },
            credits: { enabled: false },
            mapNavigation: { enabled: false },
            tooltip: { enabled: false },
            plotOptions: {
              map: { allAreas: false }
            },
            series: [{
              mapData: mapData,
              data: [{ 'hc-key': hcKey, value: 1 }],
              joinBy: 'hc-key',
              color: '#D7263D', 
              borderColor: 'transparent',
              states: { hover: { color: '#D7263D' } },
              dataLabels: { enabled: false }
            }]
          });
        }, 300); 
      };

      window.closeDistrictModal = () => {
        distModal.classList.remove('active');
        document.body.style.overflow = '';
      };
      
    } catch (error) {
      console.error("Map rendering error:", error);
    }
  }
});
document.addEventListener('DOMContentLoaded', () => {
  /* ---------------- LANGUAGE & CURRENCY ---------------- */
  const langTrigger = document.getElementById('langTrigger');
  const langMenu = document.getElementById('langMenu');
  const langCode = document.getElementById('langCode');

  const locationPin = document.getElementById('locationPin');
  const mapWrapper = document.querySelector('.map-wrapper');

 const districtLabel = document.getElementById('districtLabel');

const districtCard = document.getElementById('districtCard');
const districtCardName = document.getElementById('districtCardName');
const districtCardImageOne = document.getElementById('districtCardImageOne');
const districtCardImageTwo = document.getElementById('districtCardImageTwo');
const districtCardPlaces = document.getElementById('districtCardPlaces');
let cardHideTimeout;
let districtHoverTimeout;
let activeDistrict = null;

const districts = document.querySelectorAll('.district');

const districtData = {
  Galle: {
    images: [
      'assets/districts/galle-1.jpg',
      'assets/districts/galle-2.jpg'
    ],
    places: [
      'Galle Fort',
      'Unawatuna Beach',
      'Jungle Beach'
    ]
  },

  Colombo: {
    images: [
      'assets/districts/colombo-1.jpg',
      'assets/districts/colombo-2.jpg'
    ],
    places: [
      'Galle Face Green',
      'Lotus Tower',
      'National Museum'
    ]
  },

  Jaffna: {
    images: [
      'assets/districts/jaffna-1.jpg',
      'assets/districts/jaffna-2.jpg'
    ],
    places: [
      'Jaffna Fort',
      'Nallur Temple',
      'Casuarina Beach'
    ]
  },

  Mahanuwara: {
    images: [
      'assets/districts/kandy-1.jpg',
      'assets/districts/kandy-2.jpg'
    ],
    places: [
      'Temple of the Tooth',
      'Kandy Lake',
      'Peradeniya Garden'
    ]
  }
};


districts.forEach((district) => {
  district.addEventListener('mouseenter', () => {
    clearTimeout(cardHideTimeout);
    clearTimeout(districtHoverTimeout);

    districtHoverTimeout = setTimeout(() => {
      activeDistrict = district;

      const districtRect = district.getBoundingClientRect();
      const mapRect = mapWrapper.getBoundingClientRect();

      const x =
        districtRect.left -
        mapRect.left +
        districtRect.width / 2;

      const y =
        districtRect.top -
        mapRect.top +
        districtRect.height / 2;

      locationPin.style.left = `${x}px`;
      locationPin.style.top = `${y}px`;
      locationPin.classList.add('show');

      const districtKey = district.id;
      const districtName =
        district.getAttribute('name') || districtKey;

      districtLabel.textContent = districtName;
      districtLabel.style.left = `${x + 55}px`;
      districtLabel.style.top = `${y - 22}px`;
      districtLabel.classList.add('show');

      const cardData = districtData[districtKey] || {
        images: [
          'assets/districts/hero.jpg',
          'assets/districts/beach.jpg'
        ],
        places: [
          'Popular Attraction',
          'Natural Landmark',
          'Cultural Destination'
        ]
      };

      districtCardName.textContent = `${districtName} District`;

      districtCardImageOne.src = cardData.images[0];
      districtCardImageTwo.src = cardData.images[1];

      districtCardPlaces.innerHTML = cardData.places
        .map((place) => `<li>${place}</li>`)
        .join('');

      const cardWidth = 320;
      const cardHeight = districtCard.offsetHeight || 300;
      const cardRightGap = 20;

      const cardLeft =
        mapWrapper.clientWidth -
        cardWidth -
        cardRightGap;

      let cardTop = y;

      const minimumTop = cardHeight / 2 + 20;
      const maximumTop =
        mapWrapper.clientHeight -
        cardHeight / 2 -
        20;

      if (cardTop < minimumTop) {
        cardTop = minimumTop;
      }

      if (cardTop > maximumTop) {
        cardTop = maximumTop;
      }

      districtCard.style.left = `${cardLeft}px`;
      districtCard.style.top = `${cardTop}px`;
      districtCard.classList.add('show');
    }, 300);
  });

  district.addEventListener('mouseleave', () => {
    clearTimeout(districtHoverTimeout);

    cardHideTimeout = setTimeout(() => {
      locationPin.classList.remove('show');
      districtLabel.classList.remove('show');
      districtCard.classList.remove('show');
      activeDistrict = null;
    }, 900);
  });
});

districtCard.addEventListener('mouseenter', () => {
  clearTimeout(cardHideTimeout);
  districtCard.classList.add('show');
});

districtCard.addEventListener('mouseleave', () => {
  cardHideTimeout = setTimeout(() => {
    districtCard.classList.remove('show');
  }, 1200);
});
  

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

/* ---------------- HIGHCHARTS MAP ---------------- */
document.addEventListener("DOMContentLoaded", () => {
    if (!document.getElementById("srilanka-map")) return;

    const mapData = Highcharts.maps["countries/lk/lk-all"];

    if (!mapData) {
        alert("Sri Lanka map data not loaded.");
        return;
    }

    const destinationsDB = {
        "Colombo":[
            {name:"Galle Face Green",desc:"Urban ocean-side park.",rating:"4.5"},
            {name:"Gangaramaya Temple",desc:"Beautiful Buddhist temple.",rating:"4.8"},
            {name:"National Museum",desc:"Largest museum in Sri Lanka.",rating:"4.6"}
        ],
        "Kandy":[
            {name:"Temple of the Tooth",desc:"UNESCO Heritage.",rating:"4.9"},
            {name:"Kandy Lake",desc:"Beautiful city lake.",rating:"4.6"},
            {name:"Royal Botanical Garden",desc:"Peradeniya Garden.",rating:"4.8"}
        ],
        "Galle":[
            {name:"Galle Fort",desc:"Dutch Fort.",rating:"4.8"},
            {name:"Unawatuna Beach",desc:"Popular beach.",rating:"4.7"}
        ]
    };

    // Create data automatically from map
    const data = mapData.features.map(feature => ({
        "hc-key": feature.properties["hc-key"],
        value: 1
    }));

    Highcharts.mapChart("srilanka-map", {
        chart: {
            map: mapData,
            backgroundColor: "transparent"
        },
        title: {
            text: null
        },
        credits: {
            enabled: false
        },
        mapNavigation: {
            enabled: true
        },
        tooltip: {
            headerFormat: "",
            pointFormat: "<b>{point.name}</b>"
        },
        plotOptions: {
            series: {
                point: {
                    events: {
                        click: function () {
                            const districtName = this.name;
                            let desc = "Explore beautiful destinations in " + districtName + ".";
                            
                            // Check if we have specific destinations in the DB for this district
                            if (destinationsDB[districtName]) {
                                const spots = destinationsDB[districtName].map(spot => spot.name).join(', ');
                                desc = "Top spots include: " + spots + ".";
                            }
                            
                            if (window.openModal) {
                                window.openModal(districtName, desc);
                            }
                        }
                    }
                }
            }
        },
        series: [{
            data: data,
            name: "Districts",
            allowPointSelect: true,
            cursor: 'pointer',
            states: {
                hover: {
                    color: '#D7263D'
                },
                select: {
                    color: '#A81B2E'
                }
            },
            dataLabels: {
                enabled: true,
                format: '{point.name}'
            }
        }]
    });
});
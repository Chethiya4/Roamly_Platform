document.addEventListener('DOMContentLoaded', () => {
  const districtDatabase = {
    Ampara: {
      title: 'Ampara District',

      tagline:
        'Discover untouched beaches, wildlife, ancient heritage and peaceful natural landscapes.',

      province: 'Eastern Province',

      bestTime: 'May – September',

      category: 'Beaches, Wildlife and Culture',

      heroImage:
        'assets/districts/ampara/ampara-hero.jpg',

      description:
        'Ampara District is located in the Eastern Province of Sri Lanka and is known for its beautiful coastline, natural reserves, archaeological locations and multicultural communities.',

      descriptionTwo:
        'Visitors can explore peaceful beaches, wildlife habitats, ancient religious sites and rural landscapes while experiencing the traditions and hospitality of the Eastern Province.',

      attractions: [
        {
          name: 'Arugam Bay',

          description:
            'A world-famous surfing destination with a relaxed beach atmosphere.',

          image:
            'assets/districts/ampara/arugam-bay.jpg',

          rating: '4.8'
        },

        {
          name: 'Kumana National Park',

          description:
            'A protected wildlife area known for birds, elephants and natural lagoons.',

          image:
            'assets/districts/ampara/kumana.jpg',

          rating: '4.7'
        },

        {
          name: 'Muhudu Maha Viharaya',

          description:
            'An ancient Buddhist temple located close to the eastern coastline.',

          image:
            'assets/districts/ampara/muhudu-maha-viharaya.jpg',

          rating: '4.6'
        }
      ],

      activities: [
        {
          icon: '🏄',
          title: 'Surfing',

          description:
            'Enjoy world-class surfing conditions along the eastern coastline.'
        },

        {
          icon: '🐘',
          title: 'Wildlife Safari',

          description:
            'Observe elephants, birds and other wildlife in protected natural areas.'
        },

        {
          icon: '🏛️',
          title: 'Heritage Exploration',

          description:
            'Visit archaeological and religious locations throughout the district.'
        }
      ],

      gallery: [
        'assets/districts/ampara/ampara-gallery-1.jpg',
        'assets/districts/ampara/ampara-gallery-2.jpg',
        'assets/districts/ampara/ampara-gallery-3.jpg',
        'assets/districts/ampara/ampara-gallery-4.jpg'
      ]
    },

    Galle: {
      title: 'Galle District',

      tagline:
        'Experience historic architecture, golden beaches and the charm of Sri Lanka’s southern coast.',

      province: 'Southern Province',

      bestTime: 'December – April',

      category: 'Heritage and Beaches',

      heroImage:
        'assets/districts/galle/galle-hero.jpg',

      description:
        'Galle District is one of the most popular destinations in southern Sri Lanka, combining colonial history, coastal landscapes and vibrant local culture.',

      descriptionTwo:
        'The UNESCO-listed Galle Fort, beautiful beaches and traditional communities make the district an ideal destination for history lovers and beach travellers.',

      attractions: [
        {
          name: 'Galle Fort',

          description:
            'A UNESCO World Heritage Site featuring historic streets, museums and ocean views.',

          image:
            'assets/districts/galle/galle-fort.jpg',

          rating: '4.9'
        },

        {
          name: 'Unawatuna Beach',

          description:
            'A popular beach known for swimming, restaurants and tropical scenery.',

          image:
            'assets/districts/galle/unawatuna.jpg',

          rating: '4.7'
        },

        {
          name: 'Jungle Beach',

          description:
            'A peaceful beach surrounded by greenery and calm coastal water.',

          image:
            'assets/districts/galle/jungle-beach.jpg',

          rating: '4.6'
        }
      ],

      activities: [
        {
          icon: '🏰',
          title: 'Explore Galle Fort',

          description:
            'Walk through historic streets and experience colonial architecture.'
        },

        {
          icon: '🏖️',
          title: 'Beach Activities',

          description:
            'Relax, swim and enjoy tropical beaches along the southern coast.'
        },

        {
          icon: '🤿',
          title: 'Snorkelling',

          description:
            'Discover coral reefs and marine life in clear coastal waters.'
        }
      ],

      gallery: [
        'assets/districts/galle/galle-gallery-1.jpg',
        'assets/districts/galle/galle-gallery-2.jpg',
        'assets/districts/galle/galle-gallery-3.jpg',
        'assets/districts/galle/galle-gallery-4.jpg'
      ]
    },

    Badulla: {
      title: 'Badulla District',

      tagline:
        'Explore misty mountains, waterfalls, tea plantations and scenic railway journeys.',

      province: 'Uva Province',

      bestTime: 'January – September',

      category: 'Mountains and Nature',

      heroImage:
        'assets/districts/badulla/badulla-hero.jpg',

      description:
        'Badulla District is located in the central highlands of Sri Lanka and is famous for mountain landscapes, waterfalls, tea plantations and cool weather.',

      descriptionTwo:
        'The district includes popular destinations such as Ella, Haputale and several scenic hiking locations, making it ideal for nature lovers and adventure travellers.',

      attractions: [
        {
          name: 'Nine Arch Bridge',

          description:
            'An iconic railway bridge surrounded by tea plantations and forest.',

          image:
            'assets/districts/badulla/nine-arch-bridge.jpg',

          rating: '4.9'
        },

        {
          name: 'Little Adam’s Peak',

          description:
            'A popular hiking location offering panoramic views of the surrounding hills.',

          image:
            'assets/districts/badulla/little-adams-peak.jpg',

          rating: '4.8'
        },

        {
          name: 'Dunhinda Falls',

          description:
            'One of Sri Lanka’s most beautiful waterfalls, surrounded by tropical forest.',

          image:
            'assets/districts/badulla/dunhinda-falls.jpg',

          rating: '4.7'
        }
      ],

      activities: [
        {
          icon: '🥾',
          title: 'Mountain Hiking',

          description:
            'Walk through mountain trails and enjoy panoramic views.'
        },

        {
          icon: '🚂',
          title: 'Scenic Train Journey',

          description:
            'Travel through tea estates, forests and mountain villages.'
        },

        {
          icon: '☕',
          title: 'Tea Estate Visit',

          description:
            'Learn about Sri Lanka’s tea industry and explore green plantations.'
        }
      ],

      gallery: [
        'assets/districts/badulla/badulla-gallery-1.jpg',
        'assets/districts/badulla/badulla-gallery-2.jpg',
        'assets/districts/badulla/badulla-gallery-3.jpg',
        'assets/districts/badulla/badulla-gallery-4.jpg'
      ]
    },

    Colombo: {
      title: 'Colombo District',

      tagline:
        'Experience modern city life, cultural landmarks, shopping and oceanfront attractions.',

      province: 'Western Province',

      bestTime: 'January – March',

      category: 'City, Culture and Shopping',

      heroImage:
        'assets/districts/colombo/colombo-hero.jpg',

      description:
        'Colombo District is Sri Lanka’s main commercial and urban region, combining modern buildings, historic sites, restaurants, shopping centres and coastal attractions.',

      descriptionTwo:
        'Visitors can explore museums, temples, markets, public parks and modern entertainment destinations while experiencing the energy of Sri Lanka’s largest city.',

      attractions: [
        {
          name: 'Galle Face Green',

          description:
            'A popular oceanfront public space ideal for sunsets and street food.',

          image:
            'assets/districts/colombo/galle-face.jpg',

          rating: '4.7'
        },

        {
          name: 'Lotus Tower',

          description:
            'A modern landmark offering panoramic views across Colombo city.',

          image:
            'assets/districts/colombo/lotus-tower.jpg',

          rating: '4.6'
        },

        {
          name: 'National Museum',

          description:
            'Sri Lanka’s largest museum, featuring cultural and historical collections.',

          image:
            'assets/districts/colombo/national-museum.jpg',

          rating: '4.6'
        }
      ],

      activities: [
        {
          icon: '🛍️',
          title: 'City Shopping',

          description:
            'Explore modern malls, local markets and boutique stores.'
        },

        {
          icon: '🍽️',
          title: 'Food Experiences',

          description:
            'Enjoy Sri Lankan and international cuisine throughout the city.'
        },

        {
          icon: '🏛️',
          title: 'Cultural Visits',

          description:
            'Discover museums, temples and colonial landmarks.'
        }
      ],

      gallery: [
        'assets/districts/colombo/colombo-gallery-1.jpg',
        'assets/districts/colombo/colombo-gallery-2.jpg',
        'assets/districts/colombo/colombo-gallery-3.jpg',
        'assets/districts/colombo/colombo-gallery-4.jpg'
      ]
    },

    Jaffna: {
      title: 'Jaffna District',

      tagline:
        'Discover northern heritage, historic forts, temples, islands and unique local cuisine.',

      province: 'Northern Province',

      bestTime: 'January – September',

      category: 'Culture, Heritage and Islands',

      heroImage:
        'assets/districts/jaffna/jaffna-hero.jpg',

      description:
        'Jaffna District offers a distinctive cultural experience shaped by northern Sri Lankan history, architecture, traditions and coastal landscapes.',

      descriptionTwo:
        'Visitors can explore ancient temples, colonial forts, islands and beaches while enjoying the district’s unique cuisine and warm hospitality.',

      attractions: [
        {
          name: 'Jaffna Fort',

          description:
            'A historic coastal fort reflecting the district’s colonial history.',

          image:
            'assets/districts/jaffna/jaffna-fort.jpg',

          rating: '4.6'
        },

        {
          name: 'Nallur Kandaswamy Temple',

          description:
            'One of Sri Lanka’s most important and impressive Hindu temples.',

          image:
            'assets/districts/jaffna/nallur-temple.jpg',

          rating: '4.8'
        },

        {
          name: 'Casuarina Beach',

          description:
            'A peaceful northern beach known for shallow water and coastal scenery.',

          image:
            'assets/districts/jaffna/casuarina-beach.jpg',

          rating: '4.5'
        }
      ],

      activities: [
        {
          icon: '🛕',
          title: 'Temple Visits',

          description:
            'Experience northern religious traditions and architecture.'
        },

        {
          icon: '🏝️',
          title: 'Island Exploration',

          description:
            'Visit islands and coastal communities surrounding Jaffna.'
        },

        {
          icon: '🍛',
          title: 'Local Cuisine',

          description:
            'Taste distinctive northern Sri Lankan food and traditional dishes.'
        }
      ],

      gallery: [
        'assets/districts/jaffna/jaffna-gallery-1.jpg',
        'assets/districts/jaffna/jaffna-gallery-2.jpg',
        'assets/districts/jaffna/jaffna-gallery-3.jpg',
        'assets/districts/jaffna/jaffna-gallery-4.jpg'
      ]
    },

    Mahanuwara: {
      title: 'Kandy District',

      tagline:
        'Experience sacred heritage, mountain scenery, cultural traditions and botanical beauty.',

      province: 'Central Province',

      bestTime: 'January – April',

      category: 'Culture and Mountains',

      heroImage:
        'assets/districts/kandy/kandy-hero.jpg',

      description:
        'Kandy District is one of Sri Lanka’s most culturally important regions and was the location of the island’s final royal kingdom.',

      descriptionTwo:
        'Surrounded by hills and forests, the district is known for the Temple of the Tooth, Kandy Lake, botanical gardens and traditional cultural performances.',

      attractions: [
        {
          name: 'Temple of the Tooth',

          description:
            'A sacred Buddhist temple and UNESCO World Heritage attraction.',

          image:
            'assets/districts/kandy/temple-of-tooth.jpg',

          rating: '4.9'
        },

        {
          name: 'Kandy Lake',

          description:
            'A scenic lake located in the heart of Kandy city.',

          image:
            'assets/districts/kandy/kandy-lake.jpg',

          rating: '4.7'
        },

        {
          name: 'Peradeniya Botanical Garden',

          description:
            'A large botanical garden featuring tropical plants and historic landscapes.',

          image:
            'assets/districts/kandy/peradeniya.jpg',

          rating: '4.8'
        }
      ],

      activities: [
        {
          icon: '🛕',
          title: 'Sacred Heritage',

          description:
            'Visit important Buddhist sites and learn about Sri Lankan history.'
        },

        {
          icon: '💃',
          title: 'Cultural Shows',

          description:
            'Watch traditional Kandyan dance and cultural performances.'
        },

        {
          icon: '🌿',
          title: 'Garden Exploration',

          description:
            'Walk through botanical gardens and peaceful natural spaces.'
        }
      ],

      gallery: [
        'assets/districts/kandy/kandy-gallery-1.jpg',
        'assets/districts/kandy/kandy-gallery-2.jpg',
        'assets/districts/kandy/kandy-gallery-3.jpg',
        'assets/districts/kandy/kandy-gallery-4.jpg'
      ]
    }
  };

  const fallbackDistrict = {
    title: 'Explore This District',

    tagline:
      'Discover beautiful destinations, local culture and unforgettable travel experiences.',

    province: 'Sri Lanka',

    bestTime: 'Throughout the year',

    category: 'Nature and Culture',

    heroImage:
      'assets/districts/default-hero.jpg',

    description:
      'This district offers a range of cultural, natural and historical destinations for visitors to discover.',

    descriptionTwo:
      'Explore local attractions, natural landscapes and the communities that make this region unique.',

    attractions: [
      {
        name: 'Popular Attraction',

        description:
          'Discover one of the most popular travel destinations in this district.',

        image:
          'assets/districts/default-attraction-1.jpg',

        rating: '4.5'
      },

      {
        name: 'Natural Destination',

        description:
          'Experience the natural beauty and landscape of the district.',

        image:
          'assets/districts/default-attraction-2.jpg',

        rating: '4.4'
      },

      {
        name: 'Cultural Location',

        description:
          'Learn about the culture, history and local traditions of the area.',

        image:
          'assets/districts/default-attraction-3.jpg',

        rating: '4.3'
      }
    ],

    activities: [
      {
        icon: '📸',
        title: 'Photography',

        description:
          'Capture memorable landscapes and travel experiences.'
      },

      {
        icon: '🥾',
        title: 'Exploration',

        description:
          'Explore popular places and hidden destinations.'
      },

      {
        icon: '🍛',
        title: 'Local Experiences',

        description:
          'Experience local food, traditions and hospitality.'
      }
    ],

    gallery: [
      'assets/districts/default-gallery-1.jpg',
      'assets/districts/default-gallery-2.jpg',
      'assets/districts/default-gallery-3.jpg',
      'assets/districts/default-gallery-4.jpg'
    ]
  };

  const queryParameters =
    new URLSearchParams(window.location.search);

  const districtId =
    queryParameters.get('id') || 'Ampara';

  const district =
    districtDatabase[districtId] || {
      ...fallbackDistrict,

      title: `${formatDistrictName(districtId)} District`
    };

  function formatDistrictName(value) {
    if (!value) {
      return 'District';
    }

    return value
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  function setText(id, value) {
    const element = document.getElementById(id);

    if (element) {
      element.textContent = value;
    }
  }

  const heroImage =
    document.getElementById('districtHeroImage');

  if (heroImage) {
    heroImage.src = district.heroImage;
    heroImage.alt = district.title;
  }

  document.title = `${district.title} — Roamly`;

  setText('breadcrumbDistrict', district.title);
  setText('districtPageTitle', district.title);
  setText('districtPageTagline', district.tagline);

  setText(
    'districtOverviewTitle',
    `Discover ${district.title}`
  );

  setText(
    'districtDescription',
    district.description
  );

  setText(
    'districtDescriptionTwo',
    district.descriptionTwo
  );

  setText('districtProvince', district.province);
  setText('districtBestTime', district.bestTime);
  setText('districtCategory', district.category);

  setText(
    'districtTravelTitle',
    `Ready to explore ${district.title}?`
  );

  setText(
    'districtTravelDescription',
    `Start planning your journey and discover the best attractions and experiences in ${district.title}.`
  );

  const attractionsGrid =
    document.getElementById('districtAttractionsGrid');

  if (attractionsGrid) {
    attractionsGrid.innerHTML =
      district.attractions
        .map((attraction) => {
          return `
            <article class="district-attraction-card">

              <div class="district-attraction-image">

                <img
                  src="${attraction.image}"
                  alt="${attraction.name}"
                  loading="lazy"
                >

                <div class="district-attraction-rating">
                  <span>★</span>
                  ${attraction.rating}
                </div>

              </div>

              <div class="district-attraction-content">

                <h3>${attraction.name}</h3>

                <p>${attraction.description}</p>

                <a href="bookings.html">
                  View details
                  <span>→</span>
                </a>

              </div>

            </article>
          `;
        })
        .join('');
  }

  const activitiesGrid =
    document.getElementById('districtActivitiesGrid');

  if (activitiesGrid) {
    activitiesGrid.innerHTML =
      district.activities
        .map((activity) => {
          return `
            <article class="district-activity-card">

              <div class="district-activity-icon">
                ${activity.icon}
              </div>

              <h3>${activity.title}</h3>

              <p>${activity.description}</p>

            </article>
          `;
        })
        .join('');
  }

  const galleryGrid =
    document.getElementById('districtGalleryGrid');

  if (galleryGrid) {
    galleryGrid.innerHTML =
      district.gallery
        .map((image, index) => {
          return `
            <button
              type="button"
              class="district-gallery-item
              ${index === 0 ? 'district-gallery-large' : ''}"
              aria-label="Open gallery image ${index + 1}"
            >
              <img
                src="${image}"
                alt="${district.title} gallery image ${index + 1}"
                loading="lazy"
              >
            </button>
          `;
        })
        .join('');
  }

  const galleryImages =
    document.querySelectorAll(
      '.district-gallery-item img'
    );

  galleryImages.forEach((image) => {
    image.addEventListener('error', () => {
      image.src =
        'assets/districts/default-gallery-1.jpg';
    });
  });

  const langTrigger =
    document.getElementById('langTrigger');

  const langMenu =
    document.getElementById('langMenu');

  const langCode =
    document.getElementById('langCode');

  if (langTrigger && langMenu && langCode) {
    langTrigger.addEventListener('click', () => {
      const isOpen = !langMenu.hidden;

      langMenu.hidden = isOpen;

      langTrigger.setAttribute(
        'aria-expanded',
        String(!isOpen)
      );
    });

    langMenu
      .querySelectorAll('button')
      .forEach((button) => {
        button.addEventListener('click', () => {
          langMenu
            .querySelectorAll('button')
            .forEach((item) => {
              item.classList.remove('active');
            });

          button.classList.add('active');

          langCode.textContent =
            button.dataset.code;

          langMenu.hidden = true;

          langTrigger.setAttribute(
            'aria-expanded',
            'false'
          );
        });
      });

    document.addEventListener('click', (event) => {
      if (!event.target.closest('.lang-select')) {
        langMenu.hidden = true;

        langTrigger.setAttribute(
          'aria-expanded',
          'false'
        );
      }
    });
  }

  const currencySelect =
    document.getElementById('currencySelect');

  if (currencySelect) {
    currencySelect
      .querySelectorAll('button')
      .forEach((button) => {
        button.addEventListener('click', () => {
          currencySelect
            .querySelectorAll('button')
            .forEach((item) => {
              item.classList.remove('active');
            });

          button.classList.add('active');
        });
      });
  }

  const darkModeToggle =
    document.getElementById('darkModeToggle');

  if (darkModeToggle) {
    darkModeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
    });
  }
});
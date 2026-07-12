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


    Highcharts.mapChart("srilanka-map",{

        chart:{
            map:mapData,
            backgroundColor:"transparent"
        },

        title:{
            text:null
        },

        credits:{
            enabled:false
        },

        mapNavigation:{
            enabled:true
        },

        tooltip:{
            headerFormat:"",
            pointFormat:"<b>{point.name}</b>"
        },

        plotOptions:{
            series:{
                cursor:"pointer",

                states:{
                    hover:{
                        color:"#D7263D",
                        borderColor:"#99192b"
                    }
                },

                point:{
                    events:{
                        click:function(){

                            openDistrictModal(
                                this.name,
                                this["hc-key"]
                            );

                        }
                    }
                }
            }
        },

        series:[{

            data:data,

            mapData:mapData,

            joinBy:"hc-key",

            name:"District",

            color:"#dfe7f3",

            borderColor:"#4A5B78",

            borderWidth:1,

            dataLabels:{
                enabled:true,
                format:"{point.name}",
                style:{
                    fontWeight:"600",
                    color:"#122A4D",
                    textOutline:"1px white",
                    fontSize:"10px"
                }
            }

        }]

    });


    const modal=document.getElementById("districtModal");


    window.openDistrictModal=function(name,key){

        document.getElementById("modalDistrictName").innerHTML=name;

        const list=document.getElementById("destinationsList");

        list.innerHTML="";

        const places=destinationsDB[name]||[
            {
                name:"No destinations yet",
                desc:"Tourist places will be added soon.",
                rating:"-"
            }
        ];

        places.forEach(place=>{

            list.innerHTML+=`

            <div class="dest-card">

                <h4>
                    ${place.name}
                    <span class="rating-badge">
                        ⭐ ${place.rating}
                    </span>
                </h4>

                <p>${place.desc}</p>

            </div>

            `;

        });

        modal.classList.add("active");

        document.body.style.overflow="hidden";


        setTimeout(()=>{

            Highcharts.mapChart("mini-map",{

                chart:{
                    map:mapData,
                    backgroundColor:"transparent"
                },

                title:{
                    text:null
                },

                credits:{
                    enabled:false
                },

                mapNavigation:{
                    enabled:false
                },

                tooltip:{
                    enabled:false
                },

                series:[{

                    mapData:mapData,

                    joinBy:"hc-key",

                    allAreas:true,

                    borderColor:"#cccccc",

                    nullColor:"#f5f5f5",

                    data:[
                        {
                            "hc-key":key,
                            value:1
                        }
                    ],

                    color:"#D7263D",

                    states:{
                        hover:{
                            enabled:false
                        }
                    },

                    dataLabels:{
                        enabled:false
                    }

                }]

            });

        },100);

    };


    window.closeDistrictModal=function(){

        modal.classList.remove("active");

        document.body.style.overflow="";

    };

});

const districts=document.querySelectorAll(".district");

districts.forEach(district=>{

    district.addEventListener("click",()=>{

        openDistrictModal(district.id);

    });

});
/**
 * scripts/seedTouristSpots.js
 *
 * Seeds 2 curated, approved tourist spots for all 25 Sri Lanka districts into MongoDB.
 * Run using: node scripts/seedTouristSpots.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('../config/db');
const Destination = require('../models/Destination');
const TouristSpot = require('../models/TouristSpot');
const User = require('../models/User');

const SPOTS_DATA = {
  "Colombo": [
    {
      name: "Gangaramaya Temple",
      category: "Religious",
      openingHours: "6:00 AM - 10:00 PM",
      entryFee: 500,
      description: "Famous Buddhist temple located on Beira Lake featuring historic artifacts, giant bronze Buddhas, and an eclectic museum.",
      photos: ["https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=800"]
    },
    {
      name: "Lotus Tower & Galle Face Green",
      category: "Viewpoint",
      openingHours: "9:00 AM - 11:00 PM",
      entryFee: 1000,
      description: "South Asia's tallest self-supported structure with panoramic ocean views and popular sunset beach promenade.",
      photos: ["images/colombo.jpg"]
    }
  ],
  "Gampaha": [
    {
      name: "Henarathgoda Botanical Garden",
      category: "Nature & Wildlife",
      openingHours: "7:30 AM - 5:00 PM",
      entryFee: 200,
      description: "Historic botanical garden where the first Para rubber tree in Sri Lanka was planted in 1876.",
      photos: ["https://images.unsplash.com/photo-1590001155093-a3c66ab0c3ff?q=80&w=800"]
    },
    {
      name: "Guruge Nature Park",
      category: "Adventure",
      openingHours: "9:00 AM - 6:00 PM",
      entryFee: 600,
      description: "Theme park highlighting Sri Lanka's ancient history with dinosaur models, boat rides, and cultural exhibits.",
      photos: ["https://images.unsplash.com/photo-1522163182402-834f871fd851?q=80&w=800"]
    }
  ],
  "Kalutara": [
    {
      name: "Kalutara Bodhiya & Stupa",
      category: "Religious",
      openingHours: "5:00 AM - 9:00 PM",
      entryFee: 0,
      description: "The only hollow Buddhist stupa in the world with ancient murals, located right by the scenic Kalu Ganga river.",
      photos: ["https://images.unsplash.com/photo-1605538032432-a9f0c8d9baac?q=80&w=800"]
    },
    {
      name: "Richmond Castle",
      category: "Historical",
      openingHours: "8:00 AM - 5:00 PM",
      entryFee: 500,
      description: "Edwardian mansion built in 1900 with European architectural influence, stained glass windows, and ornate wood carvings.",
      photos: ["https://images.unsplash.com/photo-1596402184320-417e7178b2cd?q=80&w=800"]
    }
  ],
  "Kandy": [
    {
      name: "Temple of the Sacred Tooth Relic",
      category: "Religious",
      openingHours: "5:30 AM - 8:00 PM",
      entryFee: 1500,
      description: "UNESCO World Heritage Buddhist temple housing the sacred tooth relic of the Buddha in Kandy royal complex.",
      photos: ["images/Esala.jpg"]
    },
    {
      name: "Royal Botanical Gardens, Peradeniya",
      category: "Nature & Wildlife",
      openingHours: "7:30 AM - 5:00 PM",
      entryFee: 2000,
      description: "World-renowned botanical gardens boasting 4,000+ species of plants, rare orchids, and giant palm avenues.",
      photos: ["https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=800"]
    }
  ],
  "Matale": [
    {
      name: "Sigiriya Ancient Rock Fortress",
      category: "Historical",
      openingHours: "6:30 AM - 5:30 PM",
      entryFee: 9000,
      description: "UNESCO 5th-century palace fortress built atop a 200m giant granite rock with ancient frescoes and water gardens.",
      photos: ["images/Sigiriya1.jpg"]
    },
    {
      name: "Aluvihare Rock Cave Temple",
      category: "Cultural",
      openingHours: "7:00 AM - 6:00 PM",
      entryFee: 200,
      description: "Historic monastery where the Buddhist Pali Canon (Tripitaka) was first written down on palm leaves in 1st century BCE.",
      photos: ["https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=800"]
    }
  ],
  "Nuwara Eliya": [
    {
      name: "Gregory Lake & Park",
      category: "Viewpoint",
      openingHours: "6:00 AM - 6:00 PM",
      entryFee: 200,
      description: "Scenic highland lake featuring swan pedal boats, pony rides, and chilly mountain tea gardens.",
      photos: ["images/nuwaraeliya1.jpg"]
    },
    {
      name: "Horton Plains & World's End",
      category: "Nature & Wildlife",
      openingHours: "6:00 AM - 4:00 PM",
      entryFee: 4000,
      description: "National park plateau ending at a sheer cliff with a dramatic 870m drop overlooking southern misty plains.",
      photos: ["https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=800"]
    }
  ],
  "Galle": [
    {
      name: "Galle Dutch Fort & Lighthouse",
      category: "Historical",
      openingHours: "24 Hours Open",
      entryFee: 0,
      description: "UNESCO fortified old town built by Portuguese and Dutch colonists with oceanfront ramparts and boutique streets.",
      photos: ["images/gallfort1.jpg"]
    },
    {
      name: "Unawatuna & Jungle Beach",
      category: "Beach",
      openingHours: "24 Hours Open",
      entryFee: 0,
      description: "Horseshoe bay beach famous for turquoise waters, coral reefs, and vibrant beach cafes.",
      photos: ["https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800"]
    }
  ],
  "Matara": [
    {
      name: "Mirissa Coconut Tree Hill",
      category: "Beach",
      openingHours: "5:30 AM - 6:30 PM",
      entryFee: 0,
      description: "Iconic palm-covered red cliff overlooking the Indian Ocean and world-famous blue whale safari bay.",
      photos: ["images/mirissa1.jpg"]
    },
    {
      name: "Dondra Head Lighthouse",
      category: "Viewpoint",
      openingHours: "8:00 AM - 5:00 PM",
      entryFee: 100,
      description: "Sri Lanka's southernmost point featuring a soaring 49m octagonal white lighthouse surrounded by palms.",
      photos: ["https://images.unsplash.com/photo-1605538032432-a9f0c8d9baac?q=80&w=800"]
    }
  ],
  "Hambantota": [
    {
      name: "Yala National Park",
      category: "Nature & Wildlife",
      openingHours: "6:00 AM - 6:00 PM",
      entryFee: 5000,
      description: "Premier wildlife reserve famous for having the highest density of wild leopards in the world.",
      photos: ["images/yala1.jpg"]
    },
    {
      name: "Ridiyagama Open Safari Park",
      category: "Nature & Wildlife",
      openingHours: "8:30 AM - 4:30 PM",
      entryFee: 1000,
      description: "500-acre open safari drive-through park featuring lions, elephants, and African herbivores.",
      photos: ["https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=800"]
    }
  ],
  "Jaffna": [
    {
      name: "Nallur Kandaswamy Kovil",
      category: "Religious",
      openingHours: "4:30 AM - 7:00 PM",
      entryFee: 0,
      description: "Majestic Hindu Kovil complex with golden gopuram, intricate Dravidian architecture, and annual chariot festivals.",
      photos: ["https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=800"]
    },
    {
      name: "Jaffna Dutch Fort",
      category: "Historical",
      openingHours: "8:00 AM - 6:00 PM",
      entryFee: 0,
      description: "Pentagonal coastal fortress built by the Dutch in 1680 overlooking the Jaffna lagoon.",
      photos: ["https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=800"]
    }
  ],
  "Kilinochchi": [
    {
      name: "Iranamadu Reservoir",
      category: "Viewpoint",
      openingHours: "6:00 AM - 6:00 PM",
      entryFee: 0,
      description: "Largest man-made irrigation reservoir in the northern province surrounded by lush paddy lands.",
      photos: ["https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=800"]
    },
    {
      name: "Kanagapuram Memorial Landmark",
      category: "Historical",
      openingHours: "8:00 AM - 5:00 PM",
      entryFee: 0,
      description: "Commemorative historical landmark reflecting northern heritage and peace monuments.",
      photos: ["https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=800"]
    }
  ],
  "Mannar": [
    {
      name: "Adam's Bridge Sandbars",
      category: "Nature & Wildlife",
      openingHours: "6:00 AM - 6:00 PM",
      entryFee: 0,
      description: "Chain of natural limestone shoals and sandy islets connecting Sri Lanka to Pamban Island.",
      photos: ["https://images.unsplash.com/photo-1616422285623-13ff0162193c?q=80&w=800"]
    },
    {
      name: "Ancient Baobab Tree",
      category: "Historical",
      openingHours: "24 Hours Open",
      entryFee: 0,
      description: "Massive 700-year-old Arabian baobab tree with a trunk circumference of over 19 meters.",
      photos: ["https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800"]
    }
  ],
  "Mullaitivu": [
    {
      name: "Mullaitivu Coastline",
      category: "Beach",
      openingHours: "24 Hours Open",
      entryFee: 0,
      description: "Untouched, serene golden sand beaches with crystal-clear coastal waters and quiet sunsets.",
      photos: ["https://images.unsplash.com/photo-1620619767323-b95a89183081?q=80&w=800"]
    },
    {
      name: "Nanthikadal Lagoon Sanctuary",
      category: "Nature & Wildlife",
      openingHours: "6:00 AM - 6:00 PM",
      entryFee: 0,
      description: "Expansive estuarine lagoon sanctuary rich in coastal wildlife, mangroves, and migratory birds.",
      photos: ["https://images.unsplash.com/photo-1506929562872-bb421503ef21?q=80&w=800"]
    }
  ],
  "Vavuniya": [
    {
      name: "Kandarodei Stupas",
      category: "Historical",
      openingHours: "8:00 AM - 5:00 PM",
      entryFee: 100,
      description: "Cluster of 61 miniature stone stupas dating back to the 3rd century BCE surrounded by palmyra palms.",
      photos: ["https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=800"]
    },
    {
      name: "Vavuniya Reservoir Promenade",
      category: "Viewpoint",
      openingHours: "6:00 AM - 7:00 PM",
      entryFee: 0,
      description: "Tranquil lakeside promenade park ideal for sunset views and peaceful evening walks.",
      photos: ["https://images.unsplash.com/photo-1542856391-010fb87dcfed?q=80&w=800"]
    }
  ],
  "Trincomalee": [
    {
      name: "Koneswaram Temple & Swami Rock",
      category: "Religious",
      openingHours: "6:00 AM - 7:00 PM",
      entryFee: 0,
      description: "Historic cliffside Hindu temple dedicated to Lord Shiva overlooking Lovers Leap precipice and deep blue ocean.",
      photos: ["https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800"]
    },
    {
      name: "Pigeon Island Marine Park",
      category: "Nature & Wildlife",
      openingHours: "7:00 AM - 5:00 PM",
      entryFee: 2500,
      description: "Protected marine island featuring live coral reefs, sea turtles, and blacktip reef sharks.",
      photos: ["https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800"]
    }
  ],
  "Batticaloa": [
    {
      name: "Batticaloa Dutch Fort",
      category: "Historical",
      openingHours: "8:00 AM - 5:00 PM",
      entryFee: 0,
      description: "1628 coastal fort surrounded by calm lagoon waters famous for the phenomenon of singing fish.",
      photos: ["https://images.unsplash.com/photo-1506929562872-bb421503ef21?q=80&w=800"]
    },
    {
      name: "Pasikuda Bay Beach",
      category: "Beach",
      openingHours: "24 Hours Open",
      entryFee: 0,
      description: "Shallow ocean bay where you can walk out hundreds of meters into calm turquoise water.",
      photos: ["https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800"]
    }
  ],
  "Ampara": [
    {
      name: "Arugam Bay Surf Point",
      category: "Adventure",
      openingHours: "24 Hours Open",
      entryFee: 0,
      description: "World Top-10 right-hand point break surfing paradise attracting international surfers.",
      photos: ["images/arugambay1.jpg"]
    },
    {
      name: "Senanayake Samudraya",
      category: "Nature & Wildlife",
      openingHours: "6:00 AM - 6:00 PM",
      entryFee: 500,
      description: "Sri Lanka's largest reservoir where wild elephants swim between lush inland islands.",
      photos: ["https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=800"]
    }
  ],
  "Anuradhapura": [
    {
      name: "Ruwanwelisaya Giant Stupa",
      category: "Religious",
      openingHours: "5:00 AM - 9:00 PM",
      entryFee: 0,
      description: "Colossal 2nd-century BCE white dome stupa built by King Dutugemunu, standing 103 meters tall.",
      photos: ["https://images.unsplash.com/photo-1596402184320-417e7178b2cd?q=80&w=800"]
    },
    {
      name: "Jaya Sri Maha Bodhi",
      category: "Religious",
      openingHours: "5:00 AM - 9:00 PM",
      entryFee: 0,
      description: "The oldest human-planted tree in the world with a documented history, brought from India in 288 BCE.",
      photos: ["https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=800"]
    }
  ],
  "Polonnaruwa": [
    {
      name: "Gal Viharaya Rock Sculptures",
      category: "Historical",
      openingHours: "7:30 AM - 5:30 PM",
      entryFee: 3500,
      description: "Four colossal Buddha statues carved into a single granite rock wall in the 12th century.",
      photos: ["https://images.unsplash.com/photo-1596402184320-417e7178b2cd?q=80&w=800"]
    },
    {
      name: "Parakrama Samudra Reservoir",
      category: "Viewpoint",
      openingHours: "24 Hours Open",
      entryFee: 0,
      description: "Massive 12th-century inland sea reservoir constructed by King Parakramabahu I.",
      photos: ["https://images.unsplash.com/photo-1506929562872-bb421503ef21?q=80&w=800"]
    }
  ],
  "Kurunegala": [
    {
      name: "Ethagala (Elephant Rock) Buddha Statue",
      category: "Viewpoint",
      openingHours: "6:00 AM - 6:00 PM",
      entryFee: 100,
      description: "88-foot tall white seated Buddha statue atop a giant rock overlooking Kurunegala town.",
      photos: ["https://images.unsplash.com/photo-1542856391-010fb87dcfed?q=80&w=800"]
    },
    {
      name: "Ridi Viharaya (Silver Temple)",
      category: "Cultural",
      openingHours: "7:00 AM - 5:00 PM",
      entryFee: 200,
      description: "Ancient cave temple complex where silver ore was discovered to build the Ruwanwelisaya stupa.",
      photos: ["https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=800"]
    }
  ],
  "Puttalam": [
    {
      name: "Wilpattu National Park",
      category: "Nature & Wildlife",
      openingHours: "6:00 AM - 6:00 PM",
      entryFee: 4500,
      description: "Sri Lanka's largest national park famous for natural rainwater lakes (Willus) and sloth bears.",
      photos: ["https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800"]
    },
    {
      name: "Kalpitiya Dolphin & Kitesurf Bay",
      category: "Adventure",
      openingHours: "6:00 AM - 5:00 PM",
      entryFee: 3000,
      description: "Premier kitesurfing destination and ocean hotspot for massive spinner dolphin pods.",
      photos: ["https://images.unsplash.com/photo-1522163182402-834f871fd851?q=80&w=800"]
    }
  ],
  "Kegalle": [
    {
      name: "Pinnawala Elephant Orphanage",
      category: "Nature & Wildlife",
      openingHours: "8:30 AM - 5:30 PM",
      entryFee: 3000,
      description: "Famous sanctuary housing rescued Asian elephants, featuring daily river bathing rituals.",
      photos: ["https://images.unsplash.com/photo-1581888227599-779811939961?q=80&w=800"]
    },
    {
      name: "Bible Rock (Bathalegala)",
      category: "Adventure",
      openingHours: "6:00 AM - 5:00 PM",
      entryFee: 0,
      description: "Striking flat-topped mountain offering panoramic hiking trails and 360-degree valley views.",
      photos: ["https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=800"]
    }
  ],
  "Ratnapura": [
    {
      name: "Sri Pada (Adam's Peak)",
      category: "Religious",
      openingHours: "24 Hours Open",
      entryFee: 0,
      description: "2,243m sacred mountain peak famous for the sacred footprint and spectacular sunrise shadow.",
      photos: ["images/adamspeak1.jpg"]
    },
    {
      name: "Sinharaja Rainforest Reserve",
      category: "Nature & Wildlife",
      openingHours: "6:30 AM - 4:30 PM",
      entryFee: 1500,
      description: "UNESCO virgin tropical rainforest biodiversity hotspot teeming with endemic birds and rare flora.",
      photos: ["https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=800"]
    }
  ],
  "Badulla": [
    {
      name: "Nine Arch Bridge, Ella",
      category: "Viewpoint",
      openingHours: "24 Hours Open",
      entryFee: 0,
      description: "Iconic 1919 colonial viaduct bridge built purely of stone and brick without steel reinforcements.",
      photos: ["images/ella1.jpg"]
    },
    {
      name: "Dunhinda Falls",
      category: "Waterfall",
      openingHours: "7:00 AM - 5:00 PM",
      entryFee: 200,
      description: "Breathtaking 64-meter waterfall cascading into a smoky mist pool amidst dense hill forest.",
      photos: ["https://images.unsplash.com/photo-1546182990-dffeafbe841d?q=80&w=800"]
    }
  ],
  "Monaragala": [
    {
      name: "Buduruwagala Rock Carvings",
      category: "Cultural",
      openingHours: "7:00 AM - 5:30 PM",
      entryFee: 500,
      description: "7 ancient Mahayana Buddhist figures carved into a cliff, including a 51-foot standing Buddha.",
      photos: ["https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=800"]
    },
    {
      name: "Maligawila Buddha Statue",
      category: "Historical",
      openingHours: "8:00 AM - 5:00 PM",
      entryFee: 100,
      description: "7th-century freestanding limestone Buddha statue standing 37 feet tall in the jungle.",
      photos: ["https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=800"]
    }
  ]
};

async function seed() {
  try {
    await connectDB();

    // Find or fallback to Admin User
    let adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      adminUser = await User.findOne({});
    }

    if (!adminUser) {
      console.error('No user found in database! Please run `node scripts/seedAdmin.js` first.');
      process.exit(1);
    }

    let createdCount = 0;

    for (const [distName, spots] of Object.entries(SPOTS_DATA)) {
      let dest = await Destination.findOne({ name: distName });
      if (!dest) {
        dest = await Destination.create({
          name: distName,
          province: 'Sri Lanka',
          description: `Top travel destination ${distName} in Sri Lanka.`
        });
      }

      for (const spotData of spots) {
        // Upsert by name and destination
        let spot = await TouristSpot.findOne({ name: spotData.name, destination: dest._id });
        if (!spot) {
          spot = await TouristSpot.create({
            destination: dest._id,
            submittedBy: adminUser._id,
            name: spotData.name,
            category: spotData.category,
            openingHours: spotData.openingHours,
            entryFee: spotData.entryFee,
            description: spotData.description,
            photos: spotData.photos,
            status: 'approved',
            averageRating: 4.8,
            reviewCount: 12
          });
          createdCount++;
          console.log(`  ✓ Added spot: "${spot.name}" in ${distName}`);
        } else {
          spot.status = 'approved';
          spot.category = spotData.category;
          spot.openingHours = spotData.openingHours;
          spot.entryFee = spotData.entryFee;
          spot.description = spotData.description;
          await spot.save();
        }
      }
    }

    console.log(`\nSuccessfully seeded/verified 2 tourist spots for all 25 districts (${createdCount} new spots created).`);
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed();

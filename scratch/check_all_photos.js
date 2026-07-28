const https = require('https');
const http = require('http');

const DISTRICT_PHOTOS = {
  "Trincomalee": "https://images.unsplash.com/photo-1589982464731-bf506977cd5d?q=80&w=1200",
  "Mullaitivu": "https://images.unsplash.com/photo-1620619767323-b95a89183081?q=80&w=1200",
  "Jaffna": "https://images.unsplash.com/photo-1579693155106-96a92ec2c4eb?q=80&w=1200",
  "Kilinochchi": "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=1200",
  "Mannar": "https://images.unsplash.com/photo-1616422285623-13ff0162193c?q=80&w=1200",
  "Puttalam": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200",
  "Gampaha": "https://images.unsplash.com/photo-1590001155093-a3c66ab0c3ff?q=80&w=1200",
  "Colombo": "https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?q=80&w=1200",
  "Kalutara": "https://images.unsplash.com/photo-1605538032432-a9f0c8d9baac?q=80&w=1200",
  "Galle": "images/gallfort1.jpg",
  "Matara": "images/mirissa1.jpg",
  "Hambantota": "images/yala1.jpg",
  "Ampara": "images/arugambay1.jpg",
  "Batticaloa": "https://images.unsplash.com/photo-1506929562872-bb421503ef21?q=80&w=1200",
  "Ratnapura": "images/adamspeak1.jpg",
  "Monaragala": "https://images.unsplash.com/photo-1588612140409-a78c187d95cb?q=80&w=1200",
  "Kegalle": "https://images.unsplash.com/photo-1581888227599-779811939961?q=80&w=1200",
  "Badulla": "images/ella1.jpg",
  "Matale": "images/Sigiriya1.jpg",
  "Polonnaruwa": "https://images.unsplash.com/photo-1608958416717-38e55e2d6b38?q=80&w=1200",
  "Kurunegala": "https://images.unsplash.com/photo-1542856391-010fb87dcfed?q=80&w=1200",
  "Anuradhapura": "https://images.unsplash.com/photo-1585807519105-0967fc03bb69?q=80&w=1200",
  "Nuwara Eliya": "images/nuwaraeliya1.jpg",
  "Vavuniya": "https://images.unsplash.com/photo-1609137144813-f47055c65a04?q=80&w=1200",
  "Kandy": "images/Esala.jpg"
};

function check(name, url) {
  return new Promise((resolve) => {
    if (url.startsWith('images/')) {
      resolve({ name, status: 200, type: 'local' });
      return;
    }
    https.get(url, (res) => {
      resolve({ name, status: res.statusCode, contentType: res.headers['content-type'] });
    }).on('error', err => {
      resolve({ name, error: err.message });
    });
  });
}

async function run() {
  const results = [];
  for (const [name, url] of Object.entries(DISTRICT_PHOTOS)) {
    results.push(await check(name, url));
  }
  console.log(results);
}

run();

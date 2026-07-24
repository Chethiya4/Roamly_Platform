const https = require('https');

const URLs = {
  Jaffna: "https://images.unsplash.com/photo-1579693155106-96a92ec2c4eb?q=80&w=1200",
  Monaragala: "https://images.unsplash.com/photo-1588612140409-a78c187d95cb?q=80&w=1200",
  Polonnaruwa: "https://images.unsplash.com/photo-1608958416717-38e55e2d6b38?q=80&w=1200"
};

function check(name, url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      resolve({ name, status: res.statusCode, contentType: res.headers['content-type'] });
    }).on('error', err => {
      resolve({ name, error: err.message });
    });
  });
}

async function run() {
  const results = [];
  for (const [name, url] of Object.entries(URLs)) {
    results.push(await check(name, url));
  }
  console.log(results);
}

run();

const http = require('http');

const DISTRICTS = [
  'Jaffna', 'Kilinochchi', 'Mannar', 'Vavuniya', 'Mullaitivu',
  'Trincomalee', 'Batticaloa', 'Ampara', 'Anuradhapura', 'Polonnaruwa',
  'Kurunegala', 'Puttalam', 'Kandy', 'Matale', 'Nuwara Eliya',
  'Ratnapura', 'Kegalle', 'Badulla', 'Monaragala', 'Colombo',
  'Gampaha', 'Kalutara', 'Galle', 'Matara', 'Hambantota'
];

async function check(name) {
  return new Promise((resolve) => {
    http.get(`http://127.0.0.1:3000/api/destinations/by-name/${encodeURIComponent(name)}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const body = JSON.parse(data);
          resolve({ name, status: res.statusCode, success: body.success, id: body.data?._id });
        } catch {
          resolve({ name, status: res.statusCode, success: false, raw: data });
        }
      });
    }).on('error', err => {
      resolve({ name, error: err.message });
    });
  });
}

async function run() {
  const results = [];
  for (const name of DISTRICTS) {
    results.push(await check(name));
  }
  console.log(JSON.stringify(results, null, 2));
}

run();

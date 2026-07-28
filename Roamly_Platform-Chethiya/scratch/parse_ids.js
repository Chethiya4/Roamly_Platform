const fs = require('fs');
const content = fs.readFileSync('map.html', 'utf8');
const regex = /<path class="district"[^>]*id="([^"]+)"/g;
let match;
const ids = [];
while ((match = regex.exec(content)) !== null) {
  ids.push(match[1]);
}
console.log(ids);

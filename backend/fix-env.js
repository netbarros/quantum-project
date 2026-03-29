const fs = require('fs');
const path = require('path');
const webpush = require('web-push');

const envPath = path.join(__dirname, '.env');
let envContent = fs.readFileSync(envPath, 'utf8');

const keys = webpush.generateVAPIDKeys();

envContent = envContent.replace(
  /^VAPID_PUBLIC_KEY=.*$/m,
  `VAPID_PUBLIC_KEY=${keys.publicKey}`
);

envContent = envContent.replace(
  /^VAPID_PRIVATE_KEY=.*$/m,
  `VAPID_PRIVATE_KEY=${keys.privateKey}`
);

fs.writeFileSync(envPath, envContent, 'utf8');
console.log('Fixed .env with properly encoded clean VAPID keys.');

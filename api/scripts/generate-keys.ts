import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

const keyDir = path.join(process.cwd(), 'keys');

// Create keys directory if it doesn't exist
if (!fs.existsSync(keyDir)) {
  fs.mkdirSync(keyDir, { recursive: true });
}

// Generate key pairs for access and refresh tokens
const { publicKey: accessPublicKey, privateKey: accessPrivateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 4096,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem'
  }
});

const { publicKey: refreshPublicKey, privateKey: refreshPrivateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 4096,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem'
  }
});

// Write keys to files
fs.writeFileSync(path.join(keyDir, 'access.public.pem'), accessPublicKey);
fs.writeFileSync(path.join(keyDir, 'access.private.pem'), accessPrivateKey);
fs.writeFileSync(path.join(keyDir, 'refresh.public.pem'), refreshPublicKey);
fs.writeFileSync(path.join(keyDir, 'refresh.private.pem'), refreshPrivateKey);

console.log('Keys generated successfully in the keys directory');
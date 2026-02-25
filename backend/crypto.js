const crypto = require('crypto');
const key = crypto.randomBytes(32); // Generates a 32-byte key for AES-256
console.log(key.toString('hex')); // Prints the key as a hex string

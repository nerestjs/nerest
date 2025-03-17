import crypto from 'crypto';

// Generate a random string ID 20 characters long
export function randomId() {
  return crypto.randomBytes(10).toString('hex');
}

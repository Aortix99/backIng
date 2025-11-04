const jwt = require('jsonwebtoken');
require('dotenv').config();

// Token de ejemplo del login anterior
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwiZW1haWwiOiJkZWJ1Z0B0ZXN0LmNvbSIsIm5hbWUiOiJEZWJ1ZyBVc2VyIiwicm9sZSI6ZmFsc2UsImlhdCI6MTc2MTg4OTUwNiwiZXhwIjoxNzYxOTc1OTA2LCJhdWQiOiJpbmctY2l2aWwtZnJvbnRlbmQiLCJpc3MiOiJpbmctY2l2aWwtYmFja2VuZCJ9.MUUxkl5kOCUZrLbdOMSPOT2hLGGSZTlsJ8gQKaZ9Prs';

console.log('JWT_SECRET:', process.env.JWT_SECRET);
console.log('Token:', token);

try {
  // Intentar verificar con issuer/audience
  console.log('\n=== Verificación CON issuer/audience ===');
  const decoded1 = jwt.verify(token, process.env.JWT_SECRET, {
    issuer: 'ing-civil-backend',
    audience: 'ing-civil-frontend'
  });
  console.log('✅ Éxito con issuer/audience:', decoded1);
} catch (error) {
  console.log('❌ Error con issuer/audience:', error.message);
}

try {
  // Intentar verificar SIN issuer/audience
  console.log('\n=== Verificación SIN issuer/audience ===');
  const decoded2 = jwt.verify(token, process.env.JWT_SECRET);
  console.log('✅ Éxito sin issuer/audience:', decoded2);
} catch (error) {
  console.log('❌ Error sin issuer/audience:', error.message);
}

// Decodificar sin verificar para ver el payload
console.log('\n=== Payload sin verificar ===');
const payload = jwt.decode(token);
console.log('Payload:', JSON.stringify(payload, null, 2));
const API_BASE_URL = 'https://netpulse-backend-i5co.onrender.com';
async function request(path) {
  const response = await fetch(API_BASE_URL + path);
  if (!response.ok) throw new Error('not ok');
  return response.json();
}
request('/api/health').then(console.log).catch(console.error);

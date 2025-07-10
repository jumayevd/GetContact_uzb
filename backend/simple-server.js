const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello from GetContact Uzb Backend!');
});

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Simple server running on port ${PORT}`);
});

server.on('error', (err) => {
  console.error('Server error:', err);
}); 
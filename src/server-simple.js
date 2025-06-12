const express = require('express');

const app = express();
const port = 3001;

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

app.get('/api', (req, res) => {
  res.json({
    name: 'StoreHub Knowledge Base Auditor API',
    version: '1.0.0'
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
}); 
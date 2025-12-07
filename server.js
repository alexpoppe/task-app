const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

// Store connected clients
let clients = [];

// SSE endpoint
app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  clients.push(res);

  req.on('close', () => {
    clients = clients.filter(client => client !== res);
  });
});

// Proxy to n8n with auth
app.post('/api/add-task', async (req, res) => {
  const { task_description } = req.body;

  const username = process.env.N8N_USERNAME;
  const password = process.env.N8N_PASSWORD;
  const credentials = Buffer.from(`${username}:${password}`).toString('base64');

  try {
    const response = await fetch('https://alexanderpoppe.app.n8n.cloud/webhook/add-task', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${credentials}`
      },
      body: JSON.stringify({ task_description })
    });

    const data = await response.text();
    res.status(response.status).json({ success: response.ok, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Proxy to n8n replan-week with auth
app.post('/api/replan-week', async (req, res) => {
  const username = process.env.N8N_USERNAME;
  const password = process.env.N8N_PASSWORD;
  const credentials = Buffer.from(`${username}:${password}`).toString('base64');

  try {
    const response = await fetch('https://alexanderpoppe.app.n8n.cloud/webhook/replan-week', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${credentials}`
      },
      body: JSON.stringify({})
    });

    const data = await response.text();
    res.status(response.status).json({ success: response.ok, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Event completion webhook (handles both task and plan completion)
app.post('/api/event-complete', (req, res) => {
  const { event_type } = req.body;

  clients.forEach(client => {
    client.write(`data: ${JSON.stringify({ event: event_type })}\n\n`);
  });

  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

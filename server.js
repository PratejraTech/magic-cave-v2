const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Database connection
let db;
if (process.env.DB_CREDENTIALS) {
  const dbCreds = JSON.parse(process.env.DB_CREDENTIALS);
  db = new Pool({
    host: dbCreds.endpoint.split(':')[0],
    port: dbCreds.port,
    database: dbCreds.dbname,
    user: dbCreds.username,
    password: dbCreds.password,
    ssl: { rejectUnauthorized: false }
  });
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Import and use existing API functions
const chatWithDaddy = require('./functions/api/chat-with-daddy.mjs');
const chatSessions = require('./functions/api/chat-sessions.js');

// Mock KV for development
const mockKV = {
  get: async (key, type) => null,
  put: async (key, value) => {},
};

// API routes
app.post('/api/chat-with-daddy', async (req, res) => {
  const context = {
    request: { 
      method: 'POST',
      json: () => Promise.resolve(req.body)
    },
    env: {
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      HARPER_ADVENT: mockKV,
      DADS_LETTER: mockKV
    }
  };
  
  try {
    const response = await chatWithDaddy.onRequest(context);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/chat-sessions', async (req, res) => {
  const context = {
    request: { 
      method: 'POST',
      json: () => Promise.resolve(req.body)
    },
    env: {
      HARPER_ADVENT: mockKV
    }
  };
  
  try {
    const response = await chatSessions.onRequest(context);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
});
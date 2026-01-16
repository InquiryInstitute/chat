/**
 * Persona Proxy Middleware for LibreChat
 * 
 * This proxy sits between LibreChat and the Supabase llm-gateway,
 * handling persona selection and mapping.
 * 
 * Usage: Run this as a Node.js server, point LibreChat to it instead of direct llm-gateway
 */

const http = require('http');
const https = require('https');
const { URL } = require('url');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://xougqdomkoisrxdnagcj.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const PROXY_PORT = process.env.PROXY_PORT || 3081;

// Persona mapping (from persona-mapper.js)
const PERSONA_MAP = {
  'plato': 'a.plato',
  'aristotle': 'a.aristotle',
  'kant': 'a.kant',
  'nietzsche': 'a.nietzsche',
  'hegel': 'a.hegel',
  'socrates': 'a.socrates',
  'confucius': 'a.confucius',
  'laozi': 'a.laozi',
  'spinoza': 'a.spinoza',
  'descartes': 'a.descartes',
  'hume': 'a.hume',
  'schopenhauer': 'a.schopenhauer',
  'wittgenstein': 'a.wittgenstein',
  'rawls': 'a.rawls',
  'einstein': 'a.einstein',
  'darwin': 'a.darwin',
  'curie': 'a.curie',
  'turing': 'a.turing',
  'lovelace': 'a.lovelace',
  'newton': 'a.newton',
  'galileo': 'a.galileo',
  'shelley': 'a.shelley',
  'byron': 'a.byron',
  'shakespeare': 'a.shakespeare',
  'dickens': 'a.dickens',
};

/**
 * Normalize persona input to full slug format
 */
function normalizePersona(input) {
  if (!input || typeof input !== 'string') {
    return null;
  }
  
  const trimmed = input.trim().toLowerCase();
  
  // If already in correct format (a.xxx), return as-is
  if (trimmed.startsWith('a.')) {
    return trimmed;
  }
  
  // Check if it's in our mapping
  if (PERSONA_MAP[trimmed]) {
    return PERSONA_MAP[trimmed];
  }
  
  // Try to construct: if input is "plato", try "a.plato"
  return `a.${trimmed}`;
}

/**
 * Extract persona from message content or system prompt
 * Looks for patterns like "persona: plato" or "@plato" or just "plato" in context
 */
function extractPersonaFromRequest(body) {
  try {
    const data = JSON.parse(body);
    
    // Check for explicit persona in request
    if (data.persona) {
      return normalizePersona(data.persona);
    }
    
    // Check messages for persona mentions
    if (data.messages && Array.isArray(data.messages)) {
      for (const msg of data.messages) {
        const content = msg.content || '';
        
        // Look for "persona: plato" or "@plato" patterns
        const personaMatch = content.match(/(?:persona|@|as)\s*:?\s*([a-z]+)/i);
        if (personaMatch) {
          return normalizePersona(personaMatch[1]);
        }
        
        // Check if message starts with a persona name
        const words = content.trim().split(/\s+/);
        if (words.length > 0) {
          const firstWord = words[0].toLowerCase().replace(/[^a-z]/g, '');
          if (PERSONA_MAP[firstWord] || firstWord.startsWith('a.')) {
            return normalizePersona(firstWord);
          }
        }
      }
    }
    
    return null;
  } catch (e) {
    return null;
  }
}

/**
 * Proxy server that adds persona header to requests
 */
const server = http.createServer((req, res) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'authorization, content-type, x-persona',
    });
    res.end();
    return;
  }

  let body = '';
  
  req.on('data', chunk => {
    body += chunk.toString();
  });
  
  req.on('end', () => {
    // Extract persona from request
    const persona = extractPersonaFromRequest(body) || 
                    req.headers['x-persona'] || 
                    new URL(req.url, 'http://localhost').searchParams.get('persona');
    
    const normalizedPersona = persona ? normalizePersona(persona) : null;
    
    // Forward request to Supabase llm-gateway
    const targetUrl = new URL(`${SUPABASE_URL}/functions/v1/llm-gateway`);
    
    // If persona was found, add it to the request
    let requestBody = body;
    if (normalizedPersona && body) {
      try {
        const data = JSON.parse(body);
        data.persona = normalizedPersona;
        requestBody = JSON.stringify(data);
      } catch (e) {
        // If body parsing fails, just add header
      }
    }
    
    const options = {
      hostname: targetUrl.hostname,
      port: targetUrl.port || (targetUrl.protocol === 'https:' ? 443 : 80),
      path: targetUrl.pathname + targetUrl.search,
      method: req.method,
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        ...(normalizedPersona ? { 'x-persona': normalizedPersona } : {}),
      },
    };
    
    const protocol = targetUrl.protocol === 'https:' ? https : http;
    
    const proxyReq = protocol.request(options, (proxyRes) => {
      // Copy response headers
      res.writeHead(proxyRes.statusCode, {
        ...proxyRes.headers,
        'Access-Control-Allow-Origin': '*',
      });
      
      // Pipe response
      proxyRes.pipe(res);
    });
    
    proxyReq.on('error', (err) => {
      console.error('Proxy error:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Proxy error', message: err.message }));
    });
    
    // Send request body
    if (requestBody) {
      proxyReq.write(requestBody);
    }
    proxyReq.end();
  });
});

server.listen(PROXY_PORT, () => {
  console.log(`Persona proxy server running on port ${PROXY_PORT}`);
  console.log(`Supabase URL: ${SUPABASE_URL}`);
  console.log(`Point LibreChat OPENAI_BASE_URL to: http://localhost:${PROXY_PORT}/v1`);
});

const SYSTEM_PROMPT = `You are an Indian address parser for a delivery company. Parse raw addresses into structured fields.

Extract: house, street, locality, city, state, pincode, country (default India).
Also determine: confidence (high/medium/low), status (parsed/unparseable/needs_review), notes (issues or null).

Rules:
- For Hindi text, transliterate and parse.
- For "c/o" addresses, put c/o in house field.
- For Plus Codes like "7GQ8+3M", set status to needs_review.
- For vague text like "near big temple", set status to needs_review.
- For non-addresses like "same as last time", set status to unparseable.
- Infer state from city if not given.
- Note gate codes or special instructions in notes.
- BLR = Bangalore, Bombay = Mumbai.

Return ONLY a valid JSON object with keys: house, street, locality, city, state, pincode, country, confidence, status, notes.`;

function formatParsed(rawAddress, parsed) {
  let conf = parsed.confidence;
  if (typeof conf === 'number') {
    conf = conf >= 0.8 ? 'high' : conf >= 0.5 ? 'medium' : 'low';
  }

  return {
    raw_address: rawAddress,
    house: parsed.house || null,
    street: parsed.street || null,
    locality: parsed.locality || null,
    city: parsed.city || null,
    state: parsed.state || null,
    pincode: parsed.pincode || null,
    country: parsed.country || 'India',
    confidence: conf || 'low',
    status: parsed.status || 'needs_review',
    notes: parsed.notes || null
  };
}

function errorParsed(rawAddress, message) {
  return {
    raw_address: rawAddress,
    house: null,
    street: null,
    locality: null,
    city: null,
    state: null,
    pincode: null,
    country: 'India',
    confidence: 'low',
    status: 'unparseable',
    notes: `Parse error: ${message}`
  };
}

async function fetchWithRetry(url, options, maxRetries = 3, initialDelayMs = 1500) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const res = await fetch(url, options);
    if (res.status === 429 && attempt < maxRetries - 1) {
      const waitTime = initialDelayMs * Math.pow(2, attempt);
      console.warn(`Rate limited by AI API (429). Retrying in ${waitTime}ms... (Attempt ${attempt + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      continue;
    }
    return res;
  }
}

async function parseAddress(rawAddress) {
  const apiKey = process.env.FIREWORKS_API_KEY;

  if (!apiKey || apiKey === 'your_fireworks_api_key_here') {
    return errorParsed(rawAddress, 'FIREWORKS_API_KEY is not configured in .env');
  }

  try {
    const res = await fetchWithRetry('https://api.fireworks.ai/inference/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'accounts/fireworks/models/deepseek-v4p1-flash',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `Parse this address: "${rawAddress}"` }
        ]
      })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error?.message || 'AI API error');
    }

    const content = data.choices[0].message.content;
    const parsed = JSON.parse(content);
    return formatParsed(rawAddress, parsed);
  } catch (err) {
    return errorParsed(rawAddress, err.message);
  }
}

async function parseAddressesBatch(rawAddresses) {
  const results = [];
  for (let i = 0; i < rawAddresses.length; i++) {
    const addr = rawAddresses[i].trim();
    if (addr) {
      const result = await parseAddress(addr);
      results.push(result);
      if (i < rawAddresses.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 800));
      }
    }
  }
  return results;
}

module.exports = { parseAddress, parseAddressesBatch };

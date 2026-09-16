# Address Parsing System

## 1. Problem Context & Business Framing
This project is an address parsing system designed to parse unstructured Indian delivery addresses into validated structural components (`house`, `street`, `locality`, `city`, `state`, `pincode`), assigns confidence scores, and triages problematic entries into `needs_review` or `unparseable` queues.

---

## 2. Database Schema (MongoDB / Mongoose)

Collection: `addresses`

```json
{
  "_id": "ObjectId",
  "raw_address": "String (Required, Trimmed)",
  "house": "String (Optional, e.g. Flat 302, Tower B)",
  "street": "String (Optional, e.g. Prestige Lakeside)",
  "locality": "String (Optional, e.g. Whitefield)",
  "city": "String (Optional, e.g. Bangalore)",
  "state": "String (Optional, e.g. Karnataka)",
  "pincode": "String (Optional, 6-digit Regex)",
  "country": "String (Default: 'India')",
  "confidence": "Enum ['high', 'medium', 'low']",
  "status": "Enum ['parsed', 'unparseable', 'needs_review']",
  "notes": "String (Optional, Edge case details)",
  "createdAt": "ISODate",
  "updatedAt": "ISODate"
}
```

### Database Indexes
- `{ city: 1, status: 1 }` — Enables quick filtering for regional operational hubs.
- `{ createdAt: -1 }` — Optimizes dashboard feed and recent list rendering.
- `{ raw_address: "text" }` — Full-text index for instant search.

---

## 3. API Endpoint Architecture

| Method | Endpoint | Description | Request Body / Query Params |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/addresses/parse` | Parse single raw address string | `{ "raw_address": "..." }` |
| `POST` | `/api/addresses/parse-bulk` | Batch parse multiple address strings | `{ "addresses": ["...", "..."] }` |
| `GET` | `/api/addresses` | List addresses with filter & pagination | `?status=needs_review&search=Whitefield&page=1` |
| `PUT` | `/api/addresses/:id` | Update parsed address fields manually | `{ "house": "...", "status": "parsed" }` |
| `DELETE` | `/api/addresses/:id` | Soft/hard delete address record | `N/A` |
| `GET` | `/api/addresses/stats` | Dashboard statistics & summary | `N/A` |

---

## 4. Prompt Engineering Strategy

We utilize Fireworks AI (`accounts/fireworks/models/deepseek-v4p1-flash`) with structured JSON mode enforcement. 

### Core System Prompt Design
```text
You are an Indian address parser for a delivery company. Parse raw addresses into structured fields.

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

Return ONLY a valid JSON object with keys: house, street, locality, city, state, pincode, country, confidence, status, notes.
```

---

## 5. Edge Cases Identified in Messy Indian Data

1. **Vague Landmarks ("Near big banyan tree, opposite temple")**
   - *Risk*: No exact house number or street; riders get lost.
   - *Strategy*: Assigned `status: "needs_review"` and `confidence: "low"`, flagging for manual customer call verification.
2. **Plus Codes ("7GQ8+3M Bangalore")**
   - *Risk*: Algorithmic code without traditional street/house breakdown.
   - *Strategy*: Flagged as `status: "needs_review"` with note pointing to geocoding engine lookup.
3. **Non-Address Instructions ("Call when you reach gate", "Same as previous order")**
   - *Risk*: Zero address information provided.
   - *Strategy*: Model flags `status: "unparseable"` and captures instruction in `notes`.
4. **Colloquial & Transliterated Hinglish ("Makan no 45, Gali no 3, Main Market")**
   - *Risk*: Standard regex rules fail to split Hindi prefixes.
   - *Strategy*: Model transliterates Hindi prefixes into standard `house` ("House No. 45") and `street` ("Street No. 3") fields.
5. **City Shorthand ("BLR", "GZB", "GGN")**
   - *Risk*: Dark store routing rules fail on abbreviated city strings.
   - *Strategy*: Prompt explicitly standardizes abbreviations to canonical city names ("Bangalore", "Ghaziabad", "Gurugram").

---

# HNG Stage 0 - Gender Classification API

A lightweight REST API that predicts gender from names using the Genderize.io, Agify.io, and Nationalize.io APIs.

## Features

- Gender prediction based on name
- Age group classification (child, teen, adult, senior)
- Country origin prediction
- Profile storage with SQLite (via Prisma ORM)
- Natural language search with keyword-based parsing
- Confidence scoring (is_confident flag when probability >= 0.7 and sample_size >= 100)

## Prerequisites

- Node.js (v18+ recommended)
- npm

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd hng_stage_0

# Install dependencies
npm install
```

## Configuration

Create a `.env` file in the root directory:

```
PORT=3000
```

## Usage

```bash
# Development mode (with hot reload)
npm run dev

# Production build
npx tsc
node dist/main.js
```

Server runs at `http://localhost:3000`

## Endpoints

### GET /

Health check endpoint.

**Response:**

```
HNG DISPLAY NAME: Bams_114_Backend_Track
```

### GET /api/classify?name=\<name\>

Classifies gender from a name.

**Query Parameters:**

- `name` (required): The name to classify

**Success Response (200):**

```json
{
  "status": "success",
  "data": {
    "name": "John",
    "gender": "male",
    "probability": 0.99,
    "sample_size": 1234,
    "is_confident": true,
    "processed_at": "2026-04-14T00:00:00.000Z"
  }
}
```

**Error Responses:**

| Status | Condition | Response |
|--------|-----------|----------|
| 400 | Missing `name` query param | `{"status": "error", "message": "Name query parameter is required"}` |
| 404 | No prediction available | `{"status": "error", "message": "No prediction available for the provided name"}` |
| 422 | Invalid `name` type | `{"status": "error", "message": "Name must be a string"}` |
| 500 | Server error | `{"status": "error", "message": "Internal server error"}` |

### POST /api/profiles

Creates a new profile by analyzing a name.

**Request Body:**

```json
{ "name": "John" }
```

**Success Response (201):**

```json
{
  "status": "success",
  "data": {
    "id": "uuid-string",
    "name": "John",
    "gender": "male",
    "gender_probability": 0.99,
    "sample_size": 1234,
    "age": 45,
    "age_group": "adult",
    "country_id": "US",
    "country_probability": 0.85,
    "created_at": "2026-04-15T12:00:00.000Z"
  }
}
```

**Error Responses:**

| Status | Condition | Response |
|--------|-----------|----------|
| 400 | Missing `name` body | `{"status": "error", "message": "Name body parameter is required"}` |
| 404 | No prediction available | `{"status": "error", "message": "No prediction available for the provided name"}` |
| 200 | Profile already exists | `{"status": "success", "message": "Profile already exists", "data": {...}}` |
| 500 | Server error | `{"status": "error", "message": "Internal server error"}` |

### GET /api/profiles

Retrieves all profiles with optional filtering.

**Query Parameters (all optional, case-insensitive):**

- `gender` - Filter by gender (e.g., `male`, `female`)
- `country_id` - Filter by country code (e.g., `US`, `NG`)
- `age_group` - Filter by age group (`child`, `teen`, `adult`, `senior`)

**Example:**

```
GET /api/profiles?gender=male&age_group=adult
```

**Success Response (200):**

```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid-string",
      "name": "John",
      "gender": "male",
      "gender_probability": 0.99,
      "sample_size": 1234,
      "age": 45,
      "age_group": "adult",
      "country_id": "US",
      "country_probability": 0.85,
      "created_at": "2026-04-15T12:00:00.000Z"
    }
  ]
}
```

**Error Responses:**

| Status | Condition | Response |
|--------|-----------|----------|
| 500 | Server error | `{"status": "error", "message": "Internal server error"}` |

### GET /api/profiles/:id

Retrieves a specific profile by ID.

**Success Response (200):**

```json
{
  "status": "success",
  "data": {
    "id": "uuid-string",
    "name": "John",
    "gender": "male",
    "gender_probability": 0.99,
    "sample_size": 1234,
    "age": 45,
    "age_group": "adult",
    "country_id": "US",
    "country_probability": 0.85,
    "created_at": "2026-04-15T12:00:00.000Z"
  }
}
```

**Error Responses:**

| Status | Condition | Response |
|--------|-----------|----------|
| 404 | Profile not found | `{"status": "error", "message": "Profile not found"}` |
| 500 | Server error | `{"status": "error", "message": "Internal server error"}` |

### GET /api/profiles/search

Natural language search endpoint that interprets plain English queries into database filters.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | string | **Yes** | Natural language search query |
| `page` | integer | No | Page number (default: 1, max: 50) |
| `limit` | integer | No | Results per page (default: 10, max: 50) |
| `sort_by` | string | No | Sort field (`age`, `created_at`, `gender_probability`) |
| `order` | string | No | Sort order (`asc`, `desc`) |

**Supported Patterns:**

| Pattern | Example | Output Filters |
|--------|---------|----------------|
| **Gender** | `male`, `males`, `men`, `boy`, `boys`, `female`, `females`, `women`, `girl`, `girls` | `gender: "male"` / `gender: "female"` |
| **Age Group** | `child`, `kids`, `teen`, `teenager`, `adult`, `adults`, `senior`, `elderly` | `age_group: "child/teen/adult/senior"` |
| **Age: Above** | `above 30`, `above 30 years`, `older than 25` | `min_age: 30` |
| **Age: Below** | `below 18`, `below 18 years`, `younger than 21` | `max_age: 18` |
| **Age: Exact** | `age 25`, `aged 25`, `25 years old` | `min_age: 25, max_age: 25` |
| **Age: Range** | `between 18 and 25` | `min_age: 18, max_age: 25` |
| **Age: Young** | `young` | `min_age: 16, max_age: 24` |
| **Country** | `from nigeria`, `from NG`, `from kenya`, `from KE`, etc. | `country_id: "NG"` |
| **Combined** | `young males from nigeria` | `gender: "male", min_age: 16, max_age: 24, country_id: "NG"` |

**Supported Countries:**

| Country Name | Code | Supported Queries |
|--------------|------|------------------|
| Nigeria | NG | `nigeria`, `ng`, `nigerian` |
| United States | USA | `america`, `us`, `usa`, `american` |
| Angola | AO | `angola`, `ao` |
| Kenya | KE | `kenya`, `ke`, `kenyan` |
| China | CN | `china`, `cn`, `chinese` |
| United Kingdom | UK | `uk`, `united kingdom`, `britain` |

**Example Requests:**

```
GET /api/profiles/search?q=young%20males
GET /api/profiles/search?q=females%20above%2030
GET /api/profiles/search?q=people%20from%20nigeria
GET /api/profiles/search?q=adult%20males%20from%20kenya&page=1&limit=10&sort_by=age&order=asc
```

**Success Response (200):**

```json
{
  "status": "success",
  "page": 1,
  "limit": 10,
  "total": 45,
  "data": [
    {
      "id": "uuid-string",
      "name": "John",
      "gender": "male",
      "gender_probability": 0.99,
      "age": 22,
      "age_group": "adult",
      "country_id": "NG",
      "country_name": "Nigeria",
      "country_probability": 0.85,
      "created_at": "2026-04-15T12:00:00.000Z"
    }
  ]
}
```

**Error Responses:**

| Status | Condition | Response |
|--------|-----------|----------|
| 400 | Missing `q` parameter | `{"status": "error", "message": "Query parameter \"q\" is required"}` |
| 400 | No filters extracted | `{"status": "error", "message": "Unable to interpret query"}` |
| 500 | Server error | `{"status": "error", "message": "Internal server error"}` |

## Natural Language Query Limitations

The natural language parser uses a keyword-based approach with regex pattern matching. The following limitations apply:

| Limitation | Description |
|------------|-------------|
| **Country coverage** | Only a limited set of countries are supported. Full list in documentation above. |
| **"Male and female" queries** | Phrases like "male and female" will be treated as gender-neutral (both filters removed). |
| **Age group conflicts** | If a query specifies both an age group (e.g., `teen`) and explicit age numbers (e.g., `above 30`), the explicit age takes precedence. |
| **"Young" interpretation** | "Young" defaults to ages 16-24. This is a fixed range and cannot be customized via query. |
| **Compound queries** | Only AND logic is supported. OR queries (e.g., "males OR females from Nigeria") are not supported. |
| **Spelling variations** | Only exact keyword matches work. Misspelled words will be ignored. |
| **Case sensitivity in some terms** | "above" works but "ABOVE" does not. Gender/country keywords are case-insensitive. |

### Future Improvements

Possible enhancements for the natural language parser:

- Integrate machine learning model for better intent recognition
- Add more country mappings
- Support for OR logic in compound queries
- Customizable age ranges for keywords like "young"
- Synonym expansion (e.g., "guy" → "male")

## Tech Stack

- Express.js
- TypeScript
- Axios
- CORS
- Prisma ORM with SQLite
- UUID

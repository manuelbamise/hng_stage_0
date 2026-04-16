# HNG Stage 0 - Gender Classification API

A lightweight REST API that predicts gender from names using the Genderize.io, Agify.io, and Nationalize.io APIs.

## Features

- Gender prediction based on name
- Age group classification (child, teen, adult, senior)
- Country origin prediction
- Profile storage with SQLite
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

## Tech Stack

- Express.js
- TypeScript
- Axios
- CORS
- SQLite3
- UUID

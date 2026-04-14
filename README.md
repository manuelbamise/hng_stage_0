# HNG Stage 0 - Gender Classification API

A lightweight REST API that predicts gender from names using the Genderize.io API.

## Features

- Gender prediction based on name
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
Hello World!
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

## Tech Stack

- Express.js
- TypeScript
- Axios
- CORS

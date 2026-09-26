# Quantum MCAGI

Quantum MCAGI is a Python cognitive system with a FastAPI backend and a browser-based chat interface.

## Features

- Chat through the browser or the JSON API.
- Save chat history and local cognitive data.
- Inspect cognitive status, memories, growth metrics, and knowledge graphs.
- Access research, document, image, voice, and quantum endpoints.
- View and test API routes through the generated OpenAPI documentation.

## Project layout

| Path | Purpose |
| --- | --- |
| `backend/` | FastAPI server, cognitive engines, and tests. |
| `frontend/` | Browser chat interface served by FastAPI. |
| `backend/documents/` | Included text used by learning and research tools. |
| `requirements.txt` | Python dependencies for the full application. |

## Requirements

- Python 3.9, 3.10, or 3.11, as tested in CI.
- `pip`.

## Quick start

Clone the repository:

```sh
git clone https://github.com/strdst7/Quantum-MCAGI.git
cd Quantum-MCAGI
```

Create a virtual environment and install dependencies:

```sh
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

Start the application from the repository root:

```sh
cd backend
python -m uvicorn server:app --host 127.0.0.1 --port 8000
```

Open the chat interface at `http://127.0.0.1:8000/`.

## API

| URL | Description |
| --- | --- |
| `http://127.0.0.1:8000/` | Browser chat interface. |
| `http://127.0.0.1:8000/docs` | Interactive API documentation. |
| `http://127.0.0.1:8000/openapi.json` | OpenAPI schema. |
| `http://127.0.0.1:8000/api/health` | Service health check. |

The API includes routes for chat, memory, research, document uploads, image processing, and quantum operations.

## Local data

The backend stores its JSON database and uploaded files in `~/.quantum-mcagi-backend/`.

## Tests

Install the test runner and run the backend tests from the repository root:

```sh
python -m pip install pytest
python -m pytest backend/tests
```

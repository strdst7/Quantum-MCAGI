# Quantum MCAGI

Quantum MCAGI provides a Python API and a local browser chat interface.

## Run

Create and activate a virtual environment, then install the dependencies:

```sh
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
```

Start the API and web interface from the `backend` directory:

```sh
cd backend
python -m uvicorn server:app --host 127.0.0.1 --port 8000
```

Open `http://127.0.0.1:8000/` for chat or `http://127.0.0.1:8000/docs` for API docs.

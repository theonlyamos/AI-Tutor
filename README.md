# Synthesis Tutor 2.0

## Overview

Synthesis Tutor 2.0 is an interactive AI-powered tutoring application designed to provide personalized learning experiences. It features a web-based interface where students can interact with an AI tutor, access learning modules, and track their progress. The application uses a React frontend, a Python (FastAPI) backend, and MongoDB as its primary database, with AI capabilities provided by Google's Gemini models.

## Features

- **AI-Powered Tutoring:** Conversational AI tutor (powered by Google Gemini 1.5 Pro) that provides personalized assistance and answers student questions.
- **Student Management:** Create and manage student profiles including name, grade, and interests.
- **Learning Modules:** Access to learning modules across different subjects (e.g., Math, English, Science). Modules can have descriptions, difficulty levels, and prerequisites.
- **Progress Tracking:** Students can track their completion status and scores for different modules.
- **Interactive Chat Interface:** Frontend interface for students to communicate with the AI tutor.
- **Video Frame Processing:** Capability to capture and process video frames from the student's webcam (e.g., for engagement analysis, proctoring, or interactive video exercises - current implementation stores a record of the frame).
- **Dockerized Deployment:** Fully containerized setup using Docker and Nginx for serving the frontend and proxying the backend.

## Tech Stack

- **Frontend:**
  - React (v19) with Create React App
  - JavaScript
  - Tailwind CSS for styling
  - Axios for HTTP requests
  - React Router DOM for navigation
  - React Webcam for video capture
  - Framer Motion for animations
  - Heroicons for icons
  - Yarn for package management
- **Backend:**
  - Python (v3.11)
  - FastAPI framework for building APIs
  - Uvicorn ASGI server
  - MongoDB (via Motor for asynchronous operations) as the primary database
  - Google Generative AI (Gemini 1.5 Pro) for AI chat capabilities
  - Pydantic for data validation
  - Python-dotenv for environment variable management
- **Database:**
  - MongoDB
- **Deployment & DevOps:**
  - Docker & Docker Compose (implied by Dockerfile structure)
  - Nginx (for serving frontend and as a reverse proxy)
- **Other notable libraries/integrations (from root requirements.txt, usage may vary or be for auxiliary scripts/services):**
  - SQLAlchemy, psycopg2-binary (PostgreSQL interaction)
  - Supabase client
  - Redis client
  - Boto3 (AWS SDK)
  - LiteLLM, Langsmith (LLM related tooling)
  - Kubernetes client
  - Google Cloud Pub/Sub client

## Project Structure

```
.
├── backend/                # FastAPI backend application
│   ├── .env.example        # Example environment variables for backend
│   ├── external_integrations/ # Placeholder for external service integration modules
│   ├── server.py           # Main FastAPI application logic and API endpoints
│   ├── requirements.txt    # Python dependencies for the backend application
│   └── ...
├── frontend/               # React frontend application
│   ├── .env.example        # Example environment variables for frontend (if any)
│   ├── public/             # Static assets
│   ├── src/                # React components and application logic
│   │   ├── App.js          # Main frontend application component (currently monolithic)
│   │   └── ...
│   ├── package.json        # Frontend dependencies and scripts
│   └── ...
├── tests/                  # Test files (e.g., backend_test.py)
├── scripts/                # Utility scripts
├── .devcontainer/          # VS Code Dev Container configuration
├── .git/
├── .dockerignore
├── .gitignore
├── Dockerfile              # Defines the multi-stage Docker build
├── entrypoint.sh           # Entrypoint script for the Docker container
├── gha-creds-*.json        # GitHub Actions credentials (should be gitignored if sensitive)
├── nginx.conf              # Nginx configuration
├── README.md               # This file
├── requirements.txt        # Root Python dependencies (potentially for build/infra tooling)
└── yarn.lock               # Yarn lockfile for frontend dependencies
```

## Prerequisites

- Docker and Docker Compose (for containerized deployment)
- Node.js and Yarn (for frontend development)
- Python 3.11+ and pip (or `uv`) (for backend development)
- Access to a MongoDB instance
- A Google AI API Key (for Gemini)

## Setup and Installation

### 1. Clone the Repository

```bash
git clone <repository_url>
cd <repository_name>
```

### 2. Backend Setup (Local Development)

- Navigate to the `backend` directory:
  ```bash
  cd backend
  ```
- Create a Python virtual environment (optional but recommended):

  ```bash
  # Using venv
  python -m venv .venv
  source .venv/bin/activate  # On Windows: .venv\\Scripts\\activate

  # Or using uv
  uv venv
  source .venv/bin/activate # On Windows: .venv\\Scripts\\activate
  ```

- Install Python dependencies:

  ```bash
  # Using pip
  pip install -r requirements.txt

  # Or using uv
  uv pip install -r requirements.txt # or uv sync if pyproject.toml is fully configured
  ```

- Create a `.env` file in the `backend` directory by copying `.env.example` (if it exists, otherwise create it) and fill in your details:
  ```dotenv
  # backend/.env
  MONGO_URL="your_mongodb_connection_string"
  DB_NAME="your_database_name"
  GOOGLE_AI_API_KEY="your_google_ai_api_key"
  # Add other backend-specific environment variables if any
  ```

### 3. Frontend Setup (Local Development)

- Navigate to the `frontend` directory:
  ```bash
  cd frontend
  ```
- Install Node.js dependencies:
  ```bash
  yarn install
  ```
- Create a `.env` file in the `frontend` directory if needed for frontend-specific environment variables (e.g., `REACT_APP_API_URL`). By default, the frontend will try to connect to the API at the same host, proxied by Nginx in production or directly if run standalone. For local development, ensure your API calls point to the backend service (e.g., `http://localhost:8001/api`).
  Example `frontend/.env`:
  ```dotenv
  REACT_APP_API_BASE_URL=http://localhost:8001/api
  ```
  (You'll need to ensure your frontend code uses `process.env.REACT_APP_API_BASE_URL` for API calls).

## Running the Application

### 1. Using Docker (Recommended for Production-like Environment)

From the project root directory:

- **Build the Docker images:**

  ```bash
  docker build -t synthesis-tutor .
  ```

  _(Note: You might need to pass build arguments for `FRONTEND_ENV` if it's used dynamically in your Dockerfile, e.g., `docker build --build-arg FRONTEND_ENV="your_frontend_env_vars_here" -t synthesis-tutor .`)_

- **Run the Docker container:**
  The `Dockerfile` is set up to run Nginx, which serves the frontend and proxies the backend.
  Ensure your backend's `.env` variables (like `MONGO_URL`, `DB_NAME`, `GOOGLE_AI_API_KEY`) are available to the Docker container. This can be done by:

  1.  Modifying the `Dockerfile` to copy the `backend/.env` file (not recommended for sensitive data).
  2.  Passing environment variables at runtime using `docker run -e VAR_NAME=value ...`.
  3.  Using Docker Compose with an `env_file` directive.

  Example `docker run` command (assuming backend `.env` is handled, or variables passed):

  ```bash
  docker run -p 8080:8080 \
    -e MONGO_URL="your_mongodb_connection_string_for_docker" \
    -e DB_NAME="your_database_name" \
    -e GOOGLE_AI_API_KEY="your_google_ai_api_key" \
    synthesis-tutor
  ```

  The application should then be accessible at `http://localhost:8080`.

  _(A `docker-compose.yml` file would simplify this significantly by defining services, ports, and environment variable management.)_

### 2. Local Development (Running Frontend and Backend Separately)

- **Start the Backend Server:**
  Navigate to the `backend` directory and run:

  ```bash
  # Ensure your virtual environment is activated
  # Using Uvicorn directly
  uvicorn server:app --host 0.0.0.0 --port 8001 --reload

  # Or using uv
  uv run uvicorn server:app --host 0.0.0.0 --port 8001 --reload
  ```

  The backend API will be available at `http://localhost:8001`.

- **Start the Frontend Development Server:**
  Navigate to the `frontend` directory and run:
  ```bash
  yarn start
  ```
  The frontend will typically open at `http://localhost:3000` and will make API calls to the backend (ensure your API call configurations point to `http://localhost:8001/api` or are proxied correctly if using React's proxy feature in `package.json`).

## API Endpoints

The backend exposes the following main API endpoints under the `/api` prefix (e.g., `http://localhost:8001/api`):

- `GET /api/`: Root endpoint for the API.
- `POST /api/students`: Create a new student.
- `GET /api/students/{student_id}`: Get details for a specific student.
- `POST /api/messages`: Create a new message (student or tutor).
- `GET /api/messages/{student_id}`: Get all messages for a student.
- `POST /api/chat`: Interact with the AI tutor.
  - Body: `{ "student_id": "string", "message": "string", "context": [] }`
- `GET /api/modules`: Get a list of available learning modules.
- `POST /api/progress`: Update a student's progress on a module.
- `GET /api/progress/{student_id}`: Get a student's progress records.
- `POST /api/process-video-frame`: Process a video frame captured from the client.
  - Body: `{ "student_id": "string", "frame_data": "base64_encoded_string" }`

## Environment Variables

Ensure the following environment variables are set:

### Backend (`backend/.env`)

- `MONGO_URL`: MongoDB connection string.
- `DB_NAME`: MongoDB database name.
- `GOOGLE_AI_API_KEY`: API key for Google Generative AI.

### Frontend (`frontend/.env`)

- `REACT_APP_API_BASE_URL` (Optional, for explicitly setting API base URL if not using proxy): e.g., `http://localhost:8001/api`

## Known Issues & TODOs

- **Monolithic Frontend:** `frontend/src/App.js` contains a large amount of code and should be broken down into smaller, reusable components for better maintainability.
- **External Integrations:** The `backend/external_integrations/` directory is currently a placeholder. Integrations with services like Supabase, AWS, Redis, etc. (listed in `requirements.txt`) need to be implemented or clarified if handled elsewhere.
- **Dual `requirements.txt`:** The project has `requirements.txt` in both the root and `backend/` directories. Clarify their distinct purposes and streamline dependency management if possible. The Dockerfile primarily uses the root `requirements.txt` for the final Python environment.
- **Error Handling & Validation:** Enhance error handling and input validation across frontend and backend.
- **Testing:** Expand test coverage for both frontend and backend functionalities.
- **Security:**
  - Review and secure all API endpoints.
  - The `gha-creds-*.json` file in the root directory might contain sensitive information and should be added to `.gitignore` if it's not already and if it's not intended to be committed.
- **Docker Compose:** Add a `docker-compose.yml` for easier local development and multi-container orchestration.
- **Frontend Environment Variables in Docker:** The `FRONTEND_ENV` build argument in the `Dockerfile` needs to be properly managed if dynamic frontend environment variables are required at build time.

---

This README provides a starting point. Feel free to expand on sections, add more specific details, or include contribution guidelines as the project evolves.

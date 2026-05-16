# ServiceHive - Smart Leads Dashboard

A full-stack Lead Management Dashboard built with the MERN stack (MongoDB, Express, React, Node.js) and TypeScript.

## Features
- **Authentication**: JWT-based login/registration with RBAC (Admin/Sales).
- **Leads CRUD**: Create, view, update, and delete leads.
- **Advanced Filtering**: Search by name/email, filter by status and source.
- **Pagination**: Efficient backend-driven pagination.
- **CSV Export**: Export lead data to CSV.
- **Dark Mode**: Premium UI with dark mode support.
- **Docker**: Containerized setup for easy deployment.

## Tech Stack
- **Frontend**: React, TypeScript, Tailwind CSS.
- **Backend**: Node.js, Express, TypeScript, MongoDB, Mongoose.
- **Tools**: Docker, Docker Compose.

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (or Docker)

### Installation

1. **Clone the repository**
2. **Setup Backend**
   ```bash
   cd server
   npm install
   # Configure .env
   npm run dev
   ```
3. **Setup Frontend**
   ```bash
   cd client/frontend
   npm install
   npm run dev
   ```

### Docker Setup
To run the entire stack using Docker:
```bash
docker-compose up --build
```

## API Documentation
- `POST /api/auth/register`: Register a new user
- `POST /api/auth/login`: User login
- `GET /api/leads`: Fetch paginated leads with filters
- `POST /api/leads`: Create a new lead
- `PUT /api/leads/:id`: Update a lead
- `DELETE /api/leads/:id`: Delete a lead (Admin only)
- `GET /api/leads/export`: Download leads as CSV

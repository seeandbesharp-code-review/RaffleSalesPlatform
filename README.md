# TrickyTray

## Project Overview

TrickyTray is a full-stack raffle management system developed as a final project.
The system enables users to register, log in, browse gifts, add raffle tickets to a shopping cart, confirm orders, and participate in prize drawings.

Administrators can manage gifts, donors, system state, and raffle results.

---

## Technologies Used

### Backend
- ASP.NET Core Web API (.NET 8)
- Entity Framework Core
- SQL Server
- JWT Authentication
- Role-Based Authorization
- Redis Distributed Cache
- Rate Limiting
- Swagger / OpenAPI

### Frontend
- Angular

### DevOps
- Docker
- Docker Compose
- Nginx Load Balancer

### Database Technologies
- SQL Server (primary relational database)
- MongoDB + MongoDB Compass (NoSQL exercise)

### AI-Assisted Development
- GitHub Copilot Instructions
- Custom Copilot Agent

---

## Main Features

### User Features
- User registration and login
- JWT authentication
- Browse gifts
- Add gifts to cart
- Confirm orders
- View order history

### Admin Features
- Manage gifts
- Manage donors
- Start raffle sales
- Finish raffle sales
- Run raffle drawing
- View winners report
- Reset system state

### Infrastructure Features
- Redis caching
- API rate limiting
- Docker containerization
- Load balancing with Nginx

---

## System State Management

The raffle system supports three operational states:

- **Draft** – Initial state, editing is allowed.
- **Active** – Users can purchase raffle tickets.
- **Finished** – Sales are closed and winners are selected.

---

## Project Structure

```text
TrickyTray/
├── TrickyTrayAPI/
│   ├── TrickyTrayAPI/
│   │   ├── Controllers/
│   │   ├── Services/
│   │   ├── Repositories/
│   │   ├── DTOs/
│   │   ├── Models/
│   │   ├── Data/
│   │   ├── Migrations/
│   │   ├── Program.cs
│   │   └── appsettings.json
│   └── TrickyTrayAPI.sln
│
├── TrickyTrayClient/
│
├── .github/
│   ├── instructions/
│   │   ├── general.instructions.md
│   │   ├── controllers.instructions.md
│   │   └── repositories.instructions.md
│   └── agents/
│       └── api-architect.agent.md
│
├── docs/
│   ├── microservices-design.md
│   └── mongo-queries.md
│
├── nginx/
│   └── nginx.conf
│
├── Dockerfile
├── docker-compose.yml
├── README.md
└── .gitignore
```

---

## Backend Architecture

The backend follows a layered architecture:

### Controllers
Handle HTTP requests and responses.

### Services
Contain business logic and orchestration.

### Repositories
Handle database access using Entity Framework Core.

### DTOs
Define request and response models.

### Models
Represent domain entities.

---

## Authentication and Authorization

- JWT-based authentication
- Role-based authorization
- Roles:
  - `User`
  - `Admin`

---

## Redis Caching

Redis is used to cache frequently accessed data, such as the gifts list, improving API performance and reducing database load.

---

## Rate Limiting

The API includes rate limiting to prevent excessive requests and improve system stability.

---

## Load Balancer

Nginx is configured as a load balancer and reverse proxy.

---

## Docker Support

The project includes:

- `Dockerfile`
- `docker-compose.yml`

Docker Compose starts:
- ASP.NET Core API
- Redis
- Nginx

### Run with Docker

```bash
docker compose -p trickytray up --build
```

---

## Backend Setup

1. Open `TrickyTrayAPI/TrickyTrayAPI.sln`.
2. Configure the connection string in `appsettings.json`.
3. Run:

```bash
dotnet ef database update
dotnet build
dotnet run
```

4. Open Swagger UI.

---

## Frontend Setup

1. Navigate to the client folder.
2. Install dependencies:

```bash
npm install
```

3. Run the Angular application:

```bash
ng serve
```

---

## MongoDB Exercise

As part of the course requirements, the relational database was converted to MongoDB.

### Database Name
`TrickyTrayMongo`

### Collections
- buyers
- donors
- gifts
- orders

### Files
- `docs/mongo-queries.md`
- `docs/screenshots/`

---

## Documentation Files

### GitHub Copilot Instructions
- `.github/instructions/general.instructions.md`
- `.github/instructions/controllers.instructions.md`
- `.github/instructions/repositories.instructions.md`

### Custom Copilot Agent
- `.github/agents/api-architect.agent.md`

### Architecture Documentation
- `docs/microservices-design.md`

### MongoDB Documentation
- `docs/mongo-queries.md`

---

## Future Improvements

- Unit tests
- Integration tests
- Email notifications
- Monitoring and observability
- CI/CD pipeline

---

## Summary

TrickyTray is a complete full-stack raffle management system that combines:

- ASP.NET Core Web API
- Angular
- SQL Server
- Redis
- Docker
- Nginx
- MongoDB
- GitHub Copilot custom instructions

The project demonstrates clean architecture principles, scalable infrastructure, and modern development practices.
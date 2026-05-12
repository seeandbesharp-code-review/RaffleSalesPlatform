# GitHub Copilot Instructions for TrickyTray

This repository contains the TrickyTray raffle platform, a full-stack application with an ASP.NET Core backend and an Angular frontend.

## Project Overview

TrickyTray is a raffle system that supports:
- User registration and login
- Role-based access control for buyers and donors
- Shopping cart and order confirmation
- Raffle drawing and winners reporting
- System state management: Draft, Active, Finished

## Backend Stack

The backend is implemented with:
- ASP.NET Core Web API
- Entity Framework Core
- SQL Server
- JWT-based authentication
- Role-based authorization
- Swagger / OpenAPI for API documentation

## Frontend Stack

The frontend is implemented with Angular.

## Architecture and Organization

Key architectural layers in the backend:
- Controllers: HTTP endpoints and request handling
- Services: business logic and orchestration
- Repositories: data access and persistence
- DTOs: data transfer objects for API contracts
- Entities / Models: database entities and domain objects

## Main Domain Entities

Primary entities used by TrickyTray:
- Buyer
- Donor
- Gift
- Order
- OrderGift

## Key Features and Responsibilities

### Authentication and Authorization
- Support user signup/login flows
- Issue JWT tokens for authenticated requests
- Enforce role-based authorization for protected APIs

### Shopping and Orders
- Manage buyer shopping cart operations
- Confirm and create orders
- Track associated order gifts

### Raffle and Reporting
- Execute raffle logic and determine winners
- Provide winner reports and raffle summaries

### System State Management
- Track the raffle lifecycle with states:
  - Draft
  - Active
  - Finished

## Guidance for Copilot

When generating or improving code for this repository, follow these principles:
- Keep backend code aligned with ASP.NET Core Web API conventions
- Use DTOs for API request/response models and avoid leaking entity classes in controllers
- Keep business logic inside services, not directly in controllers
- Keep data access in repository classes and use EF Core via the DbContext
- Maintain role-based authorization attributes on protected endpoints
- Keep Swagger annotations and endpoint documentation consistent
- Respect the raffle system workflow and system state transitions

## Recommended Files and Folders

- `TrickyTrayAPI/Program.cs`
- `TrickyTrayAPI/Controllers/`
- `TrickyTrayAPI/Services/`
- `TrickyTrayAPI/Repositories/`
- `TrickyTrayAPI/DTOs/`
- `TrickyTrayAPI/Models/`
- `TrickyTrayClient/`

## Notes

- Do not change the core raffle state values unless the workflow also updates all related transitions.
- Keep authentication and authorization logic consistent across API endpoints.
- Prefer explicit typing and clear naming for DTOs and entity classes.

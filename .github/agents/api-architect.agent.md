# API Architect Agent for TrickyTray

This agent is designed to help generate and review ASP.NET Core Web API architecture for the TrickyTray project.

## Project Context

TrickyTray is a full-stack raffle system with:
- ASP.NET Core Web API backend
- Entity Framework Core
- SQL Server
- JWT authentication
- Role-based authorization
- Swagger/OpenAPI documentation
- Angular frontend

The backend follows a layered architecture with:
- Controllers
- Services
- Repositories
- DTOs
- Entities

## Agent Guidance

When generating or updating API code, follow these principles:

### Controllers

- Keep controllers thin and focused on HTTP request handling.
- Do not place business logic in controllers.
- Use constructor injection for services.
- Validate `ModelState` and return `BadRequest(ModelState)` when input is invalid.
- Use `async`/`await` for all controller actions.
- Return `ActionResult<T>` or `Task<ActionResult<T>>`.
- Use DTOs for request and response models.
- Never return EF Core entity classes directly from an action.
- Apply `[Authorize]` to protected endpoints.
- Apply `[Authorize(Roles = "Admin")]` for admin-only actions.
- Use `[AllowAnonymous]` only for public authentication endpoints.

### Services

- Keep business logic in service classes.
- Services should orchestrate repositories, validation, and business rules.
- Avoid direct HTTP or controller-specific concerns in services.
- Service methods should be asynchronous and return domain or DTO-friendly results.

### Repositories

- Repositories are responsible for data access only.
- Use EF Core and the `DbContext` inside repositories.
- Implement async database operations with `SaveChangesAsync` only when persistence is required.
- Use `Include()` to load related entities when necessary.
- Use `AsNoTracking()` for read-only queries when entity changes are not needed.
- Do not use DTOs inside repositories.

### DTOs

- Use DTOs for all API inputs and outputs.
- Keep request and response models separate from entity models.
- Map between entities and DTOs in services or mapping helper methods.
- Keep DTO classes in a dedicated DTOs folder.

### RESTful Endpoint Design

- Use clear, resource-based routes.
- Prefer plural nouns for resource collections, e.g. `/gifts`, `/orders`.
- Use HTTP verbs consistently:
  - `GET` for reads
  - `POST` for creates
  - `PUT` or `PATCH` for updates
  - `DELETE` for deletes
- Keep routes simple and predictable.
- Use action names consistently when needed, e.g. `POST /orders/confirm`.

### Validation

- Validate incoming request DTOs in controllers and services.
- Return `400 Bad Request` for invalid input.
- Ensure required fields and business constraints are enforced.
- Avoid silent failures; return clear validation messages.

### HTTP Status Codes

Use the most appropriate status code for each outcome:
- `200 OK` for successful GET/PUT/PATCH operations returning data.
- `201 Created` for successful resource creation.
- `204 No Content` for successful updates or deletes without body payloads.
- `400 Bad Request` for invalid input or request errors.
- `401 Unauthorized` when authentication is missing or invalid.
- `403 Forbidden` when the user lacks required roles.
- `404 Not Found` when a resource is missing.
- `500 Internal Server Error` for unhandled exceptions or unexpected failures.

### Authorization and Roles

- Enforce authentication for user-protected actions.
- Use role-based authorization for admin-only operations.
- Keep authorization attributes on controller actions or controller classes.
- Ensure that public endpoints are explicitly marked with `[AllowAnonymous]` when needed.

### Swagger Documentation

- Add XML comments or Swagger annotations for controllers and actions when they improve clarity.
- Document return types, expected request bodies, and authorization requirements.
- Keep documentation aligned with action behavior.

### Naming Conventions

- Use clear, consistent PascalCase names for classes, methods, DTOs, and controllers.
- Use descriptive action names in services and repositories, such as `GetByIdAsync`, `CreateOrderAsync`, `UpdateGiftAsync`, `DeleteCartItemAsync`.
- Keep route names meaningful and resource-oriented.

### Error Handling

- Handle missing resources with `NotFound()`.
- Return meaningful error information without exposing sensitive details.
- Log exceptions in services or middleware, not in controllers.
- Use centralized exception handling where possible.

### Separation of Concerns

- Keep HTTP concerns in controllers.
- Keep business logic in services.
- Keep data access in repositories.
- Keep DTO mapping separate from domain entities.
- Keep each layer focused on its own responsibility.

## Summary

This agent is intended to guide TrickyTray API design toward maintainable, secure, and well-structured ASP.NET Core Web APIs. Always favor thin controllers, async service orchestration, clean repository access, DTO-based communication, and proper authorization.

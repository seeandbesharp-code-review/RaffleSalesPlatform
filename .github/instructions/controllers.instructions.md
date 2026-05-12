# Controllers Instructions for TrickyTray

This document defines best practices for ASP.NET Core Web API controllers in the TrickyTray project.

## Controller Responsibilities

Controllers should be thin and focused on HTTP handling only.

- Accept HTTP requests and route them to the correct service methods.
- Validate input and `ModelState`.
- Map DTOs to service parameters and service results to DTO responses.
- Return appropriate `ActionResult<T>` values.
- Set the correct HTTP status codes.
- Add authorization attributes for protected endpoints.
- Do not contain business logic.
- Do not directly manipulate the database or EF Core entities.

## Use DTOs Everywhere

- Request objects must be DTOs, not entity models.
- Response objects must be DTOs, not EF Core entity classes.
- Never expose domain entities or database models from controller actions.
- Keep DTOs in `TrickyTrayAPI/DTOs/` and use them consistently.

## Authorization Rules

- Use `[AllowAnonymous]` only for public endpoints such as login and registration.
- Use `[Authorize]` for endpoints that require an authenticated user.
- Use role-based authorization for admin-level actions, e.g. `[Authorize(Roles = "Admin")]`.
- Ensure the authorization policy matches the intended access level for each controller.

## Action Result and Status Codes

Always return `ActionResult<T>` for typed responses.
Use appropriate HTTP status codes:

- `200 OK` for successful reads and updates returning data.
- `201 Created` for successful create operations.
- `204 No Content` when an update or delete succeeds without a response body.
- `400 Bad Request` for invalid input or model validation failures.
- `401 Unauthorized` when the user is not authenticated.
- `403 Forbidden` when the user is authenticated but not authorized.
- `404 Not Found` when the requested resource does not exist.
- `500 Internal Server Error` for unexpected failures.

## Validation and Error Handling

- Validate `ModelState` at the beginning of each action.
- Return `BadRequest(ModelState)` if validation fails.
- Handle missing resources with `NotFound()`.
- Prefer `Ok(...)`, `CreatedAtAction(...)`, `NoContent()`, `BadRequest(...)`, `Unauthorized()`, and `Forbid()`.
- Do not return raw exceptions from controllers.

## Async Programming

- Use `async` and `await` for all controller actions that call asynchronous services.
- Return `Task<ActionResult<T>>` or `Task<IActionResult>`.
- Avoid blocking calls such as `.Result` or `.Wait()`.

## RESTful Endpoint Design

- Keep endpoints RESTful and clearly named.
- Use HTTP verbs consistently:
  - `GET` for reads
  - `POST` for creates
  - `PUT`/`PATCH` for updates
  - `DELETE` for deletes
- Use plural resource names where appropriate (`/gifts`, `/orders`).
- Do not overload routes with non-resource actions when a resource-style path is available.

## Swagger Documentation

- Add XML comments or Swagger annotations when it improves clarity.
- Document the purpose of endpoints, expected request body, and response types.
- Keep documentation aligned with actual action behavior.

## Example Patterns

Preferred controller patterns:

- Inject services in the constructor.
- Call service methods from actions.
- Map service results to DTO responses.
- Return the proper HTTP response.

Bad pattern to avoid:
- Putting business logic, validation rules, or repository calls directly in the controller.
- Returning entity objects from controller actions.
- Using non-async calls or ignoring `ModelState`.

## Summary

Controllers in TrickyTray should be small, explicit, and delegated.
Keep HTTP and authentication handling in controllers, and keep business and domain logic in services.
Use DTOs for all request and response models, return explicit `ActionResult<T>`, and apply role-based authorization cleanly.

# Repositories Instructions for TrickyTray

This document defines best practices for Repository classes in the TrickyTray ASP.NET Core Web API backend.

## Purpose of Repositories

Repository classes are responsible only for data access.
They should interface with Entity Framework Core and the `DbContext`.
Repositories should never contain business logic, validation rules, or application workflows.

## Design Principles

- Keep repositories focused on querying, inserting, updating, and deleting data.
- Use async/await for all database operations.
- Do not use DTOs inside repository classes; return entity models or simple query results.
- Call `SaveChangesAsync` only when the repository is explicitly responsible for persistence.
- Keep queries clear, optimized, and maintainable.
- Handle null or missing results gracefully.

## Entity Framework Core Usage

- Use the application `DbContext` for all data access.
- Use `Include()` when related entities are required by the service layer.
- Use `AsNoTracking()` for read-only queries when entities are not going to be modified.
- Avoid eager loading unrelated data.
- Prefer expressive query methods that are easy to understand and maintain.

## Method Naming

Repository method names should clearly describe their intent. Examples:

- `GetByIdAsync`
- `GetAllAsync`
- `AddAsync`
- `UpdateAsync`
- `DeleteAsync`
- `FindBy...Async`
- `GetActive...Async`

## Return Values

- Return entity objects or query results to the Service layer.
- Do not map to DTOs inside the repository.
- Use null or empty collections to represent missing or absent data as appropriate.
- Avoid returning database context state objects or tracking proxies to higher layers unless intentionally needed.

## Persistence Strategy

- Repositories should commit changes only if they own the persistence operation.
- Where unit-of-work or transaction coordination is required, the service layer should coordinate multiple repository operations.
- Prefer repository-level `AddAsync`, `Update`, and `Delete` methods for single-entity persistence.

## Error Handling and Null Safety

- Validate input parameters at the repository level where appropriate.
- Return `null` for missing single-entity queries like `GetByIdAsync`.
- Return empty collections instead of `null` for list queries when no items are found.
- Keep exception handling minimal so that service layer can decide how to react to failures.

## Example Expectations

Good repository behavior:
- `Task<Gift?> GetByIdAsync(int id)` returns an entity or `null`.
- `Task<IEnumerable<Order>> GetAllAsync()` returns a collection.
- `Task AddAsync(Donor donor)` adds the entity to the context asynchronously.
- `Task DeleteAsync(int id)` removes the entity by key.

Bad repository behavior:
- Containing business rules or validation logic.
- Returning DTOs or view models.
- Performing HTTP or UI concerns.
- Calling `SaveChangesAsync` for operations outside its responsibility.

## Summary

Repositories in TrickyTray should be simple, data-focused, and EF Core-native.
Keep them responsible for persistence only, support async queries with clear names, and return entity data to services cleanly.

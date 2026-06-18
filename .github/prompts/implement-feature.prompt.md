
Implement the following feature in the TrickyTray project:

Feature request: ${input:feature:Describe the feature that should be implemented}

Before changing any files:

1. Inspect the existing implementation and identify all relevant files.
2. Explain the current flow and the proposed change.
3. List the files that need to be created or modified.
4. Do not modify unrelated files.
5. Preserve existing working behavior unless the feature explicitly requires a change.

Follow the TrickyTray architecture:

* Controllers handle HTTP requests, authorization, validation, and status codes.
* Services contain business logic and workflow orchestration.
* Repositories contain Entity Framework Core data-access logic only.
* DTOs define API request and response contracts.
* Entity models must not be exposed directly from controllers.
* Angular services handle API calls.
* Angular components handle presentation and user interaction.
* Use async and await for database and network operations.
* Do not use `.Result` or `.Wait()`.

Backend requirements:

* Use dependency injection.
* Use appropriate `ActionResult` responses.
* Preserve JWT and role-based authorization.
* Respect the system states: Draft, Active, and Finished.
* Validate null values and missing resources.
* Avoid duplicate database queries.
* Use `AsNoTracking()` for read-only queries where appropriate.
* Keep business logic out of controllers and repositories.

System design requirements:

* Preserve Redis cache behavior and invalidate stale cache entries after updates.
* Do not retry non-idempotent client requests automatically.
* Preserve Kafka producer and consumer behavior.
* Do not publish a Kafka message until the related business operation succeeds.
* Preserve MongoDB document structures.
* Do not remove rate limiting.

Implementation process:

1. Present a short implementation plan.
2. Make the smallest safe change.
3. Provide complete file contents for every changed file.
4. Explain what changed in each file and why.
5. Build the affected projects.
6. Report build errors and warnings separately.
7. Describe how to test the feature manually.

Do not invent classes, endpoints, database fields, or project paths without first verifying that they exist.

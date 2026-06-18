
Review the following TrickyTray implementation:

Review target: ${input:target:Describe the feature, folder, or files to review}

Do not modify files during the initial review.

Inspect the existing code and report findings under these sections:

## 1. Functional Correctness

* Does the implementation satisfy its stated requirement?
* Are success and failure flows handled?
* Are null values and missing resources handled safely?
* Could the operation run twice or create duplicate data?
* Are asynchronous operations awaited correctly?

## 2. Architecture

Verify that:

* Controllers contain HTTP concerns only.
* Services contain business logic.
* Repositories contain data-access logic only.
* DTOs are used for API contracts.
* EF Core entities are not exposed directly from controllers.
* Angular components do not contain unnecessary API or persistence logic.

## 3. Authentication and Authorization

Verify that:

* Public endpoints use `[AllowAnonymous]` only when appropriate.
* Protected endpoints use `[Authorize]`.
* Administrative operations use the correct project role value.
* JWT handling is consistent between the API and Angular client.
* Sensitive values are not logged.

## 4. Redis

Verify that:

* Read operations use the cache appropriately.
* Cache misses fall back to the database.
* Cache entries have an expiration.
* Create, update, and delete operations invalidate stale cache entries.
* Cache failure does not silently corrupt application data.

## 5. Kafka

Verify that:

* The producer uses `ProducerBuilder` and `ProducerConfig`.
* Kafka settings come from configuration.
* Messages contain all relevant business data.
* Messages are published from the service layer.
* The consumer uses a stable GroupId.
* Offsets are committed only after successful processing.
* Producer and consumer errors are logged.

## 6. MongoDB

Verify that:

* MongoDB runs through Docker Compose.
* Data is stored as documents.
* Nested objects or arrays are used where appropriate.
* MongoDB Compass can connect to the Docker instance.
* Persistent Docker volumes are configured.

## 7. Client Retry

Verify that:

* Retry is applied only to safe and idempotent requests such as GET.
* POST, PUT, PATCH, and DELETE are not automatically retried.
* Retry is limited.
* Retry uses a delay or exponential backoff.
* Authentication and validation errors are not retried.

## 8. Rate Limiting

Verify that:

* Rate limiting is registered and enabled.
* Protected endpoints are covered by the configured policy.
* Excess requests return HTTP 429.

## 9. Maintainability

Check for:

* Duplicate code.
* Unused imports.
* Misleading names.
* Incorrect file placement.
* Blocking calls.
* Overly large methods.
* Hard-coded configuration values.
* Missing logging.
* Nullable-reference warnings.

## Required Output

Return:

1. A checklist of requirements that pass.
2. A checklist of requirements that fail.
3. Critical issues that must be fixed before submission.
4. Optional improvements that should not block submission.
5. The exact files involved in each issue.
6. Do not suggest rewriting working code unless there is a concrete defect or unmet requirement.

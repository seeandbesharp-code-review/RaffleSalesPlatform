# TrickyTray Microservices Design Document

## 1. Purpose of the Document

This document provides a high-level microservices design proposal for the TrickyTray raffle platform. It is intended as a planning guide only and does not implement microservices. The goal is to outline a feasible service decomposition, data ownership, communication patterns, benefits, challenges, and a migration strategy from the current monolithic architecture.

## 2. Current Architecture Overview

TrickyTray is currently implemented as a monolithic ASP.NET Core Web API backend with an Angular frontend. The backend is organized into:

- Controllers for HTTP endpoint handling
- Services for business logic
- Repositories for data access
- DTOs for API request and response models
- Entity models for persistence

The backend uses Entity Framework Core with SQL Server, JWT authentication, role-based authorization, and Swagger for API documentation.

Core domain entities include:

- Buyer
- Donor
- Gift
- Order
- OrderGift

Key application functionality:

- User registration and login
- JWT authentication
- Admin and user roles
- Gift and donor management
- Shopping cart
- Order confirmation
- Raffle drawing
- Winners report
- System state management (Draft, Active, Finished)

## 3. Suggested Microservices Split

The proposed service decomposition divides the application into domain-aligned services with clear ownership boundaries:

- Identity Service
- Catalog Service
- Cart Service
- Order Service
- Raffle Service
- System State Service
- Notification Service

## 4. Explanation of Each Service

### Identity Service

**Purpose:** Manage authentication, authorization, and user identity data.

**Responsibilities:**

- User registration and login
- JWT token creation and validation
- Role management for Admin and Buyer roles
- User profile and account management

**Notes:**

- This service is the authority for user credentials and claims.
- It should expose secure authentication endpoints and token introspection if needed.

### Catalog Service

**Purpose:** Manage donors, gifts, and catalog information.

**Responsibilities:**

- Donor registration and profile management
- Gift creation, update, and retrieval
- Gift availability and metadata management
- Admin-only catalog administration endpoints

**Notes:**

- This service owns the domain entities involved in raffle items.
- It should provide query endpoints for gift browsing and donor details.

### Cart Service

**Purpose:** Manage buyer shopping cart operations.

**Responsibilities:**

- Add and remove gifts to cart
- Retrieve current cart contents
- Validate cart state before checkout
- Maintain temporary cart session data for buyers

**Notes:**

- The Cart Service acts as a storefront session manager and coordinates with Catalog and Identity services for validation.

### Order Service

**Purpose:** Manage orders, checkout, and order persistence.

**Responsibilities:**

- Confirm orders from cart contents
- Persist order and `OrderGift` associations
- Provide order history and order details
- Expose endpoints for order status and retrieval

**Notes:**

- This service owns `Order` and `OrderGift` persistence.
- It may consume Cart Service events or API data to finalize checkout.

### Raffle Service

**Purpose:** Manage raffle execution and winner selection.

**Responsibilities:**

- Run raffle drawing logic
- Select winners from eligible orders and gifts
- Generate winners reports and summaries
- Expose raffle results for reporting

**Notes:**

- The Raffle Service handles the domain logic for drawing and reporting without owning user identity or catalog details.
- It should coordinate with Order and Catalog services for eligibility and gift information.

### System State Service

**Purpose:** Manage global system lifecycle state.

**Responsibilities:**

- Track and expose the raffle system state: Draft, Active, Finished
- Control state transitions and enforce state constraints
- Provide state status for UI and other services

**Notes:**

- This service centralizes the state machine for the raffle lifecycle.
- It can publish state change events for other services to react when the raffle activates or finishes.

### Notification Service

**Purpose:** Deliver event-driven notifications and messages.

**Responsibilities:**

- Send email or in-app notifications for registration, order confirmation, winner announcements, and state changes
- Subscribe to relevant events from Identity, Order, Raffle, and System State services
- Provide a lightweight notification API or webhook interface

**Notes:**

- This service is optional but recommended for separating communication concerns.
- It can be implemented as asynchronous event listeners or queued message processors.

## 5. Suggested Database Ownership for Each Service

Each service should own its own database/schema to preserve autonomy and reduce coupling.

- Identity Service: Identity database for users, roles, and credentials
- Catalog Service: Catalog database for donors and gifts
- Cart Service: Cart database for temporary cart sessions and selections
- Order Service: Order database for orders and order gift associations
- Raffle Service: Raffle database for drawings, results, and reports
- System State Service: State database for current system lifecycle state
- Notification Service: Notification database for delivery logs and message queue tracking

## 6. Communication Between Services

### Synchronous Communication

- API calls for direct validation and data retrieval when immediate responses are required
- Examples:
  - Cart Service validates gift availability with Catalog Service
  - Order Service retrieves buyer identity or cart summary during checkout

### Asynchronous Communication

- Event-driven patterns for state changes and cross-service notifications
- Examples:
  - Identity Service emits user registration events
  - Order Service publishes order created events
  - System State Service broadcasts raffle activation or finish events
  - Raffle Service publishes winner announcement events

### Integration Patterns

- Use lightweight REST APIs for service-to-service requests
- Use message broker or pub/sub for events (optional planning level)
- Prefer eventual consistency when complete transactional boundaries cannot be maintained across services

## 7. Advantages of This Split

- Improved modularity and separation of concerns
- Better scalability by service domain
- Easier team ownership and independent deployment
- Clearer data ownership and reduced coupling
- More resilient failure isolation across services
- Simplified service responsibilities for evolving raffle logic

## 8. Challenges and Risks

- Increased operational complexity compared to a monolith
- More complex deployment and monitoring requirements
- Need for distributed tracing and centralized logging
- Data consistency and transaction management across service boundaries
- Potential latency from service-to-service communication
- Higher effort for cross-cutting concerns such as authentication and authorization

## 9. Migration Strategy from Monolith to Microservices

1. **Identify service boundaries**: Start with the proposed service split.
2. **Extract read-only APIs**: Publish stable catalog and identity endpoints first.
3. **Introduce service contracts**: Build service-level DTOs and API contracts for integration.
4. **Incrementally extract functionality**: Move one domain area at a time, such as Catalog or Cart.
5. **Maintain the monolith as a gateway**: Use the existing Web API as a facade while extracting backend services.
6. **Synchronize data carefully**: Use event publishing or data replication for cross-service updates during transition.
7. **Test each service in isolation**: Validate behavior with integration tests and service mocks.
8. **Shift authorization to Identity Service**: Centralize authentication and token validation early.
9. **Refactor client-side integration**: Update Angular calls to target new service endpoints gradually.
10. **Monitor and validate**: Track service health, performance, and consistency during migration.

## 10. Summary

This document proposes a conceptual microservices design for TrickyTray while keeping the current monolithic architecture intact. The suggested service split focuses on identity, catalog, cart, order, raffle, system state, and notifications.

The design aims to preserve clear ownership boundaries, support independent evolution, and enable eventual scaling if the application grows. The migration approach is incremental and emphasizes careful data coordination, service contracts, and observability.

# High-Level Design (HLD)

## AI Campus Complaint Management System

**Version:** 1.0

------------------------------------------------------------------------

## 1. Architecture Overview

The application follows a layered full-stack architecture:

``` text
+-----------------------------+
|        React Frontend       |
|  UI / Forms / Dashboard     |
+--------------+--------------+
               |
               | HTTP / REST API
               v
+-----------------------------+
|      Node.js + Express      |
| Routes / Controllers        |
| Middleware / Services       |
+------+------------+---------+
       |            |
       |            |
       v            v
+-------------+   +----------------+
|  MongoDB    |   |   LLM API      |
| Mongoose    |   | Gemini/LLM     |
+-------------+   +----------------+

Additional academic demonstrations:
+------------------------------------------+
| SQL Schema + Seed + JOIN demonstrations |
| JS Event Loop / Hoisting / Promises     |
+------------------------------------------+
```

------------------------------------------------------------------------

## 2. Main Components

### Frontend

Responsible for:

-   User interface
-   Authentication screens
-   Complaint creation
-   Complaint listing
-   Complaint details
-   Administrative views
-   API communication

Technology:

-   React
-   Vite
-   JavaScript
-   CSS/UI libraries as configured by the project

### Backend

Responsible for:

-   REST API
-   Authentication
-   Authorization
-   Validation
-   Complaint business logic
-   Database operations
-   AI integration
-   Error handling
-   File upload processing

Technology:

-   Node.js
-   Express
-   JavaScript
-   Mongoose

### Database

MongoDB is the primary application database.

Mongoose provides:

-   Schemas
-   Models
-   Validation
-   References
-   CRUD operations

### AI Service

The backend communicates with an external LLM API.

The service receives complaint information and requests a structured
analysis.

### SQL Demonstration Layer

The repository also contains SQL files demonstrating relational design:

``` text
schema.sql
seed.sql
joins.sql
README.md
```

This layer is an academic demonstration and does not replace the
application's MongoDB operational database.

------------------------------------------------------------------------

## 3. Request Flow

### Complaint Creation

``` text
Student
   |
   v
React Form
   |
   v
POST /complaints
   |
   v
Authentication Middleware
   |
   v
Validation Middleware
   |
   v
Complaint Controller
   |
   +------> MongoDB
   |
   +------> LLM Service
                |
                v
             AI JSON
                |
                v
          Parse / Validate
                |
                v
        Store AI analysis
                |
                v
          API Response
                |
                v
             Frontend
```

------------------------------------------------------------------------

## 4. Authentication Flow

``` text
User
 |
 | Login
 v
Auth Route
 |
 v
Credential Verification
 |
 v
JWT Generation
 |
 v
Frontend stores authentication state
 |
 v
Authenticated API Request
 |
 v
authMiddleware
 |
 +---- invalid --> 401
 |
 +---- valid ----> next()
```

------------------------------------------------------------------------

## 5. Authorization Flow

``` text
Request
   |
   v
JWT Verification
   |
   v
User Identity
   |
   v
RBAC Middleware
   |
   +---- Student ----> student permissions
   |
   +---- Admin ------> admin permissions
```

------------------------------------------------------------------------

## 6. Middleware Architecture

The backend uses multiple middleware responsibilities.

### Authentication Middleware

Purpose:

-   Read authentication token
-   Verify token
-   Attach user information to request
-   Reject unauthorized requests

### RBAC Middleware

Purpose:

-   Check user role
-   Allow/reject protected operations

### Validation Middleware

Purpose:

-   Validate request data
-   Reject malformed input

### Upload Middleware

Purpose:

-   Process uploaded files
-   Restrict/prepare attachment handling

### Error Middleware

Purpose:

-   Catch errors
-   Return consistent API responses
-   Avoid leaking internal details

------------------------------------------------------------------------

## 7. AI Architecture

The AI integration is separated from the normal request-processing flow.

``` text
Complaint
    |
    v
Prompt Builder
    |
    v
LLM API
    |
    v
Model Response
    |
    v
JSON Parsing
    |
    v
Structured AI Object
    |
    +--> category
    +--> priority
    +--> summary
    +--> suggestedAction
```

### Prompt Engineering

The prompt gives the model:

-   Its role
-   Complaint content
-   Required fields
-   Expected output format
-   Rules for classification

The application does not blindly treat arbitrary model text as
application data.

------------------------------------------------------------------------

## 8. Structured Output Strategy

The expected AI response follows a JSON structure similar to:

``` json
{
  "category": "Hostel",
  "priority": "High",
  "summary": "Water supply issue in hostel",
  "suggestedAction": "Forward complaint to hostel maintenance"
}
```

The backend parses the response before using it.

This reduces ambiguity compared with storing an unrestricted
natural-language response.

------------------------------------------------------------------------

## 9. MongoDB Architecture

MongoDB stores application entities as documents.

Conceptual model:

``` text
User
 |
 | references
 v
Complaint
 |
 +--> AI Analysis
 |
 +--> Attachment
```

Mongoose models define:

-   Fields
-   Types
-   Required properties
-   Defaults
-   References
-   Timestamps

------------------------------------------------------------------------

## 10. CRUD Architecture

### Create

``` text
HTTP POST
   -> Controller
   -> Model.create()
   -> MongoDB
```

### Read

``` text
HTTP GET
   -> Controller
   -> Model.find()/findById()
   -> MongoDB
```

### Update

``` text
HTTP PATCH/PUT
   -> Controller
   -> Model.findByIdAndUpdate()
   -> MongoDB
```

### Delete

``` text
HTTP DELETE
   -> Controller
   -> Model.findByIdAndDelete()
   -> MongoDB
```

------------------------------------------------------------------------

## 11. Relational Database Design

The SQL demonstration represents a relational version of the system.

Example conceptual relationship:

``` text
DEPARTMENT
   |
   | 1 : N
   v
COMPLAINT
   |
   | N : 1
   v
USER
```

Primary keys uniquely identify records.

Foreign keys reference records in another table.

Example:

``` text
users
-----
id (PK)

departments
-----------
id (PK)

complaints
----------
id (PK)
user_id (FK -> users.id)
department_id (FK -> departments.id)
```

------------------------------------------------------------------------

## 12. SQL JOIN Architecture

JOINs combine related records.

Example:

``` text
users
  |
  | JOIN complaints.user_id = users.id
  v
complaints
  |
  | JOIN complaints.department_id = departments.id
  v
departments
```

The repository demonstrates SQL JOIN queries separately so the
relational concept is explicit.

------------------------------------------------------------------------

## 13. JavaScript Runtime Concepts

The project contains dedicated demonstrations for:

### Event Loop

``` text
Call Stack
     |
     +--> synchronous code
     |
     +--> Web/Node APIs
              |
              +--> Task Queue
              +--> Microtask Queue
```

The example demonstrates the difference in execution order between
synchronous code, promises/microtasks, and timers/macrotasks.

### Hoisting

The example demonstrates how JavaScript handles declarations before
execution.

It can compare:

-   `var`
-   Function declarations
-   `let`
-   `const`

### Promises vs Callbacks

The example compares:

``` text
Callback
  |
  v
Nested/asynchronous callback execution
```

with:

``` text
Promise
  |
  +--> then()
  +--> catch()
```

and modern:

``` text
async
  |
  v
await
```

------------------------------------------------------------------------

## 14. Deployment-Level View

For deployment, the architecture can be represented as:

``` text
User Browser
     |
     v
Frontend Hosting
     |
     v
Backend/API Server
   /       \
  v         v
MongoDB    LLM Provider
```

Environment variables hold sensitive configuration such as:

-   Database URL
-   JWT secret
-   LLM API key
-   Other service credentials

Secrets are not committed to Git.

------------------------------------------------------------------------

## 15. Scalability Considerations

If the application grows:

-   Add database indexes.
-   Add pagination to complaint lists.
-   Cache frequently accessed data.
-   Move AI calls to background jobs.
-   Add rate limiting.
-   Add centralized logging.
-   Add monitoring.
-   Add object storage for files.
-   Use a managed database.
-   Separate AI service from the API server.

------------------------------------------------------------------------

## 16. Security Design

Security controls include:

-   Authentication
-   Authorization
-   Password hashing
-   JWT verification
-   Request validation
-   Environment variables
-   Controlled error messages
-   Restricted admin routes
-   File validation

The LLM should never receive unnecessary sensitive user information.

------------------------------------------------------------------------

## 17. Technology Stack

  Layer               Technology
  ------------------- ---------------------------
  Frontend            React
  Build Tool          Vite
  Backend             Node.js
  API                 Express
  Database            MongoDB
  ODM                 Mongoose
  AI                  Gemini/LLM API
  Authentication      JWT
  Validation          Zod/validation middleware
  Version Control     Git + GitHub
  SQL Demonstration   Standard SQL

------------------------------------------------------------------------

## 18. Architectural Benefits

The architecture separates:

-   UI
-   API
-   middleware
-   business logic
-   database access
-   AI integration
-   documentation/demonstrations

This makes the project easier to test, explain, maintain, and extend.

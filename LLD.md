# Low-Level Design (LLD)

## AI Campus Complaint Management System

**Version:** 1.0

------------------------------------------------------------------------

## 1. Purpose

This document describes the internal implementation-level design of the
AI Campus Complaint Management System.

It explains the expected responsibilities of routes, controllers,
middleware, models, services, AI processing, SQL demonstrations, and
JavaScript concept demonstrations.

------------------------------------------------------------------------

## 2. Backend Directory Structure

``` text
backend/
├── src/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   └── js-concepts/
│       ├── eventLoop.js
│       ├── hoisting.js
│       └── promises-vs-callbacks.js
│
└── sql/
    ├── schema.sql
    ├── seed.sql
    ├── joins.sql
    └── README.md
```

------------------------------------------------------------------------

## 3. User Model

Conceptual fields:

``` text
User
----
_id
name
email
password
role
createdAt
updatedAt
```

### Constraints

-   Email should be unique.
-   Password must be hashed.
-   Role should be restricted to supported roles.
-   Timestamps should be maintained automatically where configured.

------------------------------------------------------------------------

## 4. Complaint Model

Conceptual fields:

``` text
Complaint
---------
_id
user
title
description
category
priority
status
aiAnalysis
attachment
createdAt
updatedAt
```

### Relationships

``` text
Complaint.user -> User._id
```

This is a MongoDB document reference, not a relational SQL foreign key.

### Suggested Status Values

``` text
Pending
In Progress
Resolved
Rejected
```

### Suggested Priority Values

``` text
Low
Medium
High
Critical
```

------------------------------------------------------------------------

## 5. AI Analysis Object

The AI result should conceptually contain:

``` text
AIAnalysis
----------
category
priority
summary
suggestedAction
```

Example:

``` json
{
  "category": "Infrastructure",
  "priority": "High",
  "summary": "Classroom projector is not functioning.",
  "suggestedAction": "Forward the complaint to campus IT support."
}
```

------------------------------------------------------------------------

## 6. Authentication Module

### Login Flow

``` text
POST /auth/login
       |
       v
Validate request
       |
       v
Find user
       |
       v
Compare password
       |
       v
Generate JWT
       |
       v
Return token
```

### Failure Cases

-   Missing email/password
-   User not found
-   Invalid password
-   Database failure

------------------------------------------------------------------------

## 7. Authentication Middleware

Pseudo-flow:

``` js
function authMiddleware(req, res, next) {
  const token = getTokenFromRequest(req);

  if (!token) {
    return res.status(401).json({
      message: "Authentication required"
    });
  }

  const decoded = verifyToken(token);

  req.user = decoded;

  next();
}
```

The real implementation may use the project's existing helper structure.

------------------------------------------------------------------------

## 8. RBAC Middleware

Concept:

``` js
function rbacMiddleware(allowedRoles) {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Forbidden"
      });
    }

    next();
  };
}
```

Example:

``` text
Admin Route
   |
   v
authMiddleware
   |
   v
rbacMiddleware(["admin"])
   |
   v
Controller
```

------------------------------------------------------------------------

## 9. Validation Middleware

Validation should happen before business logic.

``` text
Request
  |
  v
Schema Validation
  |
  +---- invalid ---> 400
  |
  +---- valid -----> Controller
```

Typical validation rules:

-   Required title
-   Required description
-   Valid IDs
-   Valid enum values
-   Valid email
-   Valid request structure

------------------------------------------------------------------------

## 10. Error Middleware

Centralized error handling follows the Express error middleware pattern.

Conceptual flow:

``` text
Route
  |
  v
Controller
  |
  +---- error ----> next(error)
                       |
                       v
                Error Middleware
                       |
                       v
                 JSON Response
```

The response should avoid exposing stack traces or secrets in
production.

------------------------------------------------------------------------

## 11. Complaint Controller

### Create Complaint

Conceptual algorithm:

``` text
1. Read authenticated user.
2. Read complaint fields.
3. Validate request.
4. Send relevant complaint information to AI service.
5. Receive AI response.
6. Parse structured response.
7. Validate AI fields.
8. Create complaint document.
9. Save to MongoDB.
10. Return created complaint.
```

### Read Complaints

``` text
1. Authenticate user.
2. Determine permitted scope.
3. Query MongoDB.
4. Apply filters/pagination if configured.
5. Return documents.
```

### Update Complaint

``` text
1. Authenticate user.
2. Check authorization.
3. Find complaint.
4. Validate update.
5. Apply update.
6. Return updated complaint.
```

### Delete Complaint

``` text
1. Authenticate user.
2. Check authorization.
3. Find complaint.
4. Delete document.
5. Return success response.
```

------------------------------------------------------------------------

## 12. AI Service

### Input

``` text
title
description
optional category/context
```

### Prompt Construction

Conceptually:

``` text
You are a campus complaint classifier.

Analyze the complaint.

Return only valid JSON with:
- category
- priority
- summary
- suggestedAction

Do not add markdown or explanatory text.
```

The exact prompt can be adapted to the current implementation.

### Processing

``` text
Complaint Data
      |
      v
Prompt
      |
      v
LLM API
      |
      v
Raw Response
      |
      v
Parse JSON
      |
      v
Validate Structure
      |
      v
AI Analysis Object
```

### AI Failure Handling

Possible failures:

-   Missing API key
-   Network error
-   Rate limit
-   Invalid model response
-   Invalid JSON
-   Service timeout

The application should handle these without crashing the Express server.

------------------------------------------------------------------------

## 13. Structured Output Validation

The system should treat the AI response as untrusted external data.

Validation concept:

``` text
AI Response
     |
     v
JSON.parse()
     |
     v
Object validation
     |
     +---- invalid ---> fallback/error
     |
     +---- valid -----> save/use
```

This is important because an LLM can return unexpected output.

------------------------------------------------------------------------

## 14. MongoDB CRUD Operations

### Create

``` js
const complaint = await Complaint.create(data);
```

### Read

``` js
const complaints = await Complaint.find();
```

or:

``` js
const complaint = await Complaint.findById(id);
```

### Update

``` js
const complaint = await Complaint.findByIdAndUpdate(
  id,
  updateData,
  { new: true }
);
```

### Delete

``` js
await Complaint.findByIdAndDelete(id);
```

These operations demonstrate MongoDB CRUD through Mongoose.

------------------------------------------------------------------------

## 15. MongoDB Schema Modeling

Schema design should define:

-   Data types
-   Required fields
-   Defaults
-   Enums
-   References
-   Timestamps

Example conceptual schema:

``` js
const complaintSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  title: {
    type: String,
    required: true
  },

  description: {
    type: String,
    required: true
  },

  status: {
    type: String,
    default: "Pending"
  },

  priority: String,
  category: String,
  aiAnalysis: Object
}, {
  timestamps: true
});
```

------------------------------------------------------------------------

## 16. Relational SQL Schema

The SQL demonstration models the system using normalized relational
tables.

Example:

``` sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL
);

CREATE TABLE departments (
    id INTEGER PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE complaints (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    department_id INTEGER,
    title VARCHAR(200) NOT NULL,
    status VARCHAR(50),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (department_id) REFERENCES departments(id)
);
```

### PK

`users.id`, `departments.id`, and `complaints.id` are primary keys.

### FK

`complaints.user_id` references `users.id`.

`complaints.department_id` references `departments.id`.

------------------------------------------------------------------------

## 17. SQL JOIN Implementation

### INNER JOIN

Returns matching records:

``` sql
SELECT
    c.id,
    c.title,
    u.name AS student
FROM complaints c
INNER JOIN users u
    ON c.user_id = u.id;
```

### Multi-table JOIN

``` sql
SELECT
    c.id,
    c.title,
    u.name AS student,
    d.name AS department
FROM complaints c
INNER JOIN users u
    ON c.user_id = u.id
LEFT JOIN departments d
    ON c.department_id = d.id;
```

### LEFT JOIN

Keeps complaints even when no department is assigned.

This demonstrates the practical difference between INNER JOIN and LEFT
JOIN.

------------------------------------------------------------------------

## 18. JavaScript Event Loop Demonstration

Example concept:

``` js
console.log("1");

setTimeout(() => {
  console.log("2");
}, 0);

Promise.resolve().then(() => {
  console.log("3");
});

console.log("4");
```

Expected output:

``` text
1
4
3
2
```

Reason:

1.  Synchronous statements execute first.
2.  Promise callbacks are microtasks.
3.  Timer callback is a macrotask/task.
4.  Microtasks are processed before the next macrotask.

------------------------------------------------------------------------

## 19. JavaScript Hoisting Demonstration

Example:

``` js
console.log(value);

var value = 10;
```

Conceptually, `var` declaration is hoisted, so the variable exists
before assignment.

The value before assignment is:

``` text
undefined
```

A `let`/`const` declaration behaves differently because accessing it
before initialization results in a temporal dead zone error.

Function declarations are also hoisted.

------------------------------------------------------------------------

## 20. Promises vs Callbacks

### Callback

``` js
function getData(callback) {
  setTimeout(() => {
    callback(null, "data");
  }, 1000);
}
```

Usage:

``` js
getData((error, data) => {
  if (error) {
    // handle error
    return;
  }

  console.log(data);
});
```

### Promise

``` js
function getData() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("data");
    }, 1000);
  });
}
```

Usage:

``` js
getData()
  .then(data => console.log(data))
  .catch(error => console.error(error));
```

### Async/Await

``` js
async function main() {
  try {
    const data = await getData();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}
```

------------------------------------------------------------------------

## 21. API Endpoint Design

Conceptual endpoints:

### Authentication

``` text
POST /api/auth/register
POST /api/auth/login
```

### Complaints

``` text
POST   /api/complaints
GET    /api/complaints
GET    /api/complaints/:id
PATCH  /api/complaints/:id
DELETE /api/complaints/:id
```

Actual endpoint names should follow the existing repository routes.

------------------------------------------------------------------------

## 22. HTTP Status Codes

  Situation                                          Status
  ----------------------------- ---------------------------
  Successful GET/POST                               200/201
  Invalid request                                       400
  Missing authentication                                401
  Insufficient permission                               403
  Resource not found                                    404
  Validation conflict                  409 where applicable
  Server error                                          500
  External AI/service failure     502/503 where appropriate

------------------------------------------------------------------------

## 23. Git Workflow

The repository demonstrates feature-based development.

Example:

``` text
main
 |
 +---- feature/javascript-concepts
 |          |
 |          +---- implementation/documentation commit
 |                     |
 |                     v
 |                  merge
 |
 +---- feature/sql-database
            |
            +---- implementation/documentation commit
                       |
                       v
                    merge
```

The current workflow should include meaningful commits and merged
feature branches.

Example commands:

``` bash
git checkout -b feature/javascript-concepts
git add .
git commit -m "feat: add JavaScript concept demonstrations"
git checkout main
git merge feature/javascript-concepts
```

And:

``` bash
git checkout -b feature/sql-database
git add .
git commit -m "feat: add SQL database demonstrations"
git checkout main
git merge feature/sql-database
```

------------------------------------------------------------------------

## 24. Environment Variables

Sensitive values should be stored in `.env`.

Conceptual variables:

``` text
MONGODB_URI=
JWT_SECRET=
GEMINI_API_KEY=
PORT=
```

The `.env` file must not be committed.

A `.env.example` should contain variable names without real secrets.

------------------------------------------------------------------------

## 25. Error Scenarios

### Database unavailable

``` text
Request
 -> Controller
 -> Database error
 -> Error middleware
 -> 500/503 response
```

### AI unavailable

``` text
Complaint
 -> AI service
 -> API error
 -> Controlled fallback/error
```

### Invalid AI JSON

``` text
LLM
 -> invalid response
 -> JSON parsing/validation failure
 -> controlled handling
```

### Unauthorized request

``` text
Request
 -> authMiddleware
 -> token invalid
 -> 401
```

### Forbidden request

``` text
Request
 -> authMiddleware
 -> RBAC middleware
 -> role rejected
 -> 403
```

------------------------------------------------------------------------

## 26. Testing Strategy

### Unit-Level

Test:

-   Utility functions
-   Validation
-   AI response parsing
-   JavaScript concept examples

### API-Level

Test:

-   Register
-   Login
-   Create complaint
-   Read complaint
-   Update complaint
-   Delete complaint
-   Unauthorized access
-   Forbidden access

### Database-Level

Verify:

-   CRUD
-   Required fields
-   References
-   SQL PK/FK constraints
-   SQL JOIN results

### Manual Demo

A reviewer should be able to:

1.  Start the application.
2.  Login/register.
3.  Create a complaint.
4.  Observe AI analysis.
5.  View the complaint.
6.  Update its status.
7.  Inspect MongoDB data.
8.  Open the SQL demonstration.
9.  Run JavaScript concept files.
10. Inspect Git branches and merge history.

------------------------------------------------------------------------

## 27. Concept Coverage Checklist

``` text
[ ] LLM API integration
[ ] Prompt engineering
[ ] Structured outputs
[ ] Middleware
[ ] Git workflow
[ ] JavaScript Event Loop
[ ] JavaScript Hoisting
[ ] Promises vs Callbacks
[ ] MongoDB CRUD
[ ] MongoDB Schema Modeling
[ ] Relational PK/FK
[ ] SQL JOINs
```

The final repository should keep this checklist aligned with actual
implementation.

------------------------------------------------------------------------

## 28. Implementation Principle

The project should favor simple, readable code over unnecessary
complexity.

Every major academic concept should be easy for a reviewer to locate and
explain during viva.

The strongest implementation is one where each concept is not only
documented but also demonstrated by understandable code and, where
appropriate, integrated into the application's real workflow.

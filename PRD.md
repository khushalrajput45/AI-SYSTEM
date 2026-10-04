# Product Requirements Document (PRD)

## AI Campus Complaint Management System

**Version:** 1.0\
**Project Type:** Web Application\
**Primary Goal:** Provide students with a simple way to submit campus
complaints and help administrators manage, classify, prioritize, and
resolve them using AI.

------------------------------------------------------------------------

## 1. Product Overview

The AI Campus Complaint Management System is a full-stack web
application for managing student complaints in a college/campus
environment.

Students can submit complaints with details and optional attachments.
The backend validates and stores the complaint, while an LLM analyzes
the complaint and returns structured information such as category,
priority, summary, and suggested action.

Administrators can view complaints, filter them, update their status,
and manage the complaint lifecycle.

The project also demonstrates important software-development concepts
required for the academic evaluation:

1.  LLM API integration
2.  Prompt engineering
3.  Structured outputs
4.  Express middleware
5.  Git workflow
6.  JavaScript Event Loop
7.  JavaScript Hoisting
8.  JavaScript Promises vs Callbacks
9.  MongoDB CRUD
10. MongoDB schema modeling
11. Relational schema design using PK/FK
12. SQL JOINs

------------------------------------------------------------------------

## 2. Problem Statement

Campus complaints are often handled through messages, forms,
spreadsheets, or informal communication. This makes it difficult to:

-   Track complaint status
-   Identify recurring issues
-   Prioritize urgent complaints
-   Assign complaints to responsible departments
-   Maintain a searchable history
-   Provide consistent complaint categorization
-   Generate useful summaries for administrators

The system centralizes complaint management and uses AI to reduce manual
classification effort.

------------------------------------------------------------------------

## 3. Objectives

### Primary Objectives

-   Allow students to create complaints.
-   Store complaints securely.
-   Authenticate users.
-   Provide role-based access for students and administrators.
-   Automatically analyze complaints using an LLM.
-   Return predictable structured AI data.
-   Allow administrators to update complaint status.
-   Demonstrate CRUD operations with MongoDB.
-   Demonstrate relational database concepts and SQL JOINs.
-   Demonstrate core JavaScript execution concepts.
-   Maintain a professional Git branching and merge workflow.

### Secondary Objectives

-   Make the interface simple and responsive.
-   Validate user input before processing.
-   Handle API errors consistently.
-   Keep AI-generated information auditable and understandable.

------------------------------------------------------------------------

## 4. Target Users

### Student

A student can:

-   Register/login
-   Submit a complaint
-   View their complaints
-   View complaint details
-   Track complaint status

### Administrator

An administrator can:

-   Login
-   View complaints
-   Filter/search complaints
-   View AI classification
-   Update complaint status
-   Manage complaint records
-   Access administrative information

------------------------------------------------------------------------

## 5. Core Features

### 5.1 Authentication

-   User registration
-   User login
-   JWT-based authentication
-   Protected API routes
-   Role-based authorization

### 5.2 Complaint Management

Students can create complaints containing:

-   Title
-   Description
-   Category/details
-   Optional attachment
-   Relevant metadata

Administrators can:

-   Read complaints
-   Update status
-   Review AI analysis
-   Manage complaint records

### 5.3 AI Complaint Analysis

The backend sends complaint information to an LLM.

The prompt asks the model to return structured JSON containing fields
such as:

-   `category`
-   `priority`
-   `summary`
-   `suggestedAction`

The backend parses and validates the result before using it.

### 5.4 Validation

Input validation is performed before controller/business logic.

Invalid requests should return an appropriate client error instead of
reaching the database or AI service.

### 5.5 Error Handling

Centralized error middleware provides consistent API error responses.

### 5.6 File Upload

Complaint attachments can be handled through upload middleware.

### 5.7 Database

MongoDB stores the application's primary operational data.

Mongoose schemas define document structure, validation, references, and
timestamps.

### 5.8 SQL Demonstration

A separate SQL demonstration models the same type of campus data
relationally.

It includes:

-   Primary keys
-   Foreign keys
-   Seed data
-   INNER JOIN
-   LEFT JOIN
-   Multi-table relationships

This demonstrates relational database design independently from MongoDB.

------------------------------------------------------------------------

## 6. Functional Requirements

### FR-01: User Registration

The system shall allow a user to create an account.

### FR-02: User Login

The system shall authenticate registered users and return an
authentication token.

### FR-03: Protected Access

Protected endpoints shall reject unauthenticated requests.

### FR-04: Role-Based Access

Administrative operations shall only be available to authorized
administrator roles.

### FR-05: Create Complaint

An authenticated student shall be able to create a complaint.

### FR-06: Read Complaints

Authorized users shall be able to retrieve complaint records according
to their permissions.

### FR-07: Update Complaint

Authorized administrators shall be able to update complaint
status/details.

### FR-08: Delete Complaint

Authorized users/endpoints shall support deletion where permitted.

### FR-09: AI Classification

The system shall send complaint data to the configured LLM API for
analysis.

### FR-10: Structured AI Result

The application shall parse the AI response into predictable fields
before storing or returning it.

### FR-11: Validation

Invalid input shall be rejected before controller execution.

### FR-12: Error Handling

Unexpected application errors shall be handled by centralized error
middleware.

------------------------------------------------------------------------

## 7. Non-Functional Requirements

### Performance

-   API requests should complete quickly under normal load.
-   AI calls should be isolated so failures do not crash the server.
-   Database queries should use appropriate indexes where required.

### Security

-   Passwords must not be stored as plain text.
-   Authentication tokens must be protected.
-   Admin routes must use authorization middleware.
-   User input must be validated.
-   Secrets/API keys must be stored in environment variables.

### Reliability

-   API failures should return controlled error responses.
-   Database errors should not expose internal implementation details.
-   AI failures should be handled gracefully.

### Maintainability

-   Controllers, middleware, models, routes, and utilities should remain
    separated.
-   Git branches should represent feature work.
-   Documentation should map requirements to implementation.

### Usability

-   Students should understand how to submit a complaint without
    training.
-   Complaint status should be easy to understand.

------------------------------------------------------------------------

## 8. Success Criteria

The project is considered successful when:

-   A user can authenticate.
-   A student can create a complaint.
-   The complaint is stored in MongoDB.
-   The complaint can be retrieved and updated.
-   AI analysis is generated through an LLM API.
-   AI output is processed as structured data.
-   Middleware protects appropriate routes.
-   JavaScript concept demonstrations are present.
-   SQL schema demonstrates PK/FK relationships.
-   SQL scripts demonstrate JOIN operations.
-   Git history demonstrates feature branches and merges.

------------------------------------------------------------------------

## 9. Scope

### In Scope

-   Authentication
-   Complaint CRUD
-   AI classification
-   Input validation
-   Middleware
-   MongoDB
-   SQL schema demonstration
-   SQL JOIN demonstration
-   JavaScript concept demonstrations
-   Git workflow documentation

### Out of Scope

-   Mobile application
-   Real-time chat
-   Production-scale distributed infrastructure
-   Automated complaint resolution
-   Payment functionality
-   Advanced analytics dashboard
-   Human-level AI decision making

------------------------------------------------------------------------

## 10. Assumptions

-   Users have internet access.
-   The LLM API is available through a configured API key.
-   MongoDB is available.
-   The application is primarily intended as an academic/project
    prototype.
-   AI-generated classifications are recommendations and can be reviewed
    by administrators.

------------------------------------------------------------------------

## 11. Future Enhancements

-   Email notifications
-   Push notifications
-   Complaint assignment to departments
-   SLA tracking
-   Analytics dashboard
-   Duplicate complaint detection
-   AI sentiment analysis
-   Complaint escalation
-   PostgreSQL production mode
-   Audit logs
-   Deployment monitoring

------------------------------------------------------------------------

## 12. Concept-to-Feature Mapping

  Required Concept          Project Demonstration
  ------------------------- --------------------------------------------------
  LLM API Integration       Gemini/LLM service integration
  Prompt Engineering        Complaint analysis prompt
  Structured Outputs        JSON-based AI response
  Middleware                Auth, RBAC, validation, upload, error middleware
  Git Workflow              Feature branches and merges
  JS Event Loop             Dedicated event-loop demonstration
  JS Hoisting               Dedicated hoisting demonstration
  Promises vs Callbacks     Dedicated comparison demonstration
  MongoDB CRUD              Complaint/user CRUD operations
  MongoDB Schema Modeling   Mongoose models
  PK/FK                     SQL relational schema
  SQL JOINs                 SQL JOIN demonstration scripts

------------------------------------------------------------------------

## 13. Acceptance Criteria

A reviewer should be able to inspect the repository and identify:

-   A working full-stack complaint workflow.
-   AI integration and prompt.
-   Structured AI processing.
-   Multiple middleware examples.
-   MongoDB models and CRUD operations.
-   Explicit JavaScript concept examples.
-   SQL PK/FK definitions.
-   SQL JOIN examples.
-   Git branches and merge commits.
-   Documentation describing the architecture and implementation.

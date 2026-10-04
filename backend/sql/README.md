# Relational Database Concepts

The main SmartCampus application uses MongoDB/Mongoose. This folder adds a small
PostgreSQL-compatible relational model so the project also demonstrates the
relational database concepts required for the course.

## Concepts demonstrated

- Primary keys: `users.id`, `departments.id`, `complaints.id`
- Foreign keys: `complaints.user_id -> users.id` and `complaints.department_id -> departments.id`
- Normalized tables: users, departments and complaints store separate responsibilities.
- SQL JOINs: `joins.sql` demonstrates INNER JOIN and LEFT JOIN.

## Run with PostgreSQL

```bash
createdb smartcampus
psql smartcampus -f schema.sql
psql smartcampus -f seed.sql
psql smartcampus -f joins.sql
```

The MongoDB implementation remains the main application database. These SQL files
are an additional relational design/reporting demonstration.

-- SQL JOIN demonstration
-- The foreign keys connect complaints to users and departments.
-- JOIN combines columns from these related tables without duplicating data.
-- Demonstrates relational database design
-- using primary keys, foreign keys and SQL JOINs.

SELECT
    c.id AS complaint_id,
    c.title,
    c.status,
    u.name AS student_name,
    u.email AS student_email,
    d.name AS department
FROM complaints AS c
INNER JOIN users AS u
    ON c.user_id = u.id
INNER JOIN departments AS d
    ON c.department_id = d.id
ORDER BY c.created_at DESC;

-- LEFT JOIN example: show every department, including departments
-- that currently have no complaints.
SELECT
    d.id,
    d.name AS department,
    c.title AS complaint
FROM departments AS d
LEFT JOIN complaints AS c
    ON c.department_id = d.id
ORDER BY d.name;

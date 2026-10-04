-- SmartCampus relational database demonstration
-- This file intentionally models the same campus domain using SQL.
-- It demonstrates PRIMARY KEY, FOREIGN KEY and normalized relational design.

DROP TABLE IF EXISTS complaints;
DROP TABLE IF EXISTS departments;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    role VARCHAR(30) NOT NULL DEFAULT 'STUDENT'
);

CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE complaints (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    department_id INTEGER NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'REPORTED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_complaint_user
        FOREIGN KEY (user_id) REFERENCES users(id),

    CONSTRAINT fk_complaint_department
        FOREIGN KEY (department_id) REFERENCES departments(id)
);

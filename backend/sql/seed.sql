-- Sample relational data for the SQL demonstration

INSERT INTO users (name, email, role) VALUES
('Aarav Sharma', 'aarav@example.com', 'STUDENT'),
('Riya Mehta', 'riya@example.com', 'STUDENT');

INSERT INTO departments (name) VALUES
('IT Support'),
('Electrical Maintenance'),
('Hostel Administration');

INSERT INTO complaints (user_id, department_id, title, description, status) VALUES
(1, 1, 'WiFi not working', 'WiFi is unavailable in Block A.', 'IN_PROGRESS'),
(2, 2, 'Broken light', 'Corridor light is not working.', 'REPORTED');

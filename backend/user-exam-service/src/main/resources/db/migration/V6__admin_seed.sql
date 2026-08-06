-- Insert default admin if not exists
INSERT IGNORE INTO user (full_name, email, password, role)
VALUES ('Default Admin', 'Admin@gmail.com', '$2a$10$C82yG6h2F.1U5hC8uE6NCO0C0J7P8l4d9p5z4y1mOqF0kI0A3u5Q.', 'ROLE_ADMIN');

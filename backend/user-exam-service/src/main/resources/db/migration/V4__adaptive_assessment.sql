CREATE TABLE exam_attempt (
    attempt_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    exam_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    status VARCHAR(50) NOT NULL,
    start_time DATETIME NOT NULL,
    submitted_at DATETIME,
    current_difficulty_level INT,
    total_questions INT
);

CREATE TABLE attempt_response (
    response_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    attempt_id BIGINT NOT NULL,
    question_id BIGINT NOT NULL,
    selected_answer VARCHAR(255),
    is_correct BIT,
    time_taken INT,
    CONSTRAINT fk_ar_attempt FOREIGN KEY (attempt_id) REFERENCES exam_attempt(attempt_id)
);

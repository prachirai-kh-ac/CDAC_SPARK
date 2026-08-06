CREATE TABLE attempt_topic_progress (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    attempt_id BIGINT NOT NULL,
    topic_id BIGINT NOT NULL,
    topic_name VARCHAR(255),
    questions_assigned INT DEFAULT 0,
    questions_attempted INT DEFAULT 0,
    questions_remaining INT DEFAULT 0,
    CONSTRAINT fk_atp_attempt FOREIGN KEY (attempt_id) REFERENCES exam_attempt(attempt_id)
);

CREATE TABLE attempt_difficulty_stat (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    attempt_id BIGINT NOT NULL,
    difficulty_level VARCHAR(100),
    questions_attempted INT DEFAULT 0,
    correct_answers INT DEFAULT 0,
    incorrect_answers INT DEFAULT 0,
    CONSTRAINT fk_ads_attempt FOREIGN KEY (attempt_id) REFERENCES exam_attempt(attempt_id)
);

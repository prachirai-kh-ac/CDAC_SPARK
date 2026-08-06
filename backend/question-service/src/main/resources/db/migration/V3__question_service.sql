CREATE TABLE difficulty_level (
    difficulty_level_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    level_name VARCHAR(100) NOT NULL,
    description TEXT,
    weightage INT
);

CREATE TABLE topic (
    topic_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    module_id BIGINT NOT NULL,
    topic_name VARCHAR(255) NOT NULL,
    description TEXT,
    CONSTRAINT fk_topic_module FOREIGN KEY (module_id) REFERENCES module(module_id)
);

CREATE TABLE topic_blueprint (
    blueprint_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    exam_module_id BIGINT NOT NULL,
    topic_id BIGINT NOT NULL,
    question_count INT NOT NULL,
    CONSTRAINT fk_tb_exam_module FOREIGN KEY (exam_module_id) REFERENCES exam_module(exam_module_id),
    CONSTRAINT fk_tb_topic FOREIGN KEY (topic_id) REFERENCES topic(topic_id)
);

CREATE TABLE question (
    question_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    module_id BIGINT NOT NULL,
    topic_id BIGINT NOT NULL,
    difficulty_level_id BIGINT NOT NULL,
    question_text TEXT NOT NULL,
    option_a VARCHAR(255),
    option_b VARCHAR(255),
    option_c VARCHAR(255),
    option_d VARCHAR(255),
    correct_answer VARCHAR(255) NOT NULL,
    CONSTRAINT fk_q_module FOREIGN KEY (module_id) REFERENCES module(module_id),
    CONSTRAINT fk_q_topic FOREIGN KEY (topic_id) REFERENCES topic(topic_id),
    CONSTRAINT fk_q_diff FOREIGN KEY (difficulty_level_id) REFERENCES difficulty_level(difficulty_level_id)
);

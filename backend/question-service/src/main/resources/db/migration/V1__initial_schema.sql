CREATE TABLE exam (
    exam_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    exam_name VARCHAR(255) NOT NULL,
    description TEXT,
    duration INT NOT NULL,
    total_questions INT NOT NULL
);

CREATE TABLE module (
    module_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    module_name VARCHAR(255) NOT NULL,
    module_code VARCHAR(100),
    description TEXT
);

CREATE TABLE exam_module (
    exam_module_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    exam_id BIGINT NOT NULL,
    module_id BIGINT NOT NULL,
    CONSTRAINT fk_em_exam FOREIGN KEY (exam_id) REFERENCES exam(exam_id),
    CONSTRAINT fk_em_module FOREIGN KEY (module_id) REFERENCES module(module_id)
);

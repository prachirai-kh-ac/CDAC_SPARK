ALTER TABLE exam ADD COLUMN batch_name VARCHAR(255);
ALTER TABLE exam ADD COLUMN exam_date DATE;
ALTER TABLE exam ADD COLUMN exam_time TIME;
ALTER TABLE exam ADD COLUMN teacher_id BIGINT;
ALTER TABLE exam ADD COLUMN created_date DATETIME;
ALTER TABLE exam ADD COLUMN status VARCHAR(50);

CREATE TABLE exam_topic (
    exam_id BIGINT NOT NULL,
    topic_id BIGINT NOT NULL,
    FOREIGN KEY (exam_id) REFERENCES exam(exam_id)
);

CREATE TABLE exam_question (
    exam_id BIGINT NOT NULL,
    question_id BIGINT NOT NULL,
    PRIMARY KEY (exam_id, question_id),
    FOREIGN KEY (exam_id) REFERENCES exam(exam_id),
    FOREIGN KEY (question_id) REFERENCES question(question_id)
);

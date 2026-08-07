package com.cdac.spark.userexam.service.interfaces;

import com.cdac.spark.userexam.entity.ExamAttempt;

public interface ResultCalculationService {
    void processAnswer(ExamAttempt attempt, int questionDifficulty, boolean isCorrect, boolean skipped);
    void finalizeAttempt(ExamAttempt attempt);
}

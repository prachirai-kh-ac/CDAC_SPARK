package com.cdac.spark.userexam.service.interfaces;

import com.cdac.spark.userexam.entity.ExamAttempt;
import com.cdac.spark.userexam.dto.res.QuestionDetailsDto;

public interface AdaptiveQuestionSelector {
    QuestionDetailsDto getNextQuestion(ExamAttempt attempt);
    int calculateNextDifficulty(int currentDifficulty, boolean isCorrect, boolean skipped);
}

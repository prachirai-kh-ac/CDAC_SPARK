package com.cdac.spark.userexam.service.impl;

import com.cdac.spark.userexam.entity.ExamAttempt;
import com.cdac.spark.userexam.service.interfaces.ResultCalculationService;
import org.springframework.stereotype.Service;

@Service
public class ResultCalculationServiceImpl implements ResultCalculationService {

    @Override
    public void processAnswer(ExamAttempt attempt, int questionDifficulty, boolean isCorrect, boolean skipped) {
        if (skipped) {
            if (questionDifficulty == 1) attempt.setEasySkipped(attempt.getEasySkipped() + 1);
            else if (questionDifficulty == 2) attempt.setMediumSkipped(attempt.getMediumSkipped() + 1);
            else if (questionDifficulty == 3) attempt.setHardSkipped(attempt.getHardSkipped() + 1);
        } else if (isCorrect) {
            if (questionDifficulty == 1) attempt.setEasyCorrect(attempt.getEasyCorrect() + 1);
            else if (questionDifficulty == 2) attempt.setMediumCorrect(attempt.getMediumCorrect() + 1);
            else if (questionDifficulty == 3) attempt.setHardCorrect(attempt.getHardCorrect() + 1);
        } else {
            if (questionDifficulty == 1) attempt.setEasyWrong(attempt.getEasyWrong() + 1);
            else if (questionDifficulty == 2) attempt.setMediumWrong(attempt.getMediumWrong() + 1);
            else if (questionDifficulty == 3) attempt.setHardWrong(attempt.getHardWrong() + 1);
        }
    }

    @Override
    public void finalizeAttempt(ExamAttempt attempt) {
        int easyC = attempt.getEasyCorrect();
        int medC = attempt.getMediumCorrect();
        int hardC = attempt.getHardCorrect();

        int abilityScore = 500 + (easyC * 1) + (medC * 2) + (hardC * 3);
        int weightedScore = (easyC * 1) + (medC * 2) + (hardC * 3);
        
        attempt.setAbilityScore(abilityScore);
        attempt.setWeightedScore(weightedScore);

        int totalCorrect = easyC + medC + hardC;
        int totalWrong = attempt.getEasyWrong() + attempt.getMediumWrong() + attempt.getHardWrong();
        int totalAttempted = totalCorrect + totalWrong; // Note: Skipped are not counted as attempted in accuracy

        double accuracy = 0.0;
        if (totalAttempted > 0) {
            accuracy = ((double) totalCorrect / totalAttempted) * 100.0;
        }
        attempt.setAccuracy(Math.round(accuracy * 100.0) / 100.0); // Round to 2 decimals

        int maxPossibleScore = attempt.getTotalQuestions() * 3;
        double percentage = 0.0;
        if (maxPossibleScore > 0) {
            percentage = ((double) weightedScore / maxPossibleScore) * 100.0;
        }
        attempt.setPercentage(Math.round(percentage * 100.0) / 100.0);
    }
}

package com.cdac.spark.userexam.service.impl;

import com.cdac.spark.userexam.dto.res.DifficultyStatResponse;
import com.cdac.spark.userexam.repository.AttemptDifficultyStatRepository;
import com.cdac.spark.userexam.service.interfaces.DifficultyStatService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class DifficultyStatServiceImpl implements DifficultyStatService {

    private final AttemptDifficultyStatRepository statRepository;

    public DifficultyStatServiceImpl(AttemptDifficultyStatRepository statRepository) {
        this.statRepository = statRepository;
    }

    @Override
    public List<DifficultyStatResponse> getDifficultyStat(Long attemptId) {
        return statRepository.findByExamAttempt_AttemptId(attemptId).stream().map(s -> {
            DifficultyStatResponse res = new DifficultyStatResponse();
            res.setDifficultyLevel(s.getDifficultyLevel());
            res.setQuestionsAttempted(s.getQuestionsAttempted());
            res.setCorrectAnswers(s.getCorrectAnswers());
            res.setIncorrectAnswers(s.getIncorrectAnswers());
            return res;
        }).collect(Collectors.toList());
    }
}

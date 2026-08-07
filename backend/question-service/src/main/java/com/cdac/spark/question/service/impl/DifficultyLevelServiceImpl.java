package com.cdac.spark.question.service.impl;

import com.cdac.spark.question.entity.DifficultyLevel;
import com.cdac.spark.question.repository.DifficultyLevelRepository;
import com.cdac.spark.question.service.interfaces.DifficultyLevelService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DifficultyLevelServiceImpl implements DifficultyLevelService {

    private final DifficultyLevelRepository difficultyLevelRepository;

    @Override
    public List<DifficultyLevel> getAllDifficultyLevels() {
        return difficultyLevelRepository.findAll();
    }

    public DifficultyLevelServiceImpl(DifficultyLevelRepository difficultyLevelRepository) {
        this.difficultyLevelRepository = difficultyLevelRepository;
    }
}

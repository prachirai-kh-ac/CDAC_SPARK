package com.cdac.spark.userexam.service.interfaces;

import com.cdac.spark.userexam.dto.res.DifficultyStatResponse;

import java.util.List;

public interface DifficultyStatService {
    List<DifficultyStatResponse> getDifficultyStat(Long attemptId);
}

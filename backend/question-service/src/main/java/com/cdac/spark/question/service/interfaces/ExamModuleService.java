package com.cdac.spark.question.service.interfaces;

import com.cdac.spark.question.dto.req.AssignModuleRequest;
import com.cdac.spark.question.dto.res.ExamModuleResponse;
import com.cdac.spark.question.dto.res.MessageResponse;
import java.util.List;

public interface ExamModuleService {
    MessageResponse assignModule(Long examId, AssignModuleRequest request);
    List<ExamModuleResponse> getExamModules(Long examId);
    MessageResponse removeModule(Long examId, Long moduleId);
}

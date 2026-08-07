package com.cdac.spark.question.service.interfaces;

import com.cdac.spark.question.dto.req.ExamRequest;
import com.cdac.spark.question.dto.res.ExamDetailsResponse;
import com.cdac.spark.question.dto.res.ExamResponse;
import com.cdac.spark.question.dto.res.MessageResponse;
import java.util.List;

public interface ExamService {
    ExamResponse createExam(ExamRequest request);
    List<ExamDetailsResponse> getAllExams();
    ExamDetailsResponse getExam(Long examId);
    MessageResponse updateExam(Long examId, ExamRequest request);
    MessageResponse updateExamStatus(Long examId, String status);
    MessageResponse deleteExam(Long examId);
}

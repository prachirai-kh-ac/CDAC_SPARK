package com.cdac.spark.question.service.interfaces;

import com.cdac.spark.question.dto.req.QuestionRequest;
import com.cdac.spark.question.dto.req.QuestionSearchRequest;
import com.cdac.spark.question.dto.req.QuestionUpdateRequest;
import com.cdac.spark.question.dto.res.MessageResponse;
import com.cdac.spark.question.dto.res.QuestionDetailsResponse;
import com.cdac.spark.question.dto.res.QuestionResponse;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.Map;

public interface QuestionService {
    QuestionResponse addQuestion(QuestionRequest request);
    Map<String, Object> uploadQuestionsCsv(MultipartFile file);
    List<QuestionDetailsResponse> getAllQuestions();
    QuestionDetailsResponse getQuestion(Long questionId);
    MessageResponse updateQuestion(Long questionId, QuestionUpdateRequest request);
    MessageResponse deleteQuestion(Long questionId);
    List<QuestionDetailsResponse> searchQuestions(QuestionSearchRequest request);
}

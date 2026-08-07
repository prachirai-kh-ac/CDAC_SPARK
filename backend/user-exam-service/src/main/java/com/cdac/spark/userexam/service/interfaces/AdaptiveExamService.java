package com.cdac.spark.userexam.service.interfaces;

import com.cdac.spark.userexam.dto.req.AdaptiveAnswerRequest;
import com.cdac.spark.userexam.dto.req.StartExamRequest;
import com.cdac.spark.userexam.dto.req.SubmitExamRequest;
import com.cdac.spark.userexam.dto.res.AdaptiveAnswerResponse;
import com.cdac.spark.userexam.dto.res.NextQuestionResponse;
import com.cdac.spark.userexam.dto.res.StartAdaptiveExamResponse;
import com.cdac.spark.userexam.dto.res.SubmitExamResponse;

public interface AdaptiveExamService {
    StartAdaptiveExamResponse startAdaptive(Long examId, StartExamRequest request);
    NextQuestionResponse getNextQuestion(Long examId, Long attemptId);
    AdaptiveAnswerResponse answerAdaptive(Long examId, AdaptiveAnswerRequest request);
    SubmitExamResponse finishAdaptive(Long examId, SubmitExamRequest request);
}

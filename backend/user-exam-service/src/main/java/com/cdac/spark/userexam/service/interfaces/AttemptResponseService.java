package com.cdac.spark.userexam.service.interfaces;

import com.cdac.spark.userexam.dto.req.SaveResponseRequest;
import com.cdac.spark.userexam.dto.res.AttemptResponseDetails;
import com.cdac.spark.userexam.dto.res.SaveResponseResult;

import java.util.List;

public interface AttemptResponseService {
    SaveResponseResult saveResponse(SaveResponseRequest request);
    List<AttemptResponseDetails> getResponses(Long attemptId);
}

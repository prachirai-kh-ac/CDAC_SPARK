package com.cdac.spark.question.service.interfaces;

import com.cdac.spark.question.dto.req.TopicRequest;
import com.cdac.spark.question.dto.req.TopicUpdateRequest;
import com.cdac.spark.question.dto.res.MessageResponse;
import com.cdac.spark.question.dto.res.TopicDetailsResponse;
import com.cdac.spark.question.dto.res.TopicResponse;
import java.util.List;

public interface TopicService {
    TopicResponse createTopic(TopicRequest request);
    List<TopicDetailsResponse> getTopicsOfModule(Long moduleId);
    MessageResponse updateTopic(Long topicId, TopicUpdateRequest request);
    MessageResponse deleteTopic(Long topicId);
}

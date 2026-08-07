package com.cdac.spark.question.service.interfaces;

import com.cdac.spark.question.dto.req.BlueprintRequest;
import com.cdac.spark.question.dto.req.BlueprintUpdateRequest;
import com.cdac.spark.question.dto.res.BlueprintDetailsResponse;
import com.cdac.spark.question.dto.res.BlueprintResponse;
import com.cdac.spark.question.dto.res.MessageResponse;
import java.util.List;

public interface TopicBlueprintService {
    BlueprintResponse createBlueprint(BlueprintRequest request);
    List<BlueprintDetailsResponse> getBlueprint(Long examId);
    MessageResponse updateBlueprint(Long id, BlueprintUpdateRequest request);
    MessageResponse deleteBlueprint(Long id);
}

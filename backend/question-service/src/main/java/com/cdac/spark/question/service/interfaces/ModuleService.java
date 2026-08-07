package com.cdac.spark.question.service.interfaces;

import com.cdac.spark.question.dto.req.ModuleRequest;
import com.cdac.spark.question.dto.res.MessageResponse;
import com.cdac.spark.question.dto.res.ModuleDetailsResponse;
import com.cdac.spark.question.dto.res.ModuleResponse;
import java.util.List;

public interface ModuleService {
    ModuleResponse createModule(ModuleRequest request);
    List<ModuleDetailsResponse> getAllModules();
    ModuleDetailsResponse getModule(Long moduleId);
    MessageResponse updateModule(Long moduleId, ModuleRequest request);
    MessageResponse deleteModule(Long moduleId);
}

package com.cdac.spark.question.service.impl;

import com.cdac.spark.question.dto.req.ModuleRequest;
import com.cdac.spark.question.dto.res.MessageResponse;
import com.cdac.spark.question.dto.res.ModuleDetailsResponse;
import com.cdac.spark.question.dto.res.ModuleResponse;
import com.cdac.spark.question.entity.Module;
import com.cdac.spark.question.exception.ResourceNotFoundException;
import com.cdac.spark.question.repository.ModuleRepository;
import com.cdac.spark.question.repository.TopicRepository;
import com.cdac.spark.question.service.interfaces.ModuleService;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ModuleServiceImpl implements ModuleService {

    private final ModuleRepository moduleRepository;
    private final TopicRepository topicRepository;
    private final ModelMapper modelMapper;

    @Override
    public ModuleResponse createModule(ModuleRequest request) {
        Module module = modelMapper.map(request, Module.class);
        module = moduleRepository.save(module);

        ModuleResponse response = new ModuleResponse();
        response.setMessage("Module created successfully.");
        response.setModuleId(module.getModuleId());
        return response;
    }

    @Override
    public List<ModuleDetailsResponse> getAllModules() {
        return moduleRepository.findAll().stream().map(m -> {
            ModuleDetailsResponse res = modelMapper.map(m, ModuleDetailsResponse.class);
            res.setTopicCount(topicRepository.countByModule_ModuleId(m.getModuleId()));
            return res;
        }).collect(Collectors.toList());
    }

    @Override
    public ModuleDetailsResponse getModule(Long moduleId) {
        Module m = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Module not found"));
        return modelMapper.map(m, ModuleDetailsResponse.class);
    }

    @Override
    public MessageResponse updateModule(Long moduleId, ModuleRequest request) {
        Module m = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Module not found"));
        modelMapper.map(request, m);
        moduleRepository.save(m);
        return new MessageResponse("Module updated successfully.");
    }

    @Override
    public MessageResponse deleteModule(Long moduleId) {
        moduleRepository.deleteById(moduleId);
        return new MessageResponse("Module deleted successfully.");
    }

    public ModuleServiceImpl(ModuleRepository moduleRepository, TopicRepository topicRepository, ModelMapper modelMapper) {
        this.moduleRepository = moduleRepository;
        this.topicRepository = topicRepository;
        this.modelMapper = modelMapper;
    }
}

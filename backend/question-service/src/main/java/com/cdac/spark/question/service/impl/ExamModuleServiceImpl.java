package com.cdac.spark.question.service.impl;

import com.cdac.spark.question.dto.req.AssignModuleRequest;
import com.cdac.spark.question.dto.res.ExamModuleResponse;
import com.cdac.spark.question.dto.res.MessageResponse;
import com.cdac.spark.question.entity.Exam;
import com.cdac.spark.question.entity.Module;
import com.cdac.spark.question.exception.ResourceNotFoundException;
import com.cdac.spark.question.repository.ExamRepository;
import com.cdac.spark.question.repository.ModuleRepository;
import com.cdac.spark.question.service.interfaces.ExamModuleService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ExamModuleServiceImpl implements ExamModuleService {

    private final ExamRepository examRepository;
    private final ModuleRepository moduleRepository;

    @Override
    public MessageResponse assignModule(Long examId, AssignModuleRequest request) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found"));
        Module module = moduleRepository.findById(request.getModuleId())
                .orElseThrow(() -> new ResourceNotFoundException("Module not found"));
        
        exam.getModules().add(module);
        examRepository.save(exam);
        
        return new MessageResponse("Module assigned to exam successfully.");
    }

    @Override
    public List<ExamModuleResponse> getExamModules(Long examId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found"));
                
        return exam.getModules().stream().map(m -> {
            ExamModuleResponse res = new ExamModuleResponse();
            res.setModuleId(m.getModuleId());
            res.setModuleName(m.getModuleName());
            return res;
        }).collect(Collectors.toList());
    }

    @Override
    public MessageResponse removeModule(Long examId, Long moduleId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found"));
        Module module = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Module not found"));
                
        exam.getModules().remove(module);
        examRepository.save(exam);
        
        return new MessageResponse("Module removed from exam successfully.");
    }

    public ExamModuleServiceImpl(ExamRepository examRepository, ModuleRepository moduleRepository) {
        this.examRepository = examRepository;
        this.moduleRepository = moduleRepository;
    }
}

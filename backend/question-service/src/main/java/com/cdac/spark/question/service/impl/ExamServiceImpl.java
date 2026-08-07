package com.cdac.spark.question.service.impl;

import com.cdac.spark.question.dto.req.ExamRequest;
import com.cdac.spark.question.dto.res.ExamDetailsResponse;
import com.cdac.spark.question.dto.res.ExamResponse;
import com.cdac.spark.question.dto.res.MessageResponse;
import com.cdac.spark.question.entity.Exam;
import com.cdac.spark.question.entity.Module;
import com.cdac.spark.question.entity.Question;
import com.cdac.spark.question.exception.ResourceNotFoundException;
import com.cdac.spark.question.repository.ExamRepository;
import com.cdac.spark.question.repository.ModuleRepository;
import com.cdac.spark.question.repository.QuestionRepository;
import com.cdac.spark.question.service.interfaces.ExamService;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ExamServiceImpl implements ExamService {

    private final ExamRepository examRepository;
    private final ModuleRepository moduleRepository;
    private final QuestionRepository questionRepository;
    private final ModelMapper modelMapper;

    public ExamServiceImpl(ExamRepository examRepository, ModuleRepository moduleRepository, QuestionRepository questionRepository, ModelMapper modelMapper) {
        this.examRepository = examRepository;
        this.moduleRepository = moduleRepository;
        this.questionRepository = questionRepository;
        this.modelMapper = modelMapper;
    }

    @Override
    public ExamResponse createExam(ExamRequest request) {
        Exam exam = new Exam();
        exam.setExamName(request.getExamName());
        exam.setDescription(request.getDescription());
        exam.setBatchName(request.getBatchName());
        exam.setExamDate(LocalDate.parse(request.getExamDate()));
        exam.setExamTime(LocalTime.parse(request.getExamTime()));
        exam.setDuration(request.getDuration());
        exam.setTotalQuestions(request.getTotalQuestions());
        exam.setTeacherId(request.getTeacherId());
        exam.setCreatedDate(LocalDateTime.now());
        exam.setStatus("Scheduled");

        Module module = moduleRepository.findById(request.getModuleId())
                .orElseThrow(() -> new ResourceNotFoundException("Module not found"));
        exam.setModules(new HashSet<>(List.of(module)));
        exam.setTopicIds(new HashSet<>(request.getTopicIds()));

        List<Question> selectedQuestions = new java.util.ArrayList<>();
        if (request.getTopicDistribution() != null && !request.getTopicDistribution().isEmpty()) {
            for (java.util.Map.Entry<Long, Integer> entry : request.getTopicDistribution().entrySet()) {
                Long topicId = entry.getKey();
                Integer count = entry.getValue();
                if (count > 0) {
                    List<Question> topicQuestions = questionRepository.findRandomQuestionsByTopic(topicId, count);
                    if (topicQuestions.size() < count) {
                        throw new IllegalArgumentException("Only " + topicQuestions.size() + " questions are available for topic ID " + topicId);
                    }
                    selectedQuestions.addAll(topicQuestions);
                }
            }
        } else {
            selectedQuestions = questionRepository.findRandomQuestionsByTopics(request.getTopicIds(), request.getTotalQuestions());
            if (selectedQuestions.size() < request.getTotalQuestions()) {
                throw new IllegalArgumentException("Only " + selectedQuestions.size() + " questions are available for the selected module/topic.");
            }
        }
        
        exam.setQuestions(new HashSet<>(selectedQuestions));
        
        exam = examRepository.save(exam);

        ExamResponse response = new ExamResponse();
        response.setMessage("Exam created successfully.");
        response.setExamId(exam.getExamId());
        return response;
    }

    @Override
    public List<ExamDetailsResponse> getAllExams() {
        return examRepository.findAll().stream()
                .map(e -> {
                    ExamDetailsResponse res = new ExamDetailsResponse();
                    res.setId(e.getExamId());
                    res.setTitle(e.getExamName());
                    res.setDescription(e.getDescription());
                    res.setBatchName(e.getBatchName());
                    res.setDurationMinutes(e.getDuration());
                    res.setTotalQuestions(e.getTotalQuestions());
                    res.setStatus(e.getStatus());
                    if (e.getExamDate() != null && e.getExamTime() != null) {
                        res.setScheduledAt(e.getExamDate().toString() + "T" + e.getExamTime().toString());
                    }
                    res.setModuleName(!e.getModules().isEmpty() ? e.getModules().iterator().next().getModuleName() : "General");
                    if (e.getTopicIds() != null) {
                        res.setTopicIds(new java.util.ArrayList<>(e.getTopicIds()));
                    }
                    res.setTeacherId(e.getTeacherId());
                    return res;
                })
                .collect(Collectors.toList());
    }

    @Override
    public ExamDetailsResponse getExam(Long examId) {
        Exam e = examRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found"));
        ExamDetailsResponse res = new ExamDetailsResponse();
        res.setId(e.getExamId());
        res.setTitle(e.getExamName());
        res.setDescription(e.getDescription());
        res.setBatchName(e.getBatchName());
        res.setDurationMinutes(e.getDuration());
        res.setTotalQuestions(e.getTotalQuestions());
        res.setStatus(e.getStatus());
        if (e.getExamDate() != null && e.getExamTime() != null) {
            res.setScheduledAt(e.getExamDate().toString() + "T" + e.getExamTime().toString());
        }
        if (e.getTopicIds() != null) {
            res.setTopicIds(new java.util.ArrayList<>(e.getTopicIds()));
        }
        res.setTeacherId(e.getTeacherId());
        return res;
    }

    @Override
    public MessageResponse updateExam(Long examId, ExamRequest request) {
        // Simple update for now
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found"));
        exam.setExamName(request.getExamName());
        examRepository.save(exam);
        return new MessageResponse("Exam updated successfully.");
    }

    @Override
    public MessageResponse updateExamStatus(Long examId, String status) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found"));
        exam.setStatus(status);
        examRepository.save(exam);
        return new MessageResponse("Exam status updated successfully.");
    }

    @Override
    public MessageResponse deleteExam(Long examId) {
        examRepository.deleteById(examId);
        return new MessageResponse("Exam deleted successfully.");
    }
}

package com.cdac.spark.question.service.impl;

import com.cdac.spark.question.dto.req.QuestionRequest;
import com.cdac.spark.question.dto.req.QuestionSearchRequest;
import com.cdac.spark.question.dto.req.QuestionUpdateRequest;
import com.cdac.spark.question.dto.res.MessageResponse;
import com.cdac.spark.question.dto.res.QuestionDetailsResponse;
import com.cdac.spark.question.dto.res.QuestionResponse;
import com.cdac.spark.question.entity.DifficultyLevel;
import com.cdac.spark.question.entity.Module;
import com.cdac.spark.question.entity.Question;
import com.cdac.spark.question.entity.Topic;
import com.cdac.spark.question.exception.BadRequestException;
import com.cdac.spark.question.exception.ResourceNotFoundException;
import com.cdac.spark.question.repository.DifficultyLevelRepository;
import com.cdac.spark.question.repository.ModuleRepository;
import com.cdac.spark.question.repository.QuestionRepository;
import com.cdac.spark.question.repository.TopicRepository;
import com.cdac.spark.question.service.interfaces.QuestionService;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import jakarta.persistence.criteria.Predicate;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional
public class QuestionServiceImpl implements QuestionService {

    private final QuestionRepository questionRepository;
    private final ModuleRepository moduleRepository;
    private final TopicRepository topicRepository;
    private final DifficultyLevelRepository difficultyLevelRepository;

    @Override
    public QuestionResponse addQuestion(QuestionRequest request) {
        Module module = moduleRepository.findById(request.getModuleId())
                .orElseThrow(() -> new ResourceNotFoundException("Module not found"));
        Topic topic = topicRepository.findById(request.getTopicId())
                .orElseThrow(() -> new ResourceNotFoundException("Topic not found"));
        DifficultyLevel diff = difficultyLevelRepository.findById(request.getDifficultyLevelId())
                .orElseThrow(() -> new ResourceNotFoundException("Difficulty not found"));

        Question q = new Question();
        q.setModule(module);
        q.setTopic(topic);
        q.setDifficultyLevel(diff);
        q.setQuestionText(request.getQuestionText());
        q.setOptionA(request.getOptionA());
        q.setOptionB(request.getOptionB());
        q.setOptionC(request.getOptionC());
        q.setOptionD(request.getOptionD());
        q.setCorrectAnswer(request.getCorrectAnswer());
        q = questionRepository.save(q);

        QuestionResponse res = new QuestionResponse();
        res.setMessage("Question added successfully.");
        res.setQuestionId(q.getQuestionId());
        return res;
    }

    @Override
    public Map<String, Object> uploadQuestionsCsv(MultipartFile file) {
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
            String line;
            int rowCount = 0;
            int successCount = 0;
            while ((line = reader.readLine()) != null) {
                if (rowCount == 0) {
                    rowCount++;
                    continue; // Skip header
                }
                rowCount++;
                String[] row = line.split(",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)", -1);
                if (row.length < 12) continue;
                
                try {
                    String moduleNameStr = row[2].trim();
                    String topicNameStr = row[4].trim();
                    String difficultyName = row[5].trim().toUpperCase();
                    
                    Module module = moduleRepository.findByModuleNameIgnoreCase(moduleNameStr)
                        .orElseGet(() -> {
                            Module m = new Module();
                            m.setModuleName(moduleNameStr);
                            m.setModuleCode(row[1].trim());
                            m.setDescription("Imported via CSV");
                            return moduleRepository.save(m);
                        });
                        
                    Topic topic = topicRepository.findByTopicNameIgnoreCaseAndModule_ModuleId(topicNameStr, module.getModuleId())
                        .orElseGet(() -> {
                            Topic t = new Topic();
                            t.setTopicName(topicNameStr);
                            t.setModule(module);
                            t.setDescription("Imported via CSV");
                            return topicRepository.save(t);
                        });
                    
                    DifficultyLevel diff = difficultyLevelRepository.findByLevelNameIgnoreCase(difficultyName)
                        .orElseGet(() -> {
                            DifficultyLevel d = new DifficultyLevel();
                            d.setLevelName(difficultyName);
                            d.setWeightage(difficultyName.equals("HARD") ? 3 : difficultyName.equals("MEDIUM") ? 2 : 1);
                            d.setDescription(difficultyName + " Level");
                            return difficultyLevelRepository.save(d);
                        });
                    
                    Question q = new Question();
                    q.setModule(module);
                    q.setTopic(topic);
                    q.setDifficultyLevel(diff);
                    q.setQuestionText(row[6].replace("\"", "").trim());
                    q.setOptionA(row[7].replace("\"", "").trim());
                    q.setOptionB(row[8].replace("\"", "").trim());
                    q.setOptionC(row[9].replace("\"", "").trim());
                    q.setOptionD(row[10].replace("\"", "").trim());
                    q.setCorrectAnswer(row[11].replace("\"", "").trim().toUpperCase());
                    if (row.length > 12) {
                        StringBuilder exp = new StringBuilder();
                        for(int i = 12; i < row.length; i++) {
                            String cell = row[i].replace("\"", "").trim();
                            if(cell.equalsIgnoreCase("ACTIVE") || cell.equalsIgnoreCase("INACTIVE")) continue;
                            if(!cell.isEmpty()) {
                                exp.append(cell).append(" ");
                            }
                        }
                        q.setExplanation(exp.toString().trim());
                    } else {
                        q.setExplanation("");
                    }
                    
                    questionRepository.save(q);
                    successCount++;
                } catch(Exception ex) {
                    System.err.println("Skipping invalid row " + rowCount + ": " + ex.getMessage());
                }
            }
            if (successCount == 0) {
                return Map.of("success", false, "message", "Upload failed: No valid questions found in the CSV. Please verify Module/Topic IDs and format.");
            }
            return Map.of("success", true, "message", "Successfully imported " + successCount + " questions.");
        } catch (Exception e) {
            e.printStackTrace();
            throw new BadRequestException("Failed to upload file: " + e.getMessage());
        }
    }

    @Override
    public List<QuestionDetailsResponse> getAllQuestions() {
        return mapToDetails(questionRepository.findAll());
    }

    @Override
    public QuestionDetailsResponse getQuestion(Long questionId) {
        Question q = questionRepository.findById(questionId).orElseThrow(() -> new ResourceNotFoundException("Question not found"));
        return mapToDetails(List.of(q)).get(0);
    }

    @Override
    public MessageResponse updateQuestion(Long questionId, QuestionUpdateRequest request) {
        Question q = questionRepository.findById(questionId).orElseThrow(() -> new ResourceNotFoundException("Question not found"));
        q.setQuestionText(request.getQuestionText());
        q.setOptionA(request.getOptionA());
        q.setOptionB(request.getOptionB());
        q.setOptionC(request.getOptionC());
        q.setOptionD(request.getOptionD());
        q.setCorrectAnswer(request.getCorrectAnswer());
        q.setExplanation(request.getExplanation());
        questionRepository.save(q);
        return new MessageResponse("Question updated successfully.");
    }

    @Override
    public MessageResponse deleteQuestion(Long questionId) {
        questionRepository.deleteById(questionId);
        return new MessageResponse("Question deleted successfully.");
    }

    @Override
    public List<QuestionDetailsResponse> searchQuestions(QuestionSearchRequest request) {
        Specification<Question> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (request.getModuleId() != null) {
                predicates.add(cb.equal(root.get("module").get("moduleId"), request.getModuleId()));
            }
            if (request.getTopicId() != null) {
                predicates.add(cb.equal(root.get("topic").get("topicId"), request.getTopicId()));
            }
            if (request.getDifficultyLevelId() != null) {
                predicates.add(cb.equal(root.get("difficultyLevel").get("difficultyLevelId"), request.getDifficultyLevelId())); // Note: Fixed field name to 'difficultyLevelId'
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return mapToDetails(questionRepository.findAll(spec));
    }

    private List<QuestionDetailsResponse> mapToDetails(List<Question> questions) {
        return questions.stream().map(q -> {
            QuestionDetailsResponse res = new QuestionDetailsResponse();
            res.setQuestionId(q.getQuestionId());
            res.setModule(q.getModule().getModuleName());
            res.setTopic(q.getTopic().getTopicName());
            res.setDifficulty(q.getDifficultyLevel().getLevelName());
            res.setQuestionText(q.getQuestionText());
            res.setOptionA(q.getOptionA());
            res.setOptionB(q.getOptionB());
            res.setOptionC(q.getOptionC());
            res.setOptionD(q.getOptionD());
            res.setCorrectAnswer(q.getCorrectAnswer());
            res.setExplanation(q.getExplanation());
            return res;
        }).collect(Collectors.toList());
    }

    public QuestionServiceImpl(QuestionRepository questionRepository, ModuleRepository moduleRepository, TopicRepository topicRepository, DifficultyLevelRepository difficultyLevelRepository) {
        this.questionRepository = questionRepository;
        this.moduleRepository = moduleRepository;
        this.topicRepository = topicRepository;
        this.difficultyLevelRepository = difficultyLevelRepository;
    }
}

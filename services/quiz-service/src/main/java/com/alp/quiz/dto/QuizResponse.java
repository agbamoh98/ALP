package com.alp.quiz.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
public class QuizResponse {

    private UUID id;
    private UUID resourceId;
    private String title;
    private String questionType;
    private String difficulty;
    private int questionCount;
    private Instant createdAt;
    private List<QuestionResponse> questions;

    @Data
    @Builder
    public static class QuestionResponse {
        private UUID id;
        private String type;
        private String question;
        private Map<String, String> options;
        private Object correctAnswer;
        private String expectedAnswer;
        private String explanation;
        private String difficulty;
        private int sortOrder;
    }
}

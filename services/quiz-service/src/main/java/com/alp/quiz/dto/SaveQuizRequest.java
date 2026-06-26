package com.alp.quiz.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
public class SaveQuizRequest {

    @NotNull
    private UUID resourceId;

    private String title;
    private String questionType;
    private String difficulty;

    @NotEmpty
    @Valid
    private List<QuestionDto> questions;

    @Data
    public static class QuestionDto {
        @NotBlank
        private String type;
        @NotBlank
        private String question;
        private Map<String, String> options;
        private Object correctAnswer;
        private String expectedAnswer;
        private String explanation;
        private String difficulty;
    }
}

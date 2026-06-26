package com.alp.ai.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class QuizRequest {

    private UUID resourceId;

    @NotBlank(message = "Content is required")
    private String content;

    @NotNull
    private QuestionType questionType = QuestionType.multiple_choice;

    @NotNull
    private Difficulty difficulty = Difficulty.medium;

    @Min(1) @Max(15)
    private int count = 5;

    public enum QuestionType {
        multiple_choice, true_false, short_answer
    }

    public enum Difficulty {
        easy, medium, hard
    }
}

package com.alp.quiz.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SaveAttemptRequest {

    @Min(0)
    private int score;

    @Min(1)
    private int totalQuestions;
}

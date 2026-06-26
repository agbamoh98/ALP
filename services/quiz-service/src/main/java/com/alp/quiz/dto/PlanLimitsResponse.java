package com.alp.quiz.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PlanLimitsResponse {
    private String plan;
    private long quizzesUsed;
    private long quizzesMax;
    private int questionsPerQuizMax;
}

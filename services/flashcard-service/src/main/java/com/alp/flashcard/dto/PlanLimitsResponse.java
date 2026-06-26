package com.alp.flashcard.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PlanLimitsResponse {
    private String plan;
    private long decksUsed;
    private long decksMax;
    private int cardsPerDeckMax;
}

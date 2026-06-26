package com.alp.ai.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AiResponse {

    private String result;
    private String model;
    private String promptVersion;
    private int promptTokens;
    private int completionTokens;
    private int totalTokens;
    private long responseTimeMs;
}

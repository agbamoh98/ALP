package com.alp.ai.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class SummarizeRequest {

    private UUID resourceId;

    @NotBlank(message = "Content is required")
    private String content;

    @NotNull(message = "Summary type is required")
    private SummaryType summaryType;

    public enum SummaryType {
        short_summary,
        detailed_summary,
        beginner_summary,
        advanced_summary,
        bullet_points,
        key_takeaways
    }
}

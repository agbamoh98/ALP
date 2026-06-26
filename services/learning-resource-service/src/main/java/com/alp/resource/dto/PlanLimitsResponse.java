package com.alp.resource.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PlanLimitsResponse {
    private String plan;
    private long used;
    private long max;
    private String resourceType;
}

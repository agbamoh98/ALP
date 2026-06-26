package com.alp.resource.dto;

import com.alp.resource.model.LearningResource;
import com.alp.resource.model.ResourceType;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class ResourceResponse {

    private UUID id;
    private String title;
    private ResourceType type;
    private String originalFilename;
    private Long fileSize;
    private int characterCount;
    private Instant createdAt;
    private Instant updatedAt;

    /** Full content — only included on single-resource fetch, null in list view. */
    private String content;

    public static ResourceResponse fromEntity(LearningResource r, boolean includeContent) {
        return ResourceResponse.builder()
                .id(r.getId())
                .title(r.getTitle())
                .type(r.getType())
                .originalFilename(r.getOriginalFilename())
                .fileSize(r.getFileSize())
                .characterCount(r.getContent() != null ? r.getContent().length() : 0)
                .createdAt(r.getCreatedAt())
                .updatedAt(r.getUpdatedAt())
                .content(includeContent ? r.getContent() : null)
                .build();
    }
}

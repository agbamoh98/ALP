package com.alp.resource.controller;

import com.alp.resource.dto.PlanLimitsResponse;
import com.alp.resource.dto.ResourceResponse;
import com.alp.resource.dto.TextUploadRequest;
import com.alp.resource.security.AuthenticatedUser;
import com.alp.resource.service.LearningResourceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class LearningResourceController {

    private final LearningResourceService resourceService;

    /**
     * Upload a PDF file.
     * POST /api/resources/upload/pdf
     */
    @PostMapping(value = "/upload/pdf", consumes = "multipart/form-data")
    public ResponseEntity<ResourceResponse> uploadPdf(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "title", required = false) String title,
            @AuthenticationPrincipal AuthenticatedUser user
    ) {
        ResourceResponse response = resourceService.uploadPdf(file, title, user.getId(), user.getRole());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Upload plain text content.
     * POST /api/resources/upload/text
     */
    @PostMapping("/upload/text")
    public ResponseEntity<ResourceResponse> uploadText(
            @Valid @RequestBody TextUploadRequest request,
            @AuthenticationPrincipal AuthenticatedUser user
    ) {
        ResourceResponse response = resourceService.uploadText(request, user.getId(), user.getRole());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * List all resources for the authenticated user.
     * GET /api/resources
     */
    @GetMapping
    public ResponseEntity<List<ResourceResponse>> listResources(
            @AuthenticationPrincipal AuthenticatedUser user
    ) {
        return ResponseEntity.ok(resourceService.listResources(user.getId()));
    }

    /**
     * Resource count for dashboard stats.
     * GET /api/resources/count
     */
    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> count(
            @AuthenticationPrincipal AuthenticatedUser user
    ) {
        long count = resourceService.countResources(user.getId());
        return ResponseEntity.ok(Map.of("count", count));
    }

    @GetMapping("/limits")
    public ResponseEntity<PlanLimitsResponse> limits(
            @AuthenticationPrincipal AuthenticatedUser user
    ) {
        return ResponseEntity.ok(resourceService.getPlanLimits(user.getId(), user.getRole()));
    }

    /**
     * Get a single resource with full content.
     * GET /api/resources/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ResourceResponse> getResource(
            @PathVariable UUID id,
            @AuthenticationPrincipal AuthenticatedUser user
    ) {
        return ResponseEntity.ok(resourceService.getResource(id, user.getId()));
    }

    /**
     * Delete a resource.
     * DELETE /api/resources/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResource(
            @PathVariable UUID id,
            @AuthenticationPrincipal AuthenticatedUser user
    ) {
        resourceService.deleteResource(id, user.getId());
        return ResponseEntity.noContent().build();
    }
}

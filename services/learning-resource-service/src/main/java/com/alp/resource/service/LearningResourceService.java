package com.alp.resource.service;

import com.alp.resource.dto.PlanLimitsResponse;
import com.alp.resource.dto.ResourceResponse;
import com.alp.resource.dto.TextUploadRequest;
import com.alp.resource.util.TierLimits;
import com.alp.resource.exception.AppException;
import com.alp.resource.model.LearningResource;
import com.alp.resource.model.ResourceType;
import com.alp.resource.repository.LearningResourceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class LearningResourceService {

    private final LearningResourceRepository repository;
    private final PdfExtractorService pdfExtractorService;

    @Value("${upload.max-size-bytes.free}")
    private long freeMaxBytes;

    @Value("${upload.max-size-bytes.premium}")
    private long premiumMaxBytes;

    @Value("${limits.resources.free}")
    private int freeMaxResources;

    @Value("${limits.resources.premium}")
    private int premiumMaxResources;

    // ─── Upload PDF ──────────────────────────────────────────────────────────

    @Transactional
    public ResourceResponse uploadPdf(MultipartFile file, String title, UUID userId, String userRole) {
        validateFile(file);
        enforceResourceCountLimit(userId, userRole);
        enforceUploadLimit(file.getSize(), userRole);

        String content = pdfExtractorService.extractText(file);
        String resolvedTitle = (title != null && !title.isBlank())
                ? title.trim()
                : stripExtension(file.getOriginalFilename());

        LearningResource resource = LearningResource.builder()
                .userId(userId)
                .title(resolvedTitle)
                .type(ResourceType.PDF)
                .content(content)
                .originalFilename(file.getOriginalFilename())
                .fileSize(file.getSize())
                .build();

        repository.save(resource);
        log.info("PDF uploaded: {} ({} chars) by user {}", resource.getTitle(), content.length(), userId);
        return ResourceResponse.fromEntity(resource, false);
    }

    // ─── Upload Text ─────────────────────────────────────────────────────────

    @Transactional
    public ResourceResponse uploadText(TextUploadRequest request, UUID userId, String userRole) {
        enforceResourceCountLimit(userId, userRole);
        long contentBytes = request.getContent().getBytes().length;
        enforceUploadLimit(contentBytes, userRole);

        LearningResource resource = LearningResource.builder()
                .userId(userId)
                .title(request.getTitle().trim())
                .type(ResourceType.TEXT)
                .content(request.getContent())
                .originalFilename(null)
                .fileSize(contentBytes)
                .build();

        repository.save(resource);
        log.info("Text uploaded: {} ({} chars) by user {}", resource.getTitle(), request.getContent().length(), userId);
        return ResourceResponse.fromEntity(resource, false);
    }

    // ─── List ────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<ResourceResponse> listResources(UUID userId) {
        return repository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(r -> ResourceResponse.fromEntity(r, false))
                .toList();
    }

    @Transactional(readOnly = true)
    public long countResources(UUID userId) {
        return repository.countByUserId(userId);
    }

    @Transactional(readOnly = true)
    public PlanLimitsResponse getPlanLimits(UUID userId, String userRole) {
        long used = repository.countByUserId(userId);
        long max = TierLimits.limitForRole(userRole, freeMaxResources, premiumMaxResources);
        return PlanLimitsResponse.builder()
                .plan(userRole)
                .used(used)
                .max(max)
                .resourceType("resources")
                .build();
    }

    // ─── Get single ──────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public ResourceResponse getResource(UUID id, UUID userId) {
        LearningResource resource = repository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new AppException("Resource not found.", HttpStatus.NOT_FOUND));
        return ResourceResponse.fromEntity(resource, true);
    }

    // ─── Delete ──────────────────────────────────────────────────────────────

    @Transactional
    public void deleteResource(UUID id, UUID userId) {
        if (repository.findByIdAndUserId(id, userId).isEmpty()) {
            throw new AppException("Resource not found.", HttpStatus.NOT_FOUND);
        }
        repository.deleteByIdAndUserId(id, userId);
        log.info("Resource {} deleted by user {}", id, userId);
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new AppException("No file provided.", HttpStatus.BAD_REQUEST);
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.equalsIgnoreCase("application/pdf")) {
            throw new AppException("Only PDF files are accepted.", HttpStatus.UNSUPPORTED_MEDIA_TYPE);
        }
    }

    private void enforceResourceCountLimit(UUID userId, String role) {
        long max = TierLimits.limitForRole(role, freeMaxResources, premiumMaxResources);
        long current = repository.countByUserId(userId);
        if (current >= max) {
            String message = TierLimits.isPremiumTier(role)
                    ? String.format("Plan limit reached: maximum %d saved resources.", max)
                    : String.format(
                            "Free plan limit: up to %d saved resources. Delete an old file or upgrade to Premium.",
                            max
                    );
            throw new AppException(message, HttpStatus.FORBIDDEN);
        }
    }

    private void enforceUploadLimit(long bytes, String role) {
        long limit = "PREMIUM".equalsIgnoreCase(role) ? premiumMaxBytes : freeMaxBytes;
        if (bytes > limit) {
            long limitMb = limit / (1024 * 1024);
            throw new AppException(
                    String.format("File exceeds the %d MB limit for your plan. Upgrade to Premium for larger uploads.", limitMb),
                    HttpStatus.PAYLOAD_TOO_LARGE
            );
        }
    }

    private String stripExtension(String filename) {
        if (filename == null) return "Untitled";
        int dot = filename.lastIndexOf('.');
        return dot > 0 ? filename.substring(0, dot) : filename;
    }
}

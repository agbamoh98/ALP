package com.alp.resource.repository;

import com.alp.resource.model.LearningResource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LearningResourceRepository extends JpaRepository<LearningResource, UUID> {

    List<LearningResource> findByUserIdOrderByCreatedAtDesc(UUID userId);

    Optional<LearningResource> findByIdAndUserId(UUID id, UUID userId);

    long countByUserId(UUID userId);

    void deleteByIdAndUserId(UUID id, UUID userId);
}

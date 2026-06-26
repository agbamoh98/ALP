package com.alp.flashcard.repository;

import com.alp.flashcard.model.FlashcardDeck;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FlashcardDeckRepository extends JpaRepository<FlashcardDeck, UUID> {

    List<FlashcardDeck> findByUserIdAndResourceIdOrderByCreatedAtDesc(UUID userId, UUID resourceId);

    Optional<FlashcardDeck> findByIdAndUserId(UUID id, UUID userId);

    long countByUserId(UUID userId);
}

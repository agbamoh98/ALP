package com.alp.flashcard.service;

import com.alp.flashcard.dto.DeckResponse;
import com.alp.flashcard.dto.DeckSummaryResponse;
import com.alp.flashcard.dto.PlanLimitsResponse;
import com.alp.flashcard.dto.SaveDeckRequest;
import com.alp.flashcard.exception.AppException;
import com.alp.flashcard.model.Flashcard;
import com.alp.flashcard.model.FlashcardDeck;
import com.alp.flashcard.repository.FlashcardDeckRepository;
import com.alp.flashcard.util.TierLimits;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FlashcardDeckService {

    private final FlashcardDeckRepository deckRepository;

    @Value("${limits.decks.free}")
    private int freeMaxDecks;

    @Value("${limits.decks.premium}")
    private int premiumMaxDecks;

    @Value("${limits.cards-per-deck.free}")
    private int freeMaxCardsPerDeck;

    @Value("${limits.cards-per-deck.premium}")
    private int premiumMaxCardsPerDeck;

    @Transactional
    public DeckResponse saveDeck(SaveDeckRequest request, UUID userId, String userRole) {
        enforceDeckCountLimit(userId, userRole);
        enforceCardsPerDeckLimit(request.getCards().size(), userRole);

        String title = request.getTitle();
        if (title == null || title.isBlank()) {
            title = "Deck · " + request.getCards().size() + " cards";
        }

        FlashcardDeck deck = FlashcardDeck.builder()
                .userId(userId)
                .resourceId(request.getResourceId())
                .title(title)
                .build();

        int order = 0;
        for (SaveDeckRequest.CardDto dto : request.getCards()) {
            Flashcard card = Flashcard.builder()
                    .deck(deck)
                    .front(dto.getFront())
                    .back(dto.getBack())
                    .difficulty(dto.getDifficulty())
                    .category(dto.getCategory())
                    .sortOrder(order++)
                    .build();
            deck.getCards().add(card);
        }

        deck = deckRepository.save(deck);
        return toResponse(deck);
    }

    @Transactional(readOnly = true)
    public List<DeckSummaryResponse> listDecks(UUID userId, UUID resourceId) {
        return deckRepository.findByUserIdAndResourceIdOrderByCreatedAtDesc(userId, resourceId)
                .stream()
                .map(this::toSummary)
                .toList();
    }

    @Transactional(readOnly = true)
    public DeckResponse getDeck(UUID deckId, UUID userId) {
        FlashcardDeck deck = deckRepository.findByIdAndUserId(deckId, userId)
                .orElseThrow(() -> new AppException("Deck not found.", HttpStatus.NOT_FOUND));
        return toResponse(deck);
    }

    @Transactional
    public void deleteDeck(UUID deckId, UUID userId) {
        FlashcardDeck deck = deckRepository.findByIdAndUserId(deckId, userId)
                .orElseThrow(() -> new AppException("Deck not found.", HttpStatus.NOT_FOUND));
        deckRepository.delete(deck);
    }

    @Transactional(readOnly = true)
    public long countByUser(UUID userId) {
        return deckRepository.countByUserId(userId);
    }

    @Transactional(readOnly = true)
    public PlanLimitsResponse getPlanLimits(UUID userId, String userRole) {
        return PlanLimitsResponse.builder()
                .plan(userRole)
                .decksUsed(deckRepository.countByUserId(userId))
                .decksMax(TierLimits.limitForRole(userRole, freeMaxDecks, premiumMaxDecks))
                .cardsPerDeckMax(TierLimits.limitForRole(userRole, freeMaxCardsPerDeck, premiumMaxCardsPerDeck))
                .build();
    }

    private void enforceDeckCountLimit(UUID userId, String role) {
        long max = TierLimits.limitForRole(role, freeMaxDecks, premiumMaxDecks);
        long current = deckRepository.countByUserId(userId);
        if (current >= max) {
            String message = TierLimits.isPremiumTier(role)
                    ? String.format("Plan limit reached: maximum %d saved flashcard decks.", max)
                    : String.format(
                            "Free plan limit: up to %d saved decks. Delete an old deck or upgrade to Premium.",
                            max
                    );
            throw new AppException(message, HttpStatus.FORBIDDEN);
        }
    }

    private void enforceCardsPerDeckLimit(int cardCount, String role) {
        int max = TierLimits.limitForRole(role, freeMaxCardsPerDeck, premiumMaxCardsPerDeck);
        if (cardCount > max) {
            String message = TierLimits.isPremiumTier(role)
                    ? String.format("Plan limit: maximum %d cards per deck.", max)
                    : String.format(
                            "Free plan limit: up to %d cards per deck. Generate fewer cards or upgrade to Premium.",
                            max
                    );
            throw new AppException(message, HttpStatus.FORBIDDEN);
        }
    }

    private DeckSummaryResponse toSummary(FlashcardDeck deck) {
        return DeckSummaryResponse.builder()
                .id(deck.getId())
                .resourceId(deck.getResourceId())
                .title(deck.getTitle())
                .cardCount(deck.getCards().size())
                .createdAt(deck.getCreatedAt())
                .build();
    }

    private DeckResponse toResponse(FlashcardDeck deck) {
        return DeckResponse.builder()
                .id(deck.getId())
                .resourceId(deck.getResourceId())
                .title(deck.getTitle())
                .cardCount(deck.getCards().size())
                .createdAt(deck.getCreatedAt())
                .cards(deck.getCards().stream().map(c -> DeckResponse.CardResponse.builder()
                        .id(c.getId())
                        .front(c.getFront())
                        .back(c.getBack())
                        .difficulty(c.getDifficulty())
                        .category(c.getCategory())
                        .sortOrder(c.getSortOrder())
                        .build()).toList())
                .build();
    }
}

package com.alp.quiz.service;

import com.alp.quiz.dto.*;
import com.alp.quiz.exception.AppException;
import com.alp.quiz.model.QuizAttempt;
import com.alp.quiz.model.QuizQuestion;
import com.alp.quiz.model.SavedQuiz;
import com.alp.quiz.repository.QuizAttemptRepository;
import com.alp.quiz.repository.SavedQuizRepository;
import com.alp.quiz.util.TierLimits;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class QuizService {

    private final SavedQuizRepository quizRepository;
    private final QuizAttemptRepository attemptRepository;

    @Value("${limits.quizzes.free}")
    private int freeMaxQuizzes;

    @Value("${limits.quizzes.premium}")
    private int premiumMaxQuizzes;

    @Value("${limits.questions-per-quiz.free}")
    private int freeMaxQuestionsPerQuiz;

    @Value("${limits.questions-per-quiz.premium}")
    private int premiumMaxQuestionsPerQuiz;

    @Transactional
    public QuizResponse saveQuiz(SaveQuizRequest request, UUID userId, String userRole) {
        enforceQuizCountLimit(userId, userRole);
        enforceQuestionsPerQuizLimit(request.getQuestions().size(), userRole);

        String title = request.getTitle();
        if (title == null || title.isBlank()) {
            title = "Quiz · " + request.getQuestions().size() + " questions";
        }

        SavedQuiz quiz = SavedQuiz.builder()
                .userId(userId)
                .resourceId(request.getResourceId())
                .title(title)
                .questionType(request.getQuestionType())
                .difficulty(request.getDifficulty())
                .build();

        int order = 0;
        for (SaveQuizRequest.QuestionDto dto : request.getQuestions()) {
            QuizQuestion q = QuizQuestion.builder()
                    .quiz(quiz)
                    .type(dto.getType())
                    .question(dto.getQuestion())
                    .options(dto.getOptions())
                    .correctAnswer(formatAnswer(dto.getCorrectAnswer()))
                    .expectedAnswer(dto.getExpectedAnswer())
                    .explanation(dto.getExplanation())
                    .difficulty(dto.getDifficulty())
                    .sortOrder(order++)
                    .build();
            quiz.getQuestions().add(q);
        }

        quiz = quizRepository.save(quiz);
        return toResponse(quiz);
    }

    @Transactional(readOnly = true)
    public List<QuizSummaryResponse> listQuizzes(UUID userId, UUID resourceId) {
        return quizRepository.findByUserIdAndResourceIdOrderByCreatedAtDesc(userId, resourceId)
                .stream()
                .map(this::toSummary)
                .toList();
    }

    @Transactional(readOnly = true)
    public QuizResponse getQuiz(UUID quizId, UUID userId) {
        SavedQuiz quiz = quizRepository.findByIdAndUserId(quizId, userId)
                .orElseThrow(() -> new AppException("Quiz not found.", HttpStatus.NOT_FOUND));
        return toResponse(quiz);
    }

    @Transactional
    public void deleteQuiz(UUID quizId, UUID userId) {
        SavedQuiz quiz = quizRepository.findByIdAndUserId(quizId, userId)
                .orElseThrow(() -> new AppException("Quiz not found.", HttpStatus.NOT_FOUND));
        quizRepository.delete(quiz);
    }

    @Transactional
    public void saveAttempt(UUID quizId, SaveAttemptRequest request, UUID userId) {
        SavedQuiz quiz = quizRepository.findByIdAndUserId(quizId, userId)
                .orElseThrow(() -> new AppException("Quiz not found.", HttpStatus.NOT_FOUND));

        QuizAttempt attempt = QuizAttempt.builder()
                .userId(userId)
                .quiz(quiz)
                .score(request.getScore())
                .totalQuestions(request.getTotalQuestions())
                .build();
        attemptRepository.save(attempt);
    }

    @Transactional(readOnly = true)
    public long countAttemptsByUser(UUID userId) {
        return attemptRepository.countByUserId(userId);
    }

    @Transactional(readOnly = true)
    public long countByUser(UUID userId) {
        return quizRepository.countByUserId(userId);
    }

    @Transactional(readOnly = true)
    public PlanLimitsResponse getPlanLimits(UUID userId, String userRole) {
        return PlanLimitsResponse.builder()
                .plan(userRole)
                .quizzesUsed(quizRepository.countByUserId(userId))
                .quizzesMax(TierLimits.limitForRole(userRole, freeMaxQuizzes, premiumMaxQuizzes))
                .questionsPerQuizMax(TierLimits.limitForRole(userRole, freeMaxQuestionsPerQuiz, premiumMaxQuestionsPerQuiz))
                .build();
    }

    private void enforceQuizCountLimit(UUID userId, String role) {
        long max = TierLimits.limitForRole(role, freeMaxQuizzes, premiumMaxQuizzes);
        long current = quizRepository.countByUserId(userId);
        if (current >= max) {
            String message = TierLimits.isPremiumTier(role)
                    ? String.format("Plan limit reached: maximum %d saved quizzes.", max)
                    : String.format(
                            "Free plan limit: up to %d saved quizzes. Delete an old quiz or upgrade to Premium.",
                            max
                    );
            throw new AppException(message, HttpStatus.FORBIDDEN);
        }
    }

    private void enforceQuestionsPerQuizLimit(int questionCount, String role) {
        int max = TierLimits.limitForRole(role, freeMaxQuestionsPerQuiz, premiumMaxQuestionsPerQuiz);
        if (questionCount > max) {
            String message = TierLimits.isPremiumTier(role)
                    ? String.format("Plan limit: maximum %d questions per quiz.", max)
                    : String.format(
                            "Free plan limit: up to %d questions per quiz. Generate fewer questions or upgrade to Premium.",
                            max
                    );
            throw new AppException(message, HttpStatus.FORBIDDEN);
        }
    }

    private String formatAnswer(Object answer) {
        if (answer == null) return null;
        if (answer instanceof Boolean b) return b.toString();
        return answer.toString();
    }

    private Object parseAnswer(String stored, String type) {
        if (stored == null) return null;
        if ("true_false".equals(type)) {
            return Boolean.parseBoolean(stored);
        }
        return stored;
    }

    private QuizSummaryResponse toSummary(SavedQuiz quiz) {
        return QuizSummaryResponse.builder()
                .id(quiz.getId())
                .resourceId(quiz.getResourceId())
                .title(quiz.getTitle())
                .questionType(quiz.getQuestionType())
                .difficulty(quiz.getDifficulty())
                .questionCount(quiz.getQuestions().size())
                .createdAt(quiz.getCreatedAt())
                .build();
    }

    private QuizResponse toResponse(SavedQuiz quiz) {
        return QuizResponse.builder()
                .id(quiz.getId())
                .resourceId(quiz.getResourceId())
                .title(quiz.getTitle())
                .questionType(quiz.getQuestionType())
                .difficulty(quiz.getDifficulty())
                .questionCount(quiz.getQuestions().size())
                .createdAt(quiz.getCreatedAt())
                .questions(quiz.getQuestions().stream().map(q -> QuizResponse.QuestionResponse.builder()
                        .id(q.getId())
                        .type(q.getType())
                        .question(q.getQuestion())
                        .options(q.getOptions())
                        .correctAnswer(parseAnswer(q.getCorrectAnswer(), q.getType()))
                        .expectedAnswer(q.getExpectedAnswer())
                        .explanation(q.getExplanation())
                        .difficulty(q.getDifficulty())
                        .sortOrder(q.getSortOrder())
                        .build()).toList())
                .build();
    }
}

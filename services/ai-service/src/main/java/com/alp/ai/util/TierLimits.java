package com.alp.ai.util;

import com.alp.ai.dto.SummarizeRequest.SummaryType;
import com.alp.ai.exception.AppException;
import org.springframework.http.HttpStatus;

public final class TierLimits {

    private TierLimits() {}

    public static boolean isPremiumTier(String role) {
        return "PREMIUM".equalsIgnoreCase(role) || "ADMIN".equalsIgnoreCase(role);
    }

    public static void enforceSummaryType(String role, SummaryType summaryType) {
        if (isPremiumTier(role)) return;
        if (summaryType == SummaryType.bullet_points || summaryType == SummaryType.key_takeaways) {
            throw new AppException(
                    "Bullet points and key takeaways are available on Premium.",
                    HttpStatus.FORBIDDEN
            );
        }
    }
}

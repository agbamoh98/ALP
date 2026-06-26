package com.alp.resource.util;

public final class TierLimits {

    private TierLimits() {}

    public static boolean isPremiumTier(String role) {
        return "PREMIUM".equalsIgnoreCase(role) || "ADMIN".equalsIgnoreCase(role);
    }

    public static int limitForRole(String role, int freeLimit, int premiumLimit) {
        return isPremiumTier(role) ? premiumLimit : freeLimit;
    }
}

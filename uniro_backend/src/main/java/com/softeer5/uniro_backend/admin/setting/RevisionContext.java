package com.softeer5.uniro_backend.admin.setting;

public class RevisionContext {
    private static final ThreadLocal<Long> univIdHolder = new ThreadLocal<>();
    private static final ThreadLocal<String> actionHolder = new ThreadLocal<>();

    public static void setAction(String action) {
        actionHolder.set(action);
    }

    public static String getAction() {
        return actionHolder.get();
    }

    public static void setUnivId(Long univId) {
        univIdHolder.set(univId);
    }

    public static Long getUnivId() {
        return univIdHolder.get();
    }

    public static void clear() {
        univIdHolder.remove();
    }
}

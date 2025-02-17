package com.softeer5.uniro_backend.admin.setting;

import java.time.LocalDateTime;

public class RevisionContext {
    private static final ThreadLocal<Long> univIdHolder = new ThreadLocal<>();
    private static final ThreadLocal<String> actionHolder = new ThreadLocal<>();
    private static final ThreadLocal<LocalDateTime> timeStampHolder = new ThreadLocal<>();
    private static final ThreadLocal<RevisionType> REVISION_TYPE_THREAD_LOCAL = ThreadLocal.withInitial(() -> RevisionType.DEFAULT);

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

    public static void setRevisionType(RevisionType revisionType) {
        REVISION_TYPE_THREAD_LOCAL.set(revisionType);
    }

    public static RevisionType getRevisionType() {
        return REVISION_TYPE_THREAD_LOCAL.get();
    }

    public static void setTimeStamp(LocalDateTime now){
        timeStampHolder.set(now);
    }

    public static LocalDateTime getTimeStamp(){
        return timeStampHolder.get();
    }

    public static void clear() {
        univIdHolder.remove();
        actionHolder.remove();
        timeStampHolder.remove();
        REVISION_TYPE_THREAD_LOCAL.remove();
    }
}

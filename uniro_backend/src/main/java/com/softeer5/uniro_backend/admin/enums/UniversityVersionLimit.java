package com.softeer5.uniro_backend.admin.enums;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public enum UniversityVersionLimit {
    HANYANG_UNIVERSITY(1001L, 154L),
    INHA_UNIVERSITY(1002L, 397L);

    private final Long univId;
    private final Long limitVersion;

    public static Long getLimitVersionByUnivId(Long univId) {
        for (UniversityVersionLimit limit : values()) {
            if (limit.univId.equals(univId)) {
                return limit.limitVersion;
            }
        }
        return 0L;
    }
}
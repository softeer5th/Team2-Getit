package com.softeer5.uniro_backend.common.error;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ErrorCode {
    FASTEST_ROUTE_NOT_FOUND(422, "경로가 없습니다.");

    final private int httpStatus;
    final private String message;
}

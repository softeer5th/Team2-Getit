package com.softeer5.uniro_backend.common.error;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ErrorCode {
    // 길찾기
    FASTEST_ROUTE_NOT_FOUND(422, "경로가 없습니다."),
    SAME_START_AND_END_POINT(400, "출발지와 도착지가 같습니다.");

    final private int httpStatus;
    final private String message;
}

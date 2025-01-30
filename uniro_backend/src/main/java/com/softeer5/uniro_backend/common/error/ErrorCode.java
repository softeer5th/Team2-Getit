package com.softeer5.uniro_backend.common.error;

import org.springframework.http.HttpStatus;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ErrorCode {
    // 길찾기
    FASTEST_ROUTE_NOT_FOUND(422, "경로가 없습니다."),
    SAME_START_AND_END_POINT(400, "출발지와 도착지가 같습니다."),

    // 건물 노드
    BUILDING_NOT_FOUND(404, "유효한 건물을 찾을 수 없습니다."),
    ;

    private final int httpStatus;
    private final String message;
}

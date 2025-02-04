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

    // 루트
    ROUTE_NOT_FOUND(404, "루트를 찾을 수 없습니다."),
    CAUTION_DANGER_CANT_EXIST_SIMULTANEOUSLY(400, "위험요소와 주의요소는 동시에 존재할 수 없습니다."),
    INVALID_MAP(500,"현재 지도 데이터가 제약조건에 어긋난 상태입니다."),

    //길 생성
    ELEVATION_API_ERROR(500, "구글 해발고도 API에서 오류가 발생했습니다."),

    // 건물 노드
    BUILDING_NOT_FOUND(404, "유효한 건물을 찾을 수 없습니다."),

    // 노드
    NODE_NOT_FOUND(404, "유효한 노드를 찾을 수 없습니다."),

    // 경로 계산
    INTERSECTION_ONLY_ALLOWED_POINT(400, "기존 경로와 겹칠 수 없습니다.")
    ;

    private final int httpStatus;
    private final String message;
}

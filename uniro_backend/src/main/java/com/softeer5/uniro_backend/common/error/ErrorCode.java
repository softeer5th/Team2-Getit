package com.softeer5.uniro_backend.common.error;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ErrorCode {

    // common
    INVALID_INPUT_VALUE(400, "적절하지 않은 요청값입니다."),
    INTERNAL_SERVER_ERROR(500, "서버 에러입니다."),

    // 길찾기
    FASTEST_ROUTE_NOT_FOUND(422, "경로가 없습니다."),
    SAME_START_AND_END_POINT(400, "출발지와 도착지가 같습니다."),

    // 루트
    ROUTE_NOT_FOUND(404, "루트를 찾을 수 없습니다."),
    CAUTION_DANGER_CANT_EXIST_SIMULTANEOUSLY(400, "위험요소와 주의요소는 동시에 존재할 수 없습니다."),
    INVALID_MAP(500,"현재 지도 데이터가 제약조건에 어긋난 상태입니다."),
    CREATE_ROUTE_LIMIT_EXCEEDED(400, "길 추가 최대 길이를 초과하였습니다."),

    //길 생성
    ELEVATION_API_ERROR(500, "구글 해발고도 API에서 오류가 발생했습니다."),
    DUPLICATE_NEAREST_NODE(400, "중복된 인접 노드가 존재합니다."),

    // 건물 노드
    BUILDING_NOT_FOUND(404, "유효한 건물을 찾을 수 없습니다."),
    NOT_BUILDING_NODE(400, "빌딩 노드가 아닙니다."),

    // 노드
    NODE_NOT_FOUND(404, "유효한 노드를 찾을 수 없습니다."),

    // 경로 계산
    INTERSECTION_ONLY_ALLOWED_POINT(400, "기존 경로와 겹칠 수 없습니다."),

    // 어드민
    ALREADY_LATEST_VERSION_ID(400, "현재 가장 최신 버전 id 입니다."),
    INVALID_VERSION_ID(400, "유효하지 않은 버전 id 입니다."),
    INVALID_ADMIN_CODE(403, "유효하지 않은 어드민 코드 입니다."),
    INVALID_TOKEN(401, "유효하지 않은 토큰입니다."),
    UNAUTHORIZED_UNIV(401, "해당 대학교의 권한이 없습니다."),
    INVALID_UNIV_ID(400, "유효하지 않은 대학교 id 입니다."),
    RECENT_REVISION_NOT_FOUND(404, "최신 버전을 찾을 수 없습니다."),
    ;

    private final int httpStatus;
    private final String message;
}

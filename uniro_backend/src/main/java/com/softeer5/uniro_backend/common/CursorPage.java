package com.softeer5.uniro_backend.common;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Getter
public class CursorPage<T> {
	private final T data;  // 실제 데이터
	private final Long nextCursor; // 다음 페이지 요청을 위한 커서 ID (마지막 데이터의 ID)
	private final boolean hasNext; // 다음 페이지가 존재하는지 여부
}

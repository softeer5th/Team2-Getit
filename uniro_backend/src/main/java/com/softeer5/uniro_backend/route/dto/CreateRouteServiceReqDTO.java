package com.softeer5.uniro_backend.route.dto;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class CreateRouteServiceReqDTO {
	private final double x;
	private final double y;
}

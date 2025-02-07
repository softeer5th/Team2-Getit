package com.softeer5.uniro_backend.common.exception.custom;

import com.softeer5.uniro_backend.common.error.ErrorCode;
import com.softeer5.uniro_backend.common.exception.CustomException;

public class RouteCalculationException extends CustomException {
	public RouteCalculationException(String message, ErrorCode errorCode) {
		super(message, errorCode);
	}
}

package com.softeer5.uniro_backend.common.exception.custom;

import com.softeer5.uniro_backend.common.error.ErrorCode;
import com.softeer5.uniro_backend.common.exception.CustomException;

import lombok.Getter;

@Getter
public class BuildingException extends CustomException {
	public BuildingException(String message, ErrorCode errorCode) {
		super(message, errorCode);
	}
}

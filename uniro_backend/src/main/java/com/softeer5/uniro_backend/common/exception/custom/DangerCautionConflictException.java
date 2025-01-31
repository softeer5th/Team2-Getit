package com.softeer5.uniro_backend.common.exception.custom;

import com.softeer5.uniro_backend.common.error.ErrorCode;
import com.softeer5.uniro_backend.common.exception.CustomException;

public class DangerCautionConflictException extends CustomException {
    public DangerCautionConflictException(String message, ErrorCode errorCode) {
        super(message, errorCode);
    }
}

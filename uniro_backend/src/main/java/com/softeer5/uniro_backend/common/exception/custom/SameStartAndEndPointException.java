package com.softeer5.uniro_backend.common.exception.custom;

import com.softeer5.uniro_backend.common.error.ErrorCode;
import lombok.Getter;

@Getter
public class SameStartAndEndPointException extends RuntimeException {

    private final ErrorCode errorCode;

    public SameStartAndEndPointException(String message, ErrorCode errorCode) {
        super(message);
        this.errorCode = errorCode;
    }

}
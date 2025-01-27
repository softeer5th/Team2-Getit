package com.softeer5.uniro_backend.common.error;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ErrorResponse extends Error {
    private int status;
    private String message;

    public ErrorResponse(ErrorCode errorCode) {
        this.status = errorCode.getHttpStatus();
        this.message = errorCode.getMessage();
    }
}

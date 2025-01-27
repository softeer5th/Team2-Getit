package com.softeer5.uniro_backend.common.exception;

import com.softeer5.uniro_backend.common.error.ErrorResponse;
import com.softeer5.uniro_backend.common.exception.custom.SameStartAndEndPointException;
import com.softeer5.uniro_backend.common.exception.custom.UnreachableDestinationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(UnreachableDestinationException.class)
    public ResponseEntity<ErrorResponse> handleSameStartEndPointException(UnreachableDestinationException ex) {
        log.error(ex.getMessage());
        ErrorResponse response = new ErrorResponse(ex.getErrorCode());
        return new ResponseEntity<>(response, HttpStatus.valueOf(ex.getErrorCode().getHttpStatus()));
    }

    @ExceptionHandler(SameStartAndEndPointException.class)
    public ResponseEntity<ErrorResponse> handleSameStartEndPointException(SameStartAndEndPointException ex) {
        log.error(ex.getMessage());
        ErrorResponse response = new ErrorResponse(ex.getErrorCode());
        return new ResponseEntity<>(response, HttpStatus.valueOf(ex.getErrorCode().getHttpStatus()));
    }
}
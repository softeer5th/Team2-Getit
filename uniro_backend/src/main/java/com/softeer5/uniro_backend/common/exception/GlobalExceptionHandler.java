package com.softeer5.uniro_backend.common.exception;

import static com.softeer5.uniro_backend.common.error.ErrorCode.*;

import com.softeer5.uniro_backend.common.error.ErrorResponse;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(CustomException.class)
    public ResponseEntity<ErrorResponse> handleCustomException(CustomException ex) {
        log.error(ex.getMessage());
        ErrorResponse response = new ErrorResponse(ex.getErrorCode());
        return new ResponseEntity<>(response, HttpStatus.valueOf(ex.getErrorCode().getHttpStatus()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleCustomException(MethodArgumentNotValidException ex) {
        log.error(ex.getMessage());
        ErrorResponse response = new ErrorResponse(INVALID_INPUT_VALUE);
        return new ResponseEntity<>(response, HttpStatus.valueOf(INVALID_INPUT_VALUE.getHttpStatus()));
    }
    
}
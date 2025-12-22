package com.vidops.auth.api.error;

import jakarta.validation.ConstraintViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

  @ExceptionHandler(AuthException.class)
  ResponseEntity<ApiError> handleAuth(AuthException e) {
    return ResponseEntity.status(e.getStatus()).body(ApiError.of(e.getCode(), e.getMessage()));
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  ResponseEntity<ApiError> handleInvalid(MethodArgumentNotValidException e) {
    return ResponseEntity.badRequest().body(ApiError.of("VALIDATION_ERROR", "Request validation failed."));
  }

  @ExceptionHandler(ConstraintViolationException.class)
  ResponseEntity<ApiError> handleViolation(ConstraintViolationException e) {
    return ResponseEntity.badRequest().body(ApiError.of("VALIDATION_ERROR", "Request validation failed."));
  }

  @ExceptionHandler(Exception.class)
  ResponseEntity<ApiError> handleGeneric(Exception e) {
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
        .body(ApiError.of("INTERNAL_ERROR", "Unexpected server error."));
  }
}

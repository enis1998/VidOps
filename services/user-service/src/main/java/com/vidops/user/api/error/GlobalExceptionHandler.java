package com.vidops.user.api.error;

import java.util.NoSuchElementException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

  @ExceptionHandler(NoSuchElementException.class)
  ResponseEntity<ApiError> notFound(NoSuchElementException e) {
    return ResponseEntity.status(HttpStatus.NOT_FOUND)
        .body(ApiError.of("NOT_FOUND", "Resource not found."));
  }

  @ExceptionHandler(Exception.class)
  ResponseEntity<ApiError> generic(Exception e) {
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
        .body(ApiError.of("INTERNAL_ERROR", "Unexpected server error."));
  }
}

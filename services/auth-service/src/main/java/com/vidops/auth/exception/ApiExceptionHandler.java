package com.vidops.auth.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.MethodArgumentNotValidException;

import java.time.Instant;
import java.util.Comparator;
import java.util.Map;

@RestControllerAdvice
public class ApiExceptionHandler {

    private static Map<String, Object> error(HttpStatus status, String code, String message) {
        return Map.of(
                "timestamp", Instant.now().toString(),
                "status", status.value(),
                "error", code,
                "message", message
        );
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<?> illegalState(IllegalStateException e) {
        if ("email_not_verified".equals(e.getMessage())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(error(HttpStatus.FORBIDDEN, "email_not_verified", "Email doğrulanmadı. Lütfen gelen kutunu kontrol et."));
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(error(HttpStatus.BAD_REQUEST, "bad_request", e.getMessage()));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<?> illegalArg(IllegalArgumentException e) {
        String code = e.getMessage() == null ? "invalid_request" : e.getMessage();
        HttpStatus st = "token_expired".equals(code) ? HttpStatus.GONE : HttpStatus.BAD_REQUEST;

        return ResponseEntity.status(st)
                .body(error(st, code, switch (code) {
                    case "token_missing" -> "Doğrulama token'ı eksik.";
                    case "token_invalid" -> "Doğrulama linki geçersiz.";
                    case "token_expired" -> "Doğrulama linkinin süresi dolmuş.";
                    default -> "İstek geçersiz.";
                }));
    }

    @ExceptionHandler(CurrentPasswordInvalidException.class)
    public ResponseEntity<?> currentPasswordInvalid(CurrentPasswordInvalidException e) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(error(HttpStatus.UNAUTHORIZED, "invalid_current_password", "Mevcut şifre hatalı."));
    }

    @ExceptionHandler(PasswordChangeNotAllowedException.class)
    public ResponseEntity<?> passwordChangeNotAllowed(PasswordChangeNotAllowedException e) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(error(HttpStatus.FORBIDDEN, "password_change_not_allowed", "Bu hesap türünde şifre değiştirilemez."));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> validation(MethodArgumentNotValidException e) {
        FieldError fe = e.getBindingResult().getFieldErrors().stream()
                .min(Comparator.comparing(FieldError::getField))
                .orElse(null);

        String msg = "İstek geçersiz.";
        if (fe != null) {
            if ("newPassword".equals(fe.getField())) {
                msg = "Yeni şifre en az 8 karakter olmalı.";
            } else if ("currentPassword".equals(fe.getField())) {
                msg = "Mevcut şifre gerekli.";
            }
        }

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(error(HttpStatus.BAD_REQUEST, "validation_error", msg));
    }
}

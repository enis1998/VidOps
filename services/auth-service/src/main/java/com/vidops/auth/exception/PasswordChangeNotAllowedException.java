package com.vidops.auth.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.FORBIDDEN)
public class PasswordChangeNotAllowedException extends RuntimeException {
    public PasswordChangeNotAllowedException() {
        super("password_change_not_allowed");
    }
}

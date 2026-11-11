package com.job_portal.job.exception;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import com.job_portal.job.dto.ApiError;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // =====================================================
    // VALIDATION ERRORS
    // =====================================================

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidation(
            MethodArgumentNotValidException exception,
            WebRequest request) {

        Map<String, String> errors =
                new LinkedHashMap<>();

        for (FieldError error :
                exception.getBindingResult().getFieldErrors()) {

            errors.putIfAbsent(
                    error.getField(),
                    error.getDefaultMessage()
            );
        }

        return buildError(
                HttpStatus.BAD_REQUEST,
                "Request validation failed",
                request,
                errors
        );
    }


    // =====================================================
    // AUTHENTICATION ERRORS
    // =====================================================

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiError> handleAuthentication(
            AuthenticationException exception,
            WebRequest request) {

        return buildError(
                HttpStatus.UNAUTHORIZED,
                "Authentication failed",
                request,
                null
        );
    }


    // =====================================================
    // USER NOT FOUND
    // =====================================================

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<ApiError> handleUserNotFound(
            UserNotFoundException exception,
            WebRequest request) {

        return buildError(
                HttpStatus.NOT_FOUND,
                exception.getMessage(),
                request,
                null
        );
    }


    // =====================================================
    // ILLEGAL ARGUMENT
    // =====================================================

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiError> handleIllegalArgument(
            IllegalArgumentException exception,
            WebRequest request) {

        return buildError(
                HttpStatus.BAD_REQUEST,
                exception.getMessage(),
                request,
                null
        );
    }


    // =====================================================
    // RUNTIME EXCEPTION
    // =====================================================

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ApiError> handleRuntime(
            RuntimeException exception,
            WebRequest request) {

        return buildError(
                HttpStatus.BAD_REQUEST,
                exception.getMessage(),
                request,
                null
        );
    }


    // =====================================================
    // GENERAL EXCEPTION
    // =====================================================

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleGeneral(
            Exception exception,
            WebRequest request) {

        return buildError(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "An unexpected error occurred",
                request,
                null
        );
    }


    // =====================================================
    // BUILD ERROR RESPONSE
    // =====================================================

    private ResponseEntity<ApiError> buildError(
            HttpStatus status,
            String message,
            WebRequest request,
            Map<String, String> validationErrors) {

        String path = request
                .getDescription(false)
                .replace("uri=", "");

        ApiError error = new ApiError(
                LocalDateTime.now(),
                status.value(),
                status.getReasonPhrase(),
                message,
                path,
                validationErrors
        );

        return ResponseEntity
                .status(status)
                .body(error);
    }
}
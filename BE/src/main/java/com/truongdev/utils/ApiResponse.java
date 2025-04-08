package com.truongdev.utils;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> {
//  private int status;
//  private T data;
//  private String message;
//
//  public ApiResponse(int status, String message) {
//    this(status, null, message);
//  }
//
//  private static <T> ResponseEntity<ApiResponse<T>> generateResponse(HttpStatus status, T data, String message) {
//    return new ResponseEntity<>(new ApiResponse<>(status.value(), data, message), status);
//  }
//
//  public static <T> ResponseEntity<ApiResponse<T>> ok(T data, String message) {
//    return generateResponse(HttpStatus.OK, data, message);
//  }
//
//  public static <T> ResponseEntity<ApiResponse<T>> ok(T data) {
//    return generateResponse(HttpStatus.OK, data, "Success");
//  }
//
//  public static <T> ResponseEntity<ApiResponse<T>> error(String message) {
//    return generateResponse(HttpStatus.BAD_REQUEST, null, message);
//  }
}

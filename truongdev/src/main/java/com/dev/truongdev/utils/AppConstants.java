package com.dev.truongdev.utils;

import java.util.Set;
import lombok.Getter;

public class AppConstants {
  public static final String SYSTEM = "system";
  
  // Project status constants
  public static final Integer STATUS_PENDING = 1;      // Chờ duyệt
  public static final Integer STATUS_APPROVED = 2;     // Đã duyệt
  public static final Integer STATUS_REJECTED = 3;     // Từ chối
  public static final Integer STATUS_IN_PROGRESS = 4;  // Đang thực hiện
  public static final Integer STATUS_COMPLETE = 5;     // Hoàn thành
  public static final Integer STATUS_OVERDUE = 6;      // Quá hạn
  
  public static final Set<Integer> LIST_STATUS_WORKFLOW = Set.of(
      STATUS_PENDING,
      STATUS_APPROVED, 
      STATUS_REJECTED,
      STATUS_IN_PROGRESS,
      STATUS_COMPLETE,
      STATUS_OVERDUE
  );

  // Status Business
  public static final Integer STATUS_ACTIVE = 1;
  public static final Integer STATUS_INACTIVE = 0;

  // Position Business  
  public static final Integer POSITION_HEAD = 1;
  public static final Integer POSITION_STAFF = 2;

  @Getter
  public enum State {
    INIT, PENDING, IN_PROGRESS, DEFERRED, REVIEWING, REPROCESS, COMPLETED, CANCELED, ALL
  }

  public static String getStatusName(Integer status) {
    if (status == null) return "NULL";
    if (status.equals(STATUS_ACTIVE)) return "ACTIVE";
    if (status.equals(STATUS_INACTIVE)) return "INACTIVE";
    return "UNKNOWN_STATUS";
  }

  public static String getPositionName(Integer position) {
    if (position == null) return "NULL";
    if (position.equals(POSITION_HEAD)) return "HEAD";
    if (position.equals(POSITION_STAFF)) return "STAFF";
    return "UNKNOWN_POSITION";
  }

  public static String getProjectStateName(Integer state) {
    if (state == null) return "NULL";
    if (state.equals(STATUS_PENDING)) return "Chờ duyệt";
    if (state.equals(STATUS_APPROVED)) return "Đã duyệt";
    if (state.equals(STATUS_REJECTED)) return "Từ chối";
    if (state.equals(STATUS_IN_PROGRESS)) return "Đang thực hiện";
    if (state.equals(STATUS_COMPLETE)) return "Hoàn thành";
    if (state.equals(STATUS_OVERDUE)) return "Quá hạn";
    return "UNKNOWN_STATE";
  }
}

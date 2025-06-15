package com.dev.truongdev.utils;

import java.util.Set;
import lombok.Getter;

public class AppConstants {
  public static final String SYSTEM = "system";
  
  // Project status constants
  public static final Integer STATUS_PENDING = 0;      // Chờ duyệt
  public static final Integer STATUS_REJECTED = 1;     // Từ chối
  public static final Integer STATUS_IN_PROGRESS = 2;  // Đang thực hiện
  public static final Integer STATUS_COMPLETE = 3;     // Hoàn thành
  public static final Integer STATUS_OVERDUE = 4;      // Quá hạn
  public static final Integer STATUS_CANCELED = 5;      // Đã hủy
  
  public static final Set<Integer> LIST_STATUS_WORKFLOW = Set.of(
      STATUS_PENDING,
      STATUS_REJECTED,
      STATUS_IN_PROGRESS,
      STATUS_COMPLETE,
      STATUS_OVERDUE,
      STATUS_CANCELED
  );

  // Status Business
  public static final Integer STATUS_ACTIVE = 1;
  public static final Integer STATUS_INACTIVE = 0;

  // Position Business  
  public static final Integer POSITION_HEAD = 1;
  public static final Integer POSITION_STAFF = 2;

  @Getter
  public enum State {
     PENDING, REJECTED, IN_PROGRESS, COMPLETE, OVERDUE, CANCELED
  }

  public static String getStatusName(Integer status) {
    if (status == null) return "NULL";
    if (status.equals(STATUS_ACTIVE)) return "ACTIVE";
    if (status.equals(STATUS_INACTIVE)) return "INACTIVE";
    return "UNKNOWN_STATUS";
  }

  public static String getPositionName(Integer positionId) {
    if (positionId == null) return "NULL";
    if (positionId.equals(1)) return "Quản lý";
    if (positionId.equals(2)) return "Nhân viên";
    return "UNKNOWN_POSITION";
  }

  public static String getProjectStateName(Integer state) {
    if (state == null) return "NULL";
    if (state.equals(STATUS_PENDING)) return "Chờ duyệt";
    if (state.equals(STATUS_REJECTED)) return "Từ chối";
    if (state.equals(STATUS_IN_PROGRESS)) return "Đang thực hiện";
    if (state.equals(STATUS_COMPLETE)) return "Hoàn thành";
    if (state.equals(STATUS_OVERDUE)) return "Quá hạn";
    return "UNKNOWN_STATE";
  }
}

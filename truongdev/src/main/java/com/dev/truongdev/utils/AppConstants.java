package com.dev.truongdev.utils;

import java.util.Set;
import lombok.Getter;

public class AppConstants {
  public static final Integer STATUS_APPROVED = 1;
  public static final Integer STATUS_PENDING = 2;
  public static final Integer STATUS_REJECTED = 3;
  public static final Integer STATUS_CANCELLED = 4;
  public static final Integer STATUS_NEW = 5;
  public static final Integer STATUS_RE_OPEN = 6;
  public static final Set<Integer> LIST_STATUS_WORKFLOW = Set.of(
      STATUS_APPROVED,
      STATUS_PENDING,
      STATUS_REJECTED,
      STATUS_CANCELLED,
      STATUS_NEW,
      STATUS_RE_OPEN
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

}

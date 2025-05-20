package com.dev.truongdev.utils;

public class StateNameUtils {
    // Task States
    public static String getTaskStateName(Integer state) {
        if (state == null) return "Unknown";
        switch (state) {
            case 0: return "Chưa bắt đầu";
            case 1: return "Đang thực hiện";
            case 2: return "Tạm dừng";
            case 3: return "Hoàn thành";
            case 4: return "Đã hủy";
            default: return "Unknown";
        }
    }

    // Risk States
    public static String getRiskStateName(Integer state) {
        if (state == null) return "Unknown";
        switch (state) {
            case 0: return "Identified";
            case 1: return "Analyzing";
            case 2: return "Monitored";
            case 3: return "Resolved";
            case 4: return "Closed";
            default: return "Unknown";
        }
    }

    // Project States
    public static String getProjectStateName(Integer state) {
        if (state == null) return "Unknown";
        switch (state) {
            case 0: return "INIT";
            case 1: return "PENDING";
            case 2: return "IN_PROGRESS";
            case 3: return "DEFERRED";
            case 4: return "REVIEWING";
            case 5: return "REPROCESS";
            case 6: return "COMPLETED";
            case 7: return "CANCELED";
            default: return "Unknown";
        }
    }
} 
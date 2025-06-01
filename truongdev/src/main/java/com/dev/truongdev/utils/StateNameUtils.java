package com.dev.truongdev.utils;

public class StateNameUtils {
    // Task States
    public static String getTaskStateName(Integer state) {
        if (state == null) return "Unknown";
        switch (state) {
            case 0: return "Chờ duyệt";
            case 1: return "Từ chối";
            case 2: return "Đang thực hiện";
            case 3: return "Hoàn thành";
            case 4: return "Quá hạn";
            case 5: return "Đã hủy";
            default: return "Unknown";
        }
    }

    // Risk States
    public static String getRiskStateName(Integer state) {
        if (state == null) return "Unknown";
        switch (state) {
            case 2: return "Đang xử lý";
            case 3: return "Đã đóng";
            case 5: return "Đã hủy";
            default: return "Unknown";
        }
    }

    // Project States
    public static String getProjectStateName(Integer state) {
        if (state == null) return "Unknown";
        switch (state) {
            case 0: return "Chờ duyệt";
            case 1: return "Từ chối";
            case 2: return "Đang thực hiện";
            case 3: return "Hoàn thành";
            case 4: return "Quá hạn";
            case 5: return "Đã hủy";
            default: return "Unknown";
        }
    }
} 
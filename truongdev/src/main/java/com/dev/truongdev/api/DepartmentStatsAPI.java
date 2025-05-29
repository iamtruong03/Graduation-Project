package com.dev.truongdev.api;

import com.dev.truongdev.service.IDepartmentStatsService;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/department-stats")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DepartmentStatsAPI {
    final IDepartmentStatsService departmentStatsService;

    public DepartmentStatsAPI(IDepartmentStatsService departmentStatsService) {
        this.departmentStatsService = departmentStatsService;
    }

    @GetMapping("/overall")
    public ResponseEntity<?> getOverallStats(
        @RequestAttribute Long did,
        @RequestAttribute String uid) {
        return ResponseEntity.ok(departmentStatsService.getOverallStats(did, uid));
    }

    @GetMapping("")
    public ResponseEntity<?> getDepartmentStats(
            @RequestAttribute Long did,
            @RequestAttribute String uid) {
        return ResponseEntity.ok(departmentStatsService.getDepartmentStats(did, uid));
    }

    @GetMapping("/employees")
    public ResponseEntity<?> getEmployeeStats(
            @RequestAttribute Long did,
            @RequestAttribute String uid) {
        return ResponseEntity.ok(departmentStatsService.getEmployeeStats(did, uid));
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<?> getEmployeeDetails(
            @PathVariable Long employeeId,
            @RequestAttribute String uid) {
        return ResponseEntity.ok(departmentStatsService.getEmployeeDetails(employeeId, uid));
    }
}
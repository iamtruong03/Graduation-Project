package com.dev.truongdev.dto.dashload.department;

import java.util.List;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DepartmentStatsDTO {
  Long totalDepartments;
  Long totalUsers;
  Long totalProjects;
  Long totalProjectsProcess;
  Long totalProjectsComplete;
  List<ProjectProgressDTO> monthlyProgress;
  List<UserStatsDTO> userStatsList;

}

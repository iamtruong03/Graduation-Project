package com.dev.truongdev.dto.dashboard.department;

import com.dev.truongdev.dto.dashboard.department.UserPerformanceDataDTO;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserStatsDTO {
  private String name;
  private String position;
  private Double efficiency;
  private Long tasksCompleted;
  private Long totalTasks;

  List<UserPerformanceDataDTO> performanceData;
}

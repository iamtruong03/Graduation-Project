package com.dev.truongdev.dto.dashboard.project;

import java.util.List;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProjectStatsDTO {

  List<UserProjectStatsDTO> userProjectStatsDTOS;

  Long totalProjectTask;
  Long projectTaskProcess;
  Long projectTaskComplete;

  // Tỷ lệ hoàn thành công việc của dự án:
  Double projectRate;
}

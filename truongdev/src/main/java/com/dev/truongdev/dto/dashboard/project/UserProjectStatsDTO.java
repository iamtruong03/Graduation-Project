package com.dev.truongdev.dto.dashboard.project;

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
public class UserProjectStatsDTO {

  String nameUser;
  String departmentName;
  String projectName;
  Long taskProcess;
  Long taskComplete;
  Long totalTask;

  // Tỷ lệ hoàn thành của nhân viên trong dự án
  Double completionRate;

  // Tỷ lệ hoàn thành công việc của dự án của user = completionRate/ projectRates
  Double projectCompletionRate;
}

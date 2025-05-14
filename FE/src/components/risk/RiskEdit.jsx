import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Box,
  Switch,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const RiskEdit = ({ open, onClose, risk, onSave }) => {
  const [currentTab, setCurrentTab] = useState(0);
  const [formData, setFormData] = useState({
    code: risk?.code || '',
    name: risk?.name || '',
    type: risk?.type || '',
    impactScope: risk?.impactScope || '',
    projectName: risk?.projectName || '',
    department: risk?.department || '',
    analyst: risk?.analyst || '',
    analysisDate: risk?.analysisDate || '',
    description: risk?.description || '',
    impactLevel: risk?.impactLevel || '',
    riskLevel: risk?.riskLevel || '',
    probability: risk?.probability || '',
    controlLevel: risk?.controlLevel || '',
    priority: risk?.priority || '',
    rootCause: risk?.rootCause || '',
    impact: risk?.impact || '',
    preventiveMeasures: risk?.preventiveMeasures || '',
    remedialMeasures: risk?.remedialMeasures || '',
    preventiveActions: risk?.preventiveActions || []
  });

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const [openTaskDialog, setOpenTaskDialog] = useState(false);
  const [taskFormData, setTaskFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    assignee: '',
    supervisor: '',
    status: 'Nháp'
  });

  const handleAddTask = () => {
    setOpenTaskDialog(true);
  };

  const handleTaskFormChange = (event) => {
    const { name, value } = event.target;
    setTaskFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveTask = () => {
    setFormData(prev => ({
      ...prev,
      preventiveActions: [...prev.preventiveActions, taskFormData]
    }));
    setTaskFormData({
      name: '',
      startDate: '',
      endDate: '',
      assignee: '',
      supervisor: '',
      status: 'Nháp'
    });
    setOpenTaskDialog(false);
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>Sửa rủi ro</DialogTitle>
        <DialogContent>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={currentTab} onChange={handleTabChange}>
              <Tab label="Thông tin rủi ro" />
              <Tab label="Phân tích đánh giá" />
              <Tab label="Hành động phòng ngừa" />
            </Tabs>
          </Box>

          {currentTab === 0 && (
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="Mã rủi ro"
                  name="code"
                  value={formData.code}
                  onChange={handleFormChange}
                  required
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="Tên rủi ro"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  required
                />
              </Grid>
              <Grid item xs={4}>
                <FormControl fullWidth required>
                  <InputLabel>Loại rủi ro</InputLabel>
                  <Select
                    name="type"
                    value={formData.type}
                    onChange={handleFormChange}
                    label="Loại rủi ro"
                  >
                    <MenuItem value="Rủi ro sức khỏe">Rủi ro sức khỏe</MenuItem>
                    <MenuItem value="Rủi ro môi trường">Rủi ro môi trường</MenuItem>
                    <MenuItem value="Rủi ro an toàn">Rủi ro an toàn</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={4}>
                <FormControl fullWidth required>
                  <InputLabel>Phạm vi ảnh hưởng</InputLabel>
                  <Select
                    name="impactScope"
                    value={formData.impactScope}
                    onChange={handleFormChange}
                    label="Phạm vi ảnh hưởng"
                  >
                    <MenuItem value="Dự án">Dự án</MenuItem>
                    <MenuItem value="Phòng ban">Phòng ban</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={4}>
                <FormControl fullWidth required>
                  <InputLabel>Tên dự án</InputLabel>
                  <Select
                    name="projectName"
                    value={formData.projectName}
                    onChange={handleFormChange}
                    label="Tên dự án"
                  >
                    <MenuItem value="Dự án A">Dự án A</MenuItem>
                    <MenuItem value="Dự án B">Dự án B</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={4}>
                <FormControl fullWidth required>
                  <InputLabel>Đơn vị ghi nhận</InputLabel>
                  <Select
                    name="department"
                    value={formData.department}
                    onChange={handleFormChange}
                    label="Đơn vị ghi nhận"
                  >
                    <MenuItem value="Phòng quản lý rủi ro">Phòng quản lý rủi ro</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={4}>
                <FormControl fullWidth required>
                  <InputLabel>Người phân tích</InputLabel>
                  <Select
                    name="analyst"
                    value={formData.analyst}
                    onChange={handleFormChange}
                    label="Người phân tích"
                  >
                    <MenuItem value="Phạm Như Hoài">Phạm Như Hoài</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  type="date"
                  label="Ngày phân tích"
                  name="analysisDate"
                  value={formData.analysisDate}
                  onChange={handleFormChange}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Mô tả chi tiết"
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                />
              </Grid>
            </Grid>
          )}

          {currentTab === 1 && (
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth required>
                  <InputLabel>Mức độ ảnh hưởng</InputLabel>
                  <Select
                    name="impactLevel"
                    value={formData.impactLevel}
                    onChange={handleFormChange}
                    label="Mức độ ảnh hưởng"
                  >
                    <MenuItem value="Cao">Cao</MenuItem>
                    <MenuItem value="Trung bình">Trung bình</MenuItem>
                    <MenuItem value="Thấp">Thấp</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth required>
                  <InputLabel>Mức độ rủi ro</InputLabel>
                  <Select
                    name="riskLevel"
                    value={formData.riskLevel}
                    onChange={handleFormChange}
                    label="Mức độ rủi ro"
                  >
                    <MenuItem value="Cao">Cao</MenuItem>
                    <MenuItem value="Trung bình">Trung bình</MenuItem>
                    <MenuItem value="Thấp">Thấp</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth required>
                  <InputLabel>Khả năng xảy ra</InputLabel>
                  <Select
                    name="probability"
                    value={formData.probability}
                    onChange={handleFormChange}
                    label="Khả năng xảy ra"
                  >
                    <MenuItem value="Cao">Cao</MenuItem>
                    <MenuItem value="Trung bình">Trung bình</MenuItem>
                    <MenuItem value="Thấp">Thấp</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth required>
                  <InputLabel>Phân cấp kiểm soát</InputLabel>
                  <Select
                    name="controlLevel"
                    value={formData.controlLevel}
                    onChange={handleFormChange}
                    label="Phân cấp kiểm soát"
                  >
                    <MenuItem value="Kiểm soát kỹ thuật">Kiểm soát kỹ thuật</MenuItem>
                    <MenuItem value="Kiểm soát hành chính">Kiểm soát hành chính</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth required>
                  <InputLabel>Mức độ ưu tiên</InputLabel>
                  <Select
                    name="priority"
                    value={formData.priority}
                    onChange={handleFormChange}
                    label="Mức độ ưu tiên"
                  >
                    <MenuItem value="Cao">Cao</MenuItem>
                    <MenuItem value="Trung bình">Trung bình</MenuItem>
                    <MenuItem value="Thấp">Thấp</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Phân tích nguyên nhân"
                  name="rootCause"
                  value={formData.rootCause}
                  onChange={handleFormChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Phân tích ảnh hưởng"
                  name="impact"
                  value={formData.impact}
                  onChange={handleFormChange}
                />
              </Grid>
            </Grid>
          )}

          {currentTab === 2 && (
            <Grid container spacing={2}>
              <Box sx={{ width: '100%', mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{ textTransform: 'none' }}
                    onClick={handleAddTask}
                  >
                    + THÊM CÔNG VIỆC
                  </Button>
                </Box>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Tên công việc</TableCell>
                        <TableCell>Ngày bắt đầu</TableCell>
                        <TableCell>Ngày kết thúc</TableCell>
                        <TableCell>Người thực hiện</TableCell>
                        <TableCell>Người giám sát</TableCell>
                        <TableCell>Trạng thái</TableCell>
                        <TableCell align="center">Thao tác</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {formData.preventiveActions.map((action, index) => (
                        <TableRow key={index}>
                          <TableCell>{action.name}</TableCell>
                          <TableCell>{action.startDate}</TableCell>
                          <TableCell>{action.endDate}</TableCell>
                          <TableCell>{action.assignee}</TableCell>
                          <TableCell>{action.supervisor}</TableCell>
                          <TableCell>{action.status}</TableCell>
                          <TableCell align="center">
                            <IconButton size="small" color="primary">
                              <EditIcon />
                            </IconButton>
                            <IconButton size="small" color="error">
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Đóng</Button>
          <Button variant="contained" color="primary" onClick={() => onSave(formData)}>
            Lưu
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openTaskDialog} onClose={() => setOpenTaskDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Thêm công việc</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tên công việc"
                name="name"
                value={taskFormData.name}
                onChange={handleTaskFormChange}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="date"
                label="Ngày bắt đầu"
                name="startDate"
                value={taskFormData.startDate}
                onChange={handleTaskFormChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="date"
                label="Ngày kết thúc"
                name="endDate"
                value={taskFormData.endDate}
                onChange={handleTaskFormChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth required>
                <InputLabel>Người thực hiện</InputLabel>
                <Select
                  name="assignee"
                  value={taskFormData.assignee}
                  onChange={handleTaskFormChange}
                  label="Người thực hiện"
                >
                  <MenuItem value="Nguyễn Văn B">Nguyễn Văn B</MenuItem>
                  <MenuItem value="Trần Văn C">Trần Văn C</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth required>
                <InputLabel>Người giám sát</InputLabel>
                <Select
                  name="supervisor"
                  value={taskFormData.supervisor}
                  onChange={handleTaskFormChange}
                  label="Người giám sát"
                >
                  <MenuItem value="Trần Văn A">Trần Văn A</MenuItem>
                  <MenuItem value="Lê Văn B">Lê Văn B</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTaskDialog(false)}>Hủy</Button>
          <Button variant="contained" color="primary" onClick={handleSaveTask}>
            Lưu
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default RiskEdit;
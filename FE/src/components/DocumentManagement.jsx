import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Divider,
  Chip,
  Stack,
  Breadcrumbs,
  Link,
  Tooltip,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Share as ShareIcon,
  Download as DownloadIcon,
  Folder as FolderIcon,
  Description as FileIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import documentService from '../services/documentService';
import departmentService from '../services/departmentService';
import projectService from '../services/projectService';
import staffService from '../services/staffService';

const DocumentManagement = () => {
  const [documents, setDocuments] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [openShareDialog, setOpenShareDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [currentPath, setCurrentPath] = useState([{ name: 'Tất cả tài liệu', id: 'root' }]);
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadForm, setUploadForm] = useState({
    name: '',
    code: '',
    documentTypeId: '',
    departmentId: '',
    file: null
  });
  const [departments, setDepartments] = useState([]);
  const [documentTypes] = useState([
    { id: 1, name: 'Quy định' },
    { id: 2, name: 'Dự án' },
    { id: 3, name: 'Báo cáo' }
  ]);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedDocumentDetail, setSelectedDocumentDetail] = useState(null);
  const [projects, setProjects] = useState([]);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    code: '',
    documentTypeId: '',
    departmentId: '',
    description: '',
    status: 1,
    filePath: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [userNames, setUserNames] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      const filter = {
        search: searchTerm,
        departmentId: selectedDepartment || undefined,
        projectId: selectedProject || undefined
      };
      const response = await documentService.searchDocuments(filter, page - 1, rowsPerPage);
      setDocuments(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Không thể tải danh sách tài liệu',
        severity: 'error'
      });
      console.error('Error fetching documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
    fetchDepartments();
    fetchProjects();
    // eslint-disable-next-line
  }, [searchTerm, selectedDepartment, selectedProject, page]);

  const fetchDepartments = async () => {
    try {
      const response = await departmentService.getAll();
      setDepartments(response.data);
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Không thể tải danh sách phòng ban',
        severity: 'error'
      });
      console.error('Error fetching departments:', err);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await projectService.getProjectList();
      setProjects(response);
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Không thể tải danh sách dự án',
        severity: 'error'
      });
      console.error('Error fetching projects:', err);
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleDepartmentChange = (event) => {
    setSelectedDepartment(event.target.value);
  };

  const handleProjectChange = (event) => {
    setSelectedProject(event.target.value);
  };

  const handleUpload = async () => {
    try {
      setLoading(true);
      const response = await documentService.uploadDocument(uploadForm.file, {
        name: uploadForm.name,
        code: uploadForm.code,
        documentTypeId: uploadForm.documentTypeId,
        departmentId: uploadForm.departmentId
      });
      
      if (response.status === 200) {
        setOpenUploadDialog(false);
        setUploadForm({
          name: '',
          code: '',
          documentTypeId: '',
          departmentId: '',
          file: null
        });
        setSnackbar({
          open: true,
          message: 'Tải lên tài liệu thành công',
          severity: 'success'
        });
        fetchDocuments(); // Refresh danh sách
      }
    } catch (err) {
      setError('Không thể tải lên tài liệu');
      console.error('Error uploading document:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (documentId) => {
    try {
      setLoading(true);
      await documentService.downloadDocument(documentId);
      
      setSnackbar({
        open: true,
        message: 'Tải xuống tài liệu thành công',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error downloading document:', err);
      setSnackbar({
        open: true,
        message: err.message || 'Không thể tải xuống tài liệu',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDocument = async () => {
    try {
      setLoading(true);
      // Giữ nguyên status và filePath từ dữ liệu gốc
      const updateData = {
        ...editForm,
        status: selectedDocumentDetail.status,
        filePath: selectedDocumentDetail.filePath
      };
      const response = await documentService.updateDocument(selectedDocumentDetail.id, updateData);
      
      if (response.status === 200) {
        // Hiển thị thông báo thành công
        setError(null);
        setSnackbar({
          open: true,
          message: 'Cập nhật tài liệu thành công',
          severity: 'success'
        });
        // Refresh thông tin tài liệu
        const updatedDoc = await documentService.getDocumentById(selectedDocumentDetail.id);
        setSelectedDocumentDetail(updatedDoc.data);
        fetchDocuments(); // Refresh danh sách
        setIsEditing(false);
      }
    } catch (err) {
      setError('Không thể cập nhật tài liệu');
      console.error('Error updating document:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadForm(prev => ({
        ...prev,
        file,
        name: file.name // Tự động điền tên file
      }));
    }
  };

  const handleShare = (document) => {
    setSelectedDocument(document);
    setOpenShareDialog(true);
  };

  const handleNavigate = (folder) => {
    setCurrentPath([...currentPath, { name: folder.name, id: folder.id }]);
  };

  const handleBreadcrumbClick = (index) => {
    setCurrentPath(currentPath.slice(0, index + 1));
  };

  const fetchUserName = async (userId) => {
    if (!userId || userNames[userId]) return;
    try {
      const response = await staffService.getUserById(userId);
      if (response.data) {
        setUserNames(prev => ({
          ...prev,
          [userId]: response.data.name
        }));
      }
    } catch (err) {
      console.error('Error fetching user name:', err);
    }
  };

  const handleViewDocument = async (document) => {
    try {
      setLoading(true);
      const response = await documentService.getDocumentById(document.id);
      setSelectedDocumentDetail(response.data);
      setEditForm({
        name: response.data.name,
        code: response.data.code,
        documentTypeId: response.data.documentTypeId,
        departmentId: response.data.departmentId,
        description: response.data.description,
        status: response.data.status,
        filePath: response.data.filePath
      });
      
      if (response.data.createBy) {
        fetchUserName(response.data.createBy);
      }
      if (response.data.updateBy) {
        fetchUserName(response.data.updateBy);
      }
      
      setOpenViewDialog(true);
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Không thể tải thông tin tài liệu',
        severity: 'error'
      });
      console.error('Error fetching document details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (documentId) => {
    try {
      setLoading(true);
      const response = await documentService.deleteDocument(documentId);
      
      if (response.status === 200) {
        setOpenDeleteDialog(false);
        setDocumentToDelete(null);
        setSnackbar({
          open: true,
          message: 'Xóa tài liệu thành công',
          severity: 'success'
        });
        fetchDocuments(); // Refresh danh sách sau khi xóa
      }
    } catch (err) {
      setError('Không thể xóa tài liệu');
      console.error('Error deleting document:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (document) => {
    setDocumentToDelete(document);
    setOpenDeleteDialog(true);
  };

  const handleEditClick = (document) => {
    setEditForm({
      name: document.name,
      code: document.code,
      documentTypeId: document.documentTypeId,
      departmentId: document.departmentId
    });
    setSelectedDocument(document);
    setOpenEditDialog(true);
  };

  const handleEdit = async () => {
    try {
      setLoading(true);
      await documentService.updateDocument(selectedDocument.id, editForm);
      setOpenEditDialog(false);
      setSnackbar({
        open: true,
        message: 'Cập nhật tài liệu thành công',
        severity: 'success'
      });
      fetchDocuments(); // Refresh danh sách
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Không thể cập nhật tài liệu',
        severity: 'error'
      });
      console.error('Error updating document:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Quản lý tài liệu
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              label="Tìm kiếm"
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                endAdornment: <SearchIcon color="action" />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Phòng ban</InputLabel>
              <Select
                value={selectedDepartment}
                label="Phòng ban"
                onChange={handleDepartmentChange}
              >
                <MenuItem value="">Tất cả</MenuItem>
                {departments.map(dept => (
                  <MenuItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Dự án</InputLabel>
              <Select
                value={selectedProject}
                label="Dự án"
                onChange={handleProjectChange}
              >
                <MenuItem value="">Tất cả</MenuItem>
                {projects.map(project => (
                  <MenuItem key={project.id} value={project.id}>
                    {project.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenUploadDialog(true)}
            >
              Tải lên
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Breadcrumbs sx={{ mb: 2 }}>
        {currentPath.map((item, index) => (
          <Link
            key={item.id}
            component="button"
            underline="hover"
            color={index === currentPath.length - 1 ? 'text.primary' : 'inherit'}
            onClick={() => handleBreadcrumbClick(index)}
          >
            {item.name}
          </Link>
        ))}
      </Breadcrumbs>

      <List>
        {loading ? (
          <ListItem>
            <ListItemText primary="Đang tải dữ liệu..." />
          </ListItem>
        ) : error ? (
          <ListItem>
            <ListItemText primary={error} />
          </ListItem>
        ) : documents.length === 0 ? (
          <ListItem>
            <ListItemText primary="Không tìm thấy tài liệu" />
          </ListItem>
        ) : (
          documents.map((doc) => (
            <React.Fragment key={doc.id}>
              <ListItem
                button={doc.type === 'folder'}
                onClick={() => doc.type === 'folder' ? handleNavigate(doc) : handleViewDocument(doc)}
              >
                <ListItemIcon>
                  {doc.type === 'folder' ? <FolderIcon color="primary" /> : <FileIcon />}
                </ListItemIcon>
                <ListItemText
                  primary={doc.name}
                  secondary={
                    doc.type === 'folder'
                      ? `${doc.items || 0} mục | ${doc.category || ''} | ${doc.departmentName || ''}`
                      : `${doc.size || ''} | ${doc.uploadedBy || doc.createBy || ''} | ${doc.uploadedDate || doc.createDate || ''}`
                  }
                />
                <ListItemSecondaryAction>
                  <Stack direction="row" spacing={1}>
                    {doc.type !== 'folder' && (
                        <Tooltip title="Tải xuống">
                        <IconButton 
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(doc.id);
                          }}
                        >
                            <DownloadIcon />
                          </IconButton>
                        </Tooltip>
                    )}
                    <Tooltip title="Xóa">
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(doc);
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </ListItemSecondaryAction>
              </ListItem>
              <Divider />
            </React.Fragment>
          ))
        )}
      </List>

      {/* Dialog tải lên tài liệu */}
      <Dialog
        open={openUploadDialog}
        onClose={() => setOpenUploadDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Tải lên tài liệu</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                sx={{ height: 100 }}
              >
                {uploadForm.file ? uploadForm.file.name : 'Chọn tệp để tải lên'}
                <input 
                  type="file" 
                  hidden 
                  onChange={handleFileChange}
                />
              </Button>
            </Grid>
            <Grid item xs={12}>
              <TextField 
                fullWidth 
                label="Mã tài liệu"
                value={uploadForm.code}
                onChange={(e) => setUploadForm(prev => ({ ...prev, code: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField 
                fullWidth 
                label="Tên tài liệu"
                value={uploadForm.name}
                onChange={(e) => setUploadForm(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Phân loại</InputLabel>
                <Select 
                  label="Phân loại"
                  value={uploadForm.documentTypeId}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, documentTypeId: e.target.value }))}
                >
                  {documentTypes.map(type => (
                    <MenuItem key={type.id} value={type.id}>
                      {type.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Phòng ban</InputLabel>
                <Select 
                  label="Phòng ban"
                  value={uploadForm.departmentId}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, departmentId: e.target.value }))}
                >
                  {departments.map(dept => (
                    <MenuItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUploadDialog(false)}>Hủy</Button>
          <Button 
            variant="contained" 
            onClick={handleUpload}
            disabled={!uploadForm.file || !uploadForm.name || !uploadForm.documentTypeId || !uploadForm.departmentId || loading}
          >
            {loading ? 'Đang tải lên...' : 'Tải lên'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog xem chi tiết tài liệu */}
      <Dialog
        open={openViewDialog}
        onClose={() => {
          setOpenViewDialog(false);
          setIsEditing(false);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">Chi tiết tài liệu</Typography>
            <Box>
              {!isEditing && (
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => setIsEditing(true)}
                  sx={{ mr: 1 }}
                >
                  Chỉnh sửa
                </Button>
              )}
              <IconButton onClick={() => {
                setOpenViewDialog(false);
                setIsEditing(false);
              }} size="small">
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedDocumentDetail && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                  {isEditing ? (
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Mã tài liệu"
                          value={editForm.code}
                          onChange={(e) => setEditForm(prev => ({ ...prev, code: e.target.value }))}
                          required
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Tên tài liệu"
                          value={editForm.name}
                          onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                          required
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                          <InputLabel>Phân loại</InputLabel>
                          <Select
                            label="Phân loại"
                            value={editForm.documentTypeId}
                            onChange={(e) => setEditForm(prev => ({ ...prev, documentTypeId: e.target.value }))}
                          >
                            {documentTypes.map(type => (
                              <MenuItem key={type.id} value={type.id}>
                                {type.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                          <InputLabel>Phòng ban</InputLabel>
                          <Select
                            label="Phòng ban"
                            value={editForm.departmentId}
                            onChange={(e) => setEditForm(prev => ({ ...prev, departmentId: e.target.value }))}
                          >
                            {departments.map(dept => (
                              <MenuItem key={dept.id} value={dept.id}>
                                {dept.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Mô tả"
                          multiline
                          rows={4}
                          value={editForm.description}
                          onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                        />
                      </Grid>
                    </Grid>
                  ) : (
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Mã tài liệu
                        </Typography>
                        <Typography variant="body1">
                          {selectedDocumentDetail.code || 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Tên tài liệu
                        </Typography>
                        <Typography variant="body1">
                          {selectedDocumentDetail.name}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Loại tài liệu
                        </Typography>
                        <Typography variant="body1">
                          {documentTypes.find(type => type.id === selectedDocumentDetail.documentTypeId)?.name || 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Phòng ban
                        </Typography>
                        <Typography variant="body1">
                          {departments.find(dept => dept.id === selectedDocumentDetail.departmentId)?.name || 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Mô tả
                        </Typography>
                        <Typography variant="body1">
                          {selectedDocumentDetail.description || 'Không có mô tả'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Dự án
                        </Typography>
                        <Typography variant="body1">
                          {selectedDocumentDetail.projectId ? 
                            projects.find(project => project.id === selectedDocumentDetail.projectId)?.name || 'N/A' 
                            : 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Người tạo
                        </Typography>
                        <Typography variant="body1">
                          {userNames[selectedDocumentDetail.createBy] || 'Đang tải...'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Ngày tạo
                        </Typography>
                        <Typography variant="body1">
                          {selectedDocumentDetail.createDate ? new Date(selectedDocumentDetail.createDate).toLocaleString('vi-VN') : 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Người cập nhật
                        </Typography>
                        <Typography variant="body1">
                          {userNames[selectedDocumentDetail.updateBy] || 'Đang tải...'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Ngày cập nhật
                        </Typography>
                        <Typography variant="body1">
                          {selectedDocumentDetail.modifiedDate ? new Date(selectedDocumentDetail.modifiedDate).toLocaleString('vi-VN') : 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Phiên bản
                        </Typography>
                        <Typography variant="body1">
                          {selectedDocumentDetail.version || '0'}
                        </Typography>
                      </Grid>
                    </Grid>
                  )}
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          {isEditing ? (
            <>
              <Button 
                onClick={() => {
                  setIsEditing(false);
                  setEditForm({
                    name: selectedDocumentDetail.name,
                    code: selectedDocumentDetail.code,
                    documentTypeId: selectedDocumentDetail.documentTypeId,
                    departmentId: selectedDocumentDetail.departmentId,
                    description: selectedDocumentDetail.description,
                    status: selectedDocumentDetail.status,
                    filePath: selectedDocumentDetail.filePath
                  });
                }}
              >
                Hủy
              </Button>
              <Button 
                variant="contained" 
                onClick={handleUpdateDocument}
                disabled={loading || !editForm.name || !editForm.code || !editForm.documentTypeId || !editForm.departmentId}
              >
                {loading ? 'Đang cập nhật...' : 'Lưu thay đổi'}
              </Button>
            </>
          ) : (
            <Button 
              variant="contained" 
              startIcon={<DownloadIcon />}
              onClick={() => handleDownload(selectedDocumentDetail?.id)}
            >
              Tải xuống
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa tài liệu "{documentToDelete?.name}" không?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Hủy</Button>
          <Button 
            variant="contained" 
            color="error" 
            onClick={() => handleDelete(documentToDelete?.id)}
            disabled={loading}
          >
            {loading ? 'Đang xóa...' : 'Xóa'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Sửa tài liệu</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField 
                fullWidth 
                label="Mã tài liệu"
                value={editForm.code}
                onChange={(e) => setEditForm(prev => ({ ...prev, code: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField 
                fullWidth 
                label="Tên tài liệu"
                value={editForm.name}
                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Phân loại</InputLabel>
                <Select 
                  label="Phân loại"
                  value={editForm.documentTypeId}
                  onChange={(e) => setEditForm(prev => ({ ...prev, documentTypeId: e.target.value }))}
                >
                  {documentTypes.map(type => (
                    <MenuItem key={type.id} value={type.id}>
                      {type.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Phòng ban</InputLabel>
            <Select
                  label="Phòng ban"
                  value={editForm.departmentId}
                  onChange={(e) => setEditForm(prev => ({ ...prev, departmentId: e.target.value }))}
                >
                  {departments.map(dept => (
                    <MenuItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </MenuItem>
                  ))}
            </Select>
          </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Hủy</Button>
          <Button 
            variant="contained" 
            onClick={handleEdit}
            disabled={loading || !editForm.name || !editForm.code || !editForm.documentTypeId || !editForm.departmentId}
          >
            {loading ? 'Đang cập nhật...' : 'Cập nhật'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DocumentManagement;
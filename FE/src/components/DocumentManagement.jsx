import React, { useState } from 'react';
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
} from '@mui/icons-material';

const mockDocuments = [
  {
    id: 1,
    name: 'Quy định nội bộ.docx',
    type: 'file',
    category: 'Quy định',
    department: 'Phòng Nhân sự',
    uploadedBy: 'Nguyễn Văn A',
    uploadedDate: '01/08/2023',
    size: '2.5 MB',
    shared: true,
  },
  {
    id: 2,
    name: 'Tài liệu dự án',
    type: 'folder',
    category: 'Dự án',
    department: 'Phòng Kỹ thuật',
    items: 5,
  },
  {
    id: 3,
    name: 'Báo cáo tài chính Q2-2023.xlsx',
    type: 'file',
    category: 'Báo cáo',
    department: 'Phòng Kế toán',
    uploadedBy: 'Trần Thị B',
    uploadedDate: '15/07/2023',
    size: '1.8 MB',
    shared: false,
  },
];

const DocumentManagement = () => {
  const [documents, setDocuments] = useState(mockDocuments);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [openShareDialog, setOpenShareDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [currentPath, setCurrentPath] = useState([{ name: 'Tất cả tài liệu', id: 'root' }]);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  const handleDepartmentChange = (event) => {
    setSelectedDepartment(event.target.value);
  };

  const handleUpload = () => {
    setOpenUploadDialog(true);
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
              <InputLabel>Phân loại</InputLabel>
              <Select
                value={selectedCategory}
                label="Phân loại"
                onChange={handleCategoryChange}
              >
                <MenuItem value="">Tất cả</MenuItem>
                <MenuItem value="Quy định">Quy định</MenuItem>
                <MenuItem value="Dự án">Dự án</MenuItem>
                <MenuItem value="Báo cáo">Báo cáo</MenuItem>
              </Select>
            </FormControl>
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
                <MenuItem value="Phòng Nhân sự">Phòng Nhân sự</MenuItem>
                <MenuItem value="Phòng Kỹ thuật">Phòng Kỹ thuật</MenuItem>
                <MenuItem value="Phòng Kế toán">Phòng Kế toán</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleUpload}
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
        {documents.map((doc) => (
          <React.Fragment key={doc.id}>
            <ListItem
              button={doc.type === 'folder'}
              onClick={() => doc.type === 'folder' && handleNavigate(doc)}
            >
              <ListItemIcon>
                {doc.type === 'folder' ? <FolderIcon color="primary" /> : <FileIcon />}
              </ListItemIcon>
              <ListItemText
                primary={doc.name}
                secondary={
                  doc.type === 'folder'
                    ? `${doc.items} mục | ${doc.category} | ${doc.department}`
                    : `${doc.size} | ${doc.uploadedBy} | ${doc.uploadedDate}`
                }
              />
              <ListItemSecondaryAction>
                <Stack direction="row" spacing={1}>
                  {doc.type === 'file' && (
                    <>
                      <Tooltip title="Tải xuống">
                        <IconButton size="small">
                          <DownloadIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Chia sẻ">
                        <IconButton size="small" onClick={() => handleShare(doc)}>
                          <ShareIcon />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                  <Tooltip title="Xóa">
                    <IconButton size="small" color="error">
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </ListItemSecondaryAction>
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
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
                Chọn tệp để tải lên
                <input type="file" hidden />
              </Button>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Tên tài liệu" />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Phân loại</InputLabel>
                <Select label="Phân loại">
                  <MenuItem value="Quy định">Quy định</MenuItem>
                  <MenuItem value="Dự án">Dự án</MenuItem>
                  <MenuItem value="Báo cáo">Báo cáo</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Phòng ban</InputLabel>
                <Select label="Phòng ban">
                  <MenuItem value="Phòng Nhân sự">Phòng Nhân sự</MenuItem>
                  <MenuItem value="Phòng Kỹ thuật">Phòng Kỹ thuật</MenuItem>
                  <MenuItem value="Phòng Kế toán">Phòng Kế toán</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUploadDialog(false)}>Hủy</Button>
          <Button variant="contained">Tải lên</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog chia sẻ tài liệu */}
      <Dialog
        open={openShareDialog}
        onClose={() => setOpenShareDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Chia sẻ tài liệu</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" gutterBottom>
            {selectedDocument?.name}
          </Typography>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Chia sẻ với</InputLabel>
            <Select
              multiple
              label="Chia sẻ với"
              value={[]}
            >
              <MenuItem value="Phòng Nhân sự">Phòng Nhân sự</MenuItem>
              <MenuItem value="Phòng Kỹ thuật">Phòng Kỹ thuật</MenuItem>
              <MenuItem value="Phòng Kế toán">Phòng Kế toán</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenShareDialog(false)}>Hủy</Button>
          <Button variant="contained">Chia sẻ</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DocumentManagement;
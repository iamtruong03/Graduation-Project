package com.dev.truongdev.service.impl;

import com.dev.truongdev.dto.DocumentDTO;
import com.dev.truongdev.entity.Document;
import com.dev.truongdev.entity.Department;
import com.dev.truongdev.entity.User;
import com.dev.truongdev.payload.filter.DocumentFilter;
import com.dev.truongdev.repo.DocumentRepo;
import com.dev.truongdev.repo.DepartmentRepo;
import com.dev.truongdev.service.IDocumentService;
import com.dev.truongdev.service.IDepartmentService;
import com.dev.truongdev.service.IProjectService;
import com.dev.truongdev.service.IUserService;
import com.dev.truongdev.xdevbase.service.impl.XDevBaseServiceImpl;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.BeanUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

/**
 * Service implementation quản lý tài liệu (Document).
 * Xử lý upload, download, quản lý tài liệu với kiểm soát truy cập theo phòng ban.
 */
@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class DocumentServiceImpl extends XDevBaseServiceImpl<Document, DocumentFilter, DocumentRepo>
    implements IDocumentService {

    DocumentRepo documentRepo;
    IDepartmentService departmentService;
    IProjectService projectService;
    DepartmentRepo departmentRepo;
    IUserService userService;
    Path uploadDir;

    public DocumentServiceImpl(DocumentRepo repo,
        IDepartmentService departmentService,
        IProjectService projectService,
        DepartmentRepo departmentRepo,
        IUserService userService) {
        super(repo);
        this.documentRepo = repo;
        this.departmentService = departmentService;
        this.projectService = projectService;
        this.departmentRepo = departmentRepo;
        this.userService = userService;

        this.uploadDir = Paths.get("uploads", "documents");
        initializeUploadDirectory();
    }

    /**
     * Khởi tạo thư mục upload để lưu trữ tài liệu.
     * Tạo thư mục nếu chưa tồn tại.
     */
    private void initializeUploadDirectory() {
        try {
            Files.createDirectories(uploadDir);
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory: " + uploadDir, e);
        }
    }

    /**
     * Xác định MIME type dựa trên phần mở rộng file
     */
    private String getMimeType(String fileExtension) {
        switch (fileExtension.toLowerCase()) {
            case ".pdf":
                return "application/pdf";
            case ".doc":
                return "application/msword";
            case ".docx":
                return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            case ".xls":
                return "application/vnd.ms-excel";
            case ".xlsx":
                return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            case ".ppt":
                return "application/vnd.ms-powerpoint";
            case ".pptx":
                return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
            case ".txt":
                return "text/plain";
            case ".jpg":
            case ".jpeg":
                return "image/jpeg";
            case ".png":
                return "image/png";
            case ".gif":
                return "image/gif";
            case ".zip":
                return "application/zip";
            case ".rar":
                return "application/x-rar-compressed";
            default:
                return "application/octet-stream";
        }
    }

    /**
     * Upload tài liệu mới lên hệ thống.
     * - Tạo tên file duy nhất
     * - Lưu file vào thư mục upload
     * - Tạo bản ghi tài liệu trong database
     *
     * @param uid ID người thực hiện upload
     * @param file File cần upload
     * @param documentDTO Thông tin metadata của tài liệu
     * @return DocumentDTO của tài liệu vừa upload
     * @throws RuntimeException nếu upload thất bại
     */
    @Override
    @Transactional
    public DocumentDTO uploadDocument(String uid, MultipartFile file, DocumentDTO documentDTO) {
        try {
            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            if (originalFilename == null || originalFilename.isEmpty()) {
                throw new RuntimeException("Original filename is required");
            }

            String fileExtension = "";
            int lastDotIndex = originalFilename.lastIndexOf(".");
            if (lastDotIndex > 0) {
                fileExtension = originalFilename.substring(lastDotIndex);
            }

            String fileName = UUID.randomUUID().toString() + fileExtension;

            // Save file
            Path targetLocation = uploadDir.resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            // Xác định MIME type
            String mimeType = getMimeType(fileExtension);

            // Đảm bảo tên file có extension
            String documentName = documentDTO.getName() != null ? documentDTO.getName() : originalFilename;
            if (!documentName.contains(".") && !fileExtension.isEmpty()) {
                documentName = documentName + fileExtension;
            }

            // Create document record
            Document document = new Document();
            document.setCode(documentDTO.getCode());
            document.setName(documentName);
            document.setDescription(documentDTO.getDescription());
            document.setFilePath(targetLocation.toString());
            document.setDocumentTypeId(documentDTO.getDocumentTypeId());
            document.setDepartmentId(documentDTO.getDepartmentId());
            document.setProjectId(documentDTO.getProjectId());
            document.setCreateBy(uid);
            document.setUpdateBy(uid);
            document.setStatus(1);
            document.setMimeType(mimeType);

            document = documentRepo.save(document);
            return convertToDTO(document);
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file: " + file.getOriginalFilename(), e);
        }
    }

    /**
     * Download tài liệu từ hệ thống.
     * - Tìm thông tin tài liệu trong database
     * - Đọc file từ đường dẫn lưu trữ
     */
    @Override
    public byte[] downloadDocument(String uid, Long id) {
        Document document = documentRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Document not found with id: " + id));
        Path filePath = Paths.get(document.getFilePath());
        try {
            if (!Files.exists(filePath)) {
                throw new RuntimeException("File not found: " + filePath);
            }

            // Đọc file và trả về byte array
            byte[] fileContent = Files.readAllBytes(filePath);

            // Nếu chưa có MIME type, xác định và lưu lại
            if (document.getMimeType() == null || document.getMimeType().isEmpty()) {
                String fileName = filePath.getFileName().toString();
                String fileExtension = "";
                int lastDotIndex = fileName.lastIndexOf(".");
                if (lastDotIndex > 0) {
                    fileExtension = fileName.substring(lastDotIndex);
                }

                String mimeType = getMimeType(fileExtension);
                document.setMimeType(mimeType);
                documentRepo.save(document);
            }

            return fileContent;
        } catch (IOException e) {
            throw new RuntimeException("Could not read file: " + filePath, e);
        }
    }

    @Override
    @Transactional
    public void delete(String uid, Long id) {
        Document document = documentRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Document not found with id: " + id));
        try {
            // Delete file first
            Path filePath = Paths.get(document.getFilePath());
            Files.deleteIfExists(filePath);

            // Then delete database record
            documentRepo.deleteById(id);
        } catch (IOException e) {
            throw new RuntimeException("Could not delete file: " + document.getFilePath(), e);
        }
    }

    /**
     * Tìm kiếm tài liệu với kiểm soát truy cập theo phòng ban.
     * - Admin và trưởng phòng ban gốc: xem tất cả tài liệu
     * - Người dùng khác: chỉ xem tài liệu trong phòng ban và phòng ban con
     */
    @Override
    public Page<Document> searchAll(Long departmentId, String uid, DocumentFilter filter, Pageable pageable) {
        User user = userService.getById(uid, Long.valueOf(uid));

        // Check if user is admin or from root department
        boolean hasFullAccess = user.getRole().equals("1") ||
            departmentRepo.findById(departmentId)
                .map(dept -> dept.getParentId() == null)
                .orElse(false);

        if (hasFullAccess) {
            return documentRepo.searchByCodeOrName(
                1, // STATUS_ACTIVE
                filter.getSearch(),
                filter.getDepartmentId(),
                filter.getProjectId(),
                pageable
            );
        }

        // Get department and its sub-departments
        Department department = departmentRepo.findById(departmentId)
            .orElseThrow(() -> new RuntimeException("Department not found with id: " + departmentId));

        List<Long> departmentIds = new java.util.ArrayList<>();
        departmentIds.add(departmentId);
        departmentIds.addAll(
            ((List<Department>) departmentService.getAllSubDepartments(departmentId))
                .stream()
                .map(Department::getId)
                .toList()
        );

        return documentRepo.searchByCodeOrNameAndDepartments(
            1, // STATUS_ACTIVE
            filter.getSearch(),
            departmentIds,
            filter.getProjectId(),
            pageable
        );
    }

    /**
     * Chuyển đổi Document entity thành DocumentDTO.
     * Bao gồm tên phòng ban và tên dự án.
     *
     * @param document Document entity
     * @return DocumentDTO với thông tin đầy đủ
     */
    private DocumentDTO convertToDTO(Document document) {
        DocumentDTO dto = new DocumentDTO();
        BeanUtils.copyProperties(document, dto);

        if (document.getDepartmentId() != null) {
            departmentRepo.findById(document.getDepartmentId()).ifPresent(department ->
                dto.setDepartmentName(department.getName())
            );
        }

        if (document.getProjectId() != null) {
            try {
                dto.setProjectName(projectService.getById("system", document.getProjectId()).getName());
            } catch (Exception e) {
                dto.setProjectName("Unknown");
            }
        }

        return dto;
    }
}
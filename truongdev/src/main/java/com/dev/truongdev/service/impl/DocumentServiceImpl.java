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
import java.util.List;
import java.util.UUID;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DocumentServiceImpl extends XDevBaseServiceImpl<Document, DocumentFilter, DocumentRepo>
        implements IDocumentService {

    final DocumentRepo documentRepo;
    final IDepartmentService departmentService;
    final IProjectService projectService;
    final DepartmentRepo departmentRepo;
    final IUserService userService;
    final String uploadDir = "uploads/documents";

    public DocumentServiceImpl(DocumentRepo repo, IDepartmentService departmentService, IProjectService projectService, DepartmentRepo departmentRepo, IUserService userService) {
        super(repo);
        this.documentRepo = repo;
        this.departmentService = departmentService;
        this.projectService = projectService;
        this.departmentRepo = departmentRepo;
        this.userService = userService;
        
        // Create upload directory if it doesn't exist
        try {
            Files.createDirectories(Paths.get(uploadDir));
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory!", e);
        }
    }

    @Override
    public DocumentDTO getDocumentById(Long id) {
        Document document = documentRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Document not found"));
        return convertToDTO(document);
    }

    @Override
    @Transactional
    public DocumentDTO updateDocument(Long id, DocumentDTO documentDTO) {
        Document document = documentRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Document not found"));
        
        document.setName(documentDTO.getName());
        document.setDescription(documentDTO.getDescription());
        document.setDocumentTypeId(documentDTO.getDocumentTypeId());
        document.setDepartmentId(documentDTO.getDepartmentId());
        document.setProjectId(documentDTO.getProjectId());
        
        document = documentRepo.save(document);
        return convertToDTO(document);
    }

    @Override
    @Transactional
    public DocumentDTO uploadDocument(MultipartFile file, DocumentDTO documentDTO) {
        try {
            String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path filePath = Paths.get(uploadDir, fileName);
            Files.copy(file.getInputStream(), filePath);

            Document document = new Document();
            document.setName(documentDTO.getName());
            document.setDescription(documentDTO.getDescription());
            document.setFilePath(filePath.toString());
            document.setDocumentTypeId(documentDTO.getDocumentTypeId());
            document.setDepartmentId(documentDTO.getDepartmentId());
            document.setProjectId(documentDTO.getProjectId());

            document = documentRepo.save(document);
            return convertToDTO(document);
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file", e);
        }
    }

    @Override
    public byte[] downloadDocument(Long id) {
        Document document = documentRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Document not found"));
        try {
            Path path = Paths.get(document.getFilePath());
            return Files.readAllBytes(path);
        } catch (IOException e) {
            throw new RuntimeException("Could not read file", e);
        }
    }

    @Override
    public void deleteDocument(Long id) {
        Document document = documentRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Document not found"));
        try {
            Files.deleteIfExists(Paths.get(document.getFilePath()));
            documentRepo.deleteById(id);
        } catch (IOException e) {
            throw new RuntimeException("Could not delete file", e);
        }
    }

    @Override
    public Page<Document> searchAll(Long departmentId, String uid, DocumentFilter filter, Pageable pageable) {
        // Lấy user
        User user = userService.getById(uid, Long.valueOf(uid));

        Page<Document> page;

        // Kiểm tra quyền admin hoặc phòng ban gốc
        if (user.getRole().equals("ROLE_ADMIN") ||
            (departmentRepo.findById(departmentId).get().getParentId() == null)) {
            // Tìm kiếm toàn bộ document
            page = documentRepo.searchByCodeOrName(
                1, // STATUS_ACTIVE
                filter.getSearch(),
                pageable
            );
        } else {
            // Tìm kiếm trong phòng ban và phòng ban con
            Department department = departmentRepo.findById(departmentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phòng ban"));

            List<Long> departmentIds = new java.util.ArrayList<>();
            departmentIds.add(departmentId);
            departmentIds.addAll(
                ((java.util.List<Department>) departmentService.getAllSubDepartments(departmentId))
                    .stream()
                    .map(dept -> dept.getId())
                    .collect(java.util.stream.Collectors.toList())
            );

            page = documentRepo.searchByCodeOrNameAndDepartments(
                1, // STATUS_ACTIVE
                filter.getSearch(),
                departmentIds,
                pageable
            );
        }
        return page;
        // Nếu muốn trả về Page<DocumentDTO> thì cần map như page.map(this::convertToDTO)
    }

    private DocumentDTO convertToDTO(Document document) {
        DocumentDTO dto = new DocumentDTO();
        BeanUtils.copyProperties(document, dto);
        
        // Set additional display names if needed
        if (document.getDepartmentId() != null) {
            // Add department name
        }
        if (document.getProjectId() != null) {
            // Add project name
        }
        
        return dto;
    }
}

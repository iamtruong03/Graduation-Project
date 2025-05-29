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

    private void initializeUploadDirectory() {
        try {
            Files.createDirectories(uploadDir);
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory: " + uploadDir, e);
        }
    }

    @Override
    public DocumentDTO getDocumentById(Long id) {
        Document document = documentRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Document not found with id: " + id));
        return convertToDTO(document);
    }

    @Override
    @Transactional
    public DocumentDTO updateDocument(Long id, DocumentDTO documentDTO) {
        Document document = documentRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Document not found with id: " + id));
        
        // Validate references exist
        if (documentDTO.getDepartmentId() != null) {
            departmentRepo.findById(documentDTO.getDepartmentId())
                .orElseThrow(() -> new RuntimeException("Department not found with id: " + documentDTO.getDepartmentId()));
        }
        
        if (documentDTO.getProjectId() != null) {
            projectService.getById("system", documentDTO.getProjectId());
        }
        
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
            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
            String fileName = UUID.randomUUID().toString() + fileExtension;
            
            // Save file
            Path targetLocation = uploadDir.resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            // Create document record
            Document document = new Document();
            document.setName(documentDTO.getName() != null ? documentDTO.getName() : originalFilename);
            document.setDescription(documentDTO.getDescription());
            document.setFilePath(targetLocation.toString());
            document.setDocumentTypeId(documentDTO.getDocumentTypeId());
            document.setDepartmentId(documentDTO.getDepartmentId());
            document.setProjectId(documentDTO.getProjectId());

            document = documentRepo.save(document);
            return convertToDTO(document);
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file: " + file.getOriginalFilename(), e);
        }
    }

    @Override
    public byte[] downloadDocument(Long id) {
        Document document = documentRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Document not found with id: " + id));
        try {
            Path filePath = Paths.get(document.getFilePath());
            if (!Files.exists(filePath)) {
                throw new RuntimeException("File not found: " + document.getFilePath());
            }
            return Files.readAllBytes(filePath);
        } catch (IOException e) {
            throw new RuntimeException("Could not read file: " + document.getFilePath(), e);
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

    @Override
    public Page<Document> searchAll(Long departmentId, String uid, DocumentFilter filter, Pageable pageable) {
        User user = userService.getById(uid, Long.valueOf(uid));

        // Check if user is admin or from root department
        boolean hasFullAccess = user.getRole().equals("ROLE_ADMIN") || 
                              departmentRepo.findById(departmentId)
                                  .map(dept -> dept.getParentId() == null)
                                  .orElse(false);

        if (hasFullAccess) {
            return documentRepo.searchByCodeOrName(
                1, // STATUS_ACTIVE
                filter.getSearch(),
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
            pageable
        );
    }

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

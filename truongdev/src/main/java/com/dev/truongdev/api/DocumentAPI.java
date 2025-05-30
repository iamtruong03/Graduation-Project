package com.dev.truongdev.api;

import com.dev.truongdev.dto.DocumentDTO;
import com.dev.truongdev.entity.Document;
import com.dev.truongdev.payload.filter.DocumentFilter;
import com.dev.truongdev.service.IDocumentService;
import com.dev.truongdev.utils.ApiResponse;
import com.dev.truongdev.xdevbase.api.XDevBaseAPI;
import com.dev.truongdev.xdevbase.service.IXDevBaseService;
import java.nio.file.Files;
import java.nio.file.Paths;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class DocumentAPI extends XDevBaseAPI<Document, DocumentFilter> {

    IDocumentService documentService;

    @Override
    @SuppressWarnings("unchecked")
    public <S extends IXDevBaseService<Document, DocumentFilter>> S getService() {
        return (S) documentService;
    }

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<DocumentDTO>> uploadDocument(
            @RequestAttribute String uid,
            @RequestParam("file") MultipartFile file,
            @ModelAttribute DocumentDTO documentDTO) {
        try {
            if (file.isEmpty()) {
                return ApiResponse.error("Please select a file to upload");
            }

            // Validate file size (example: 10MB max)
            if (file.getSize() > 10 * 1024 * 1024) {
                return ApiResponse.error("File size exceeds maximum limit (10MB)");
            }

            DocumentDTO uploaded = documentService.uploadDocument(uid, file, documentDTO);
            return ApiResponse.ok(uploaded);
        } catch (Exception e) {
            return ApiResponse.error("Failed to upload document: " + e.getMessage());
        }
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<byte[]> downloadDocument(
            @RequestAttribute String uid,
            @PathVariable("id") Long id) {
        try {
            // Gọi service để lấy dữ liệu file
            byte[] fileData = documentService.downloadDocument(uid, id);

            // Lấy thông tin tài liệu từ service để lấy tên file và kiểu MIME
            Document document = documentService.getById(uid, id);
            String fileName = document.getName();
            String contentType = Files.probeContentType(Paths.get(document.getFilePath()));
            if (contentType == null) {
                contentType = "application/octet-stream";
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(contentType));
            headers.setContentDispositionFormData("attachment", fileName);
            headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");

            return new ResponseEntity<>(fileData, headers, HttpStatus.OK);
        } catch (Exception e) {
            // Handle the error gracefully
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .body(("{\"error\":\"Failed to download document: " + e.getMessage() + "\"}").getBytes());
        }
    }
}

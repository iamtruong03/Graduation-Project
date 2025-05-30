package com.dev.truongdev.api;

import com.dev.truongdev.dto.DocumentDTO;
import com.dev.truongdev.entity.Document;
import com.dev.truongdev.payload.filter.DocumentFilter;
import com.dev.truongdev.service.IDocumentService;
import com.dev.truongdev.utils.ApiResponse;
import com.dev.truongdev.xdevbase.api.XDevBaseAPI;
import com.dev.truongdev.xdevbase.service.IXDevBaseService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
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

    @GetMapping("/{id}/dto")
    public ResponseEntity<ApiResponse<DocumentDTO>> getDocumentDTO(@PathVariable Long id) {
        try {
            DocumentDTO dto = documentService.getDocumentById(id);
            return ApiResponse.ok(dto);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @PutMapping("/{id}/dto")
    public ResponseEntity<ApiResponse<DocumentDTO>> updateDocumentDTO(
            @PathVariable Long id,
            @RequestBody DocumentDTO documentDTO) {
        try {
            DocumentDTO updated = documentService.updateDocument(id, documentDTO);
            return ApiResponse.ok(updated);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<DocumentDTO>> uploadDocument(
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

            DocumentDTO uploaded = documentService.uploadDocument(file, documentDTO);
            return ApiResponse.ok(uploaded);
        } catch (Exception e) {
            return ApiResponse.error("Failed to upload document: " + e.getMessage());
        }
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<?> downloadDocument(@PathVariable Long id) {
        try {
            byte[] data = documentService.downloadDocument(id);
            DocumentDTO document = documentService.getDocumentById(id);
            ByteArrayResource resource = new ByteArrayResource(data);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, 
                           "attachment;filename=" + document.getName())
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .contentLength(data.length)
                    .body(resource);
        } catch (Exception e) {
            return ApiResponse.error("Failed to download document: " + e.getMessage());
        }
    }
}

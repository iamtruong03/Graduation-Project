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
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DocumentAPI extends XDevBaseAPI<Document, DocumentFilter> {

    final IDocumentService documentService;

    @SuppressWarnings("unchecked")
    public IXDevBaseService<Document, DocumentFilter> getService() {
        return documentService;
    }

    @GetMapping("/{id}/details")
    public ResponseEntity<ApiResponse<DocumentDTO>> getDocumentById(@PathVariable Long id) {
        try {
            return ApiResponse.ok(documentService.getDocumentById(id));
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @PutMapping("/{id}/update")
    public ResponseEntity<ApiResponse<DocumentDTO>> updateDocument(
            @PathVariable Long id,
            @RequestBody DocumentDTO documentDTO) {
        try {
            return ApiResponse.ok(documentService.updateDocument(id, documentDTO));
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<DocumentDTO>> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @ModelAttribute DocumentDTO documentDTO) {
        try {
            return ApiResponse.ok(documentService.uploadDocument(file, documentDTO));
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<ByteArrayResource> downloadDocument(@PathVariable Long id) {
        try {
            byte[] data = documentService.downloadDocument(id);
            DocumentDTO document = documentService.getDocumentById(id);
            ByteArrayResource resource = new ByteArrayResource(data);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment;filename=" + document.getName())
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .contentLength(data.length)
                    .body(resource);
        } catch (Exception e) {
            throw new RuntimeException("Error downloading the file", e);
        }
    }

    @DeleteMapping("/{id}/delete")
    public ResponseEntity<ApiResponse<Void>> deleteDocument(@PathVariable Long id) {
        try {
            documentService.deleteDocument(id);
            return ApiResponse.ok(null);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
}

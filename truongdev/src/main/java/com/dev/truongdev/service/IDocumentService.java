package com.dev.truongdev.service;

import com.dev.truongdev.entity.Document;
import com.dev.truongdev.payload.filter.DocumentFilter;
import com.dev.truongdev.xdevbase.service.IXDevBaseService;
import com.dev.truongdev.dto.DocumentDTO;
import org.springframework.web.multipart.MultipartFile;

public interface IDocumentService extends IXDevBaseService<Document, DocumentFilter> {
    DocumentDTO getDocumentById(Long id);
    DocumentDTO updateDocument(Long id, DocumentDTO documentDTO);
    DocumentDTO uploadDocument(MultipartFile file, DocumentDTO documentDTO);
    byte[] downloadDocument(Long id);
    void deleteDocument(Long id);
}

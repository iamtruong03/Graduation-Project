package com.dev.truongdev.service;

import com.dev.truongdev.entity.Document;
import com.dev.truongdev.payload.filter.DocumentFilter;
import com.dev.truongdev.xdevbase.service.IXDevBaseService;
import com.dev.truongdev.dto.DocumentDTO;
import org.springframework.web.multipart.MultipartFile;

public interface IDocumentService extends IXDevBaseService<Document, DocumentFilter> {

    DocumentDTO getDocumentById(Long id);

    /**
     * Update document using DTO with business validations
     * @param id document id
     * @param documentDTO document data transfer object
     * @return updated DocumentDTO
     */
    DocumentDTO updateDocument(Long id, DocumentDTO documentDTO);

    /**
     * Upload new document with file and metadata
     * @param file the document file to upload
     * @param documentDTO document metadata
     * @return created DocumentDTO
     */
    DocumentDTO uploadDocument(MultipartFile file, DocumentDTO documentDTO);

    /**
     * Download document file by id
     * @param id document id
     * @return file bytes
     */
    byte[] downloadDocument(Long id);
}

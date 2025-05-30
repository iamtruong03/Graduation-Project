package com.dev.truongdev.service;

import com.dev.truongdev.entity.Document;
import com.dev.truongdev.payload.filter.DocumentFilter;
import com.dev.truongdev.xdevbase.service.IXDevBaseService;
import com.dev.truongdev.dto.DocumentDTO;
import org.springframework.web.multipart.MultipartFile;

public interface IDocumentService extends IXDevBaseService<Document, DocumentFilter> {


    /**
     * Upload new document with file and metadata
     * @param uid user id who uploads the document
     * @param file the document file to upload
     * @param documentDTO document metadata
     * @return created DocumentDTO
     */
    DocumentDTO uploadDocument(String uid, MultipartFile file, DocumentDTO documentDTO);

    /**
     * Download document file by id
     * @param uid user id who downloads the document
     * @param id document id
     * @return file bytes
     */
    byte[] downloadDocument(String uid, Long id);
}

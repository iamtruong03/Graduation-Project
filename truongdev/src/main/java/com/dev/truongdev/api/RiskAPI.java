package com.dev.truongdev.api;

import com.dev.truongdev.dto.RiskDTO;
import com.dev.truongdev.dto.RiskHistoryDTO;
import com.dev.truongdev.entity.Risk;
import com.dev.truongdev.payload.filter.RiskFilter;
import com.dev.truongdev.service.IRiskService;
import com.dev.truongdev.service.IExcelExportService;
import com.dev.truongdev.utils.ApiResponse;
import com.dev.truongdev.xdevbase.api.XDevBaseAPI;
import com.dev.truongdev.xdevbase.service.IXDevBaseService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/api/risks")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RiskAPI extends XDevBaseAPI<Risk, RiskFilter> {

    IRiskService riskService;
    IExcelExportService excelExportService;

    @Override
    @SuppressWarnings("unchecked")
    public <S extends IXDevBaseService<Risk, RiskFilter>> S getService() {
        return (S) riskService;
    }

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<RiskDTO>> createRisk(
            @RequestAttribute String uid,
            @RequestBody RiskDTO riskDTO) {
        try {
            return ApiResponse.ok(riskService.createRisk(uid, riskDTO));
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @PostMapping("/{id}/submit-approval")
    public ResponseEntity<ApiResponse<RiskDTO>> submitForApproval(
            @RequestAttribute String uid,
            @PathVariable Long id,
            @RequestBody List<Long> approverIds) {
        try {
            return ApiResponse.ok(riskService.submitForApproval(uid, id, approverIds));
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<RiskDTO>> approveRisk(
            @RequestAttribute String uid,
            @PathVariable Long id,
            @RequestParam String approvedBy) {
        try {
            return ApiResponse.ok(riskService.approveRisk(uid, id, approvedBy));
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<RiskDTO>> rejectRisk(
            @RequestAttribute String uid,
            @PathVariable Long id,
            @RequestParam String reason) {
        try {
            return ApiResponse.ok(riskService.rejectRisk(uid, id, reason));
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @PutMapping("/{id}/update")
    public ResponseEntity<ApiResponse<RiskDTO>> updateRisk(
            @RequestAttribute String uid,
            @PathVariable Long id,
            @RequestBody RiskDTO riskDTO) {
        try {
            riskDTO.setUpdateBy(uid);
            return ApiResponse.ok(riskService.updateRisk(id, riskDTO));
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<ApiResponse<List<RiskHistoryDTO>>> getRiskHistory(
            @RequestAttribute String uid,
            @PathVariable Long id) {
        try {
            return ApiResponse.ok(riskService.getRiskHistory(id));
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @GetMapping("/pending-approval")
    public ResponseEntity<ApiResponse<Page<Risk>>> getPendingApprovalRisks(
            @RequestAttribute String uid,
            RiskFilter filter,
            Pageable pageable) {
        try {
            return ApiResponse.ok(riskService.getPendingApprovalRisks(uid, filter, pageable));
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    /**
     * Export danh sách rủi ro ra file Excel.
     * @param did ID phòng ban (từ JWT token)
     * @param uid ID người dùng yêu cầu (từ JWT token)
     * @param filter Bộ lọc tìm kiếm
     * @return File Excel chứa danh sách rủi ro
     */
    @GetMapping("/export")
    public ResponseEntity<byte[]> exportRisks(
            @RequestAttribute Long did,
            @RequestAttribute String uid,
            RiskFilter filter) {
        try {
            ByteArrayOutputStream outputStream = excelExportService.exportRisks(did, uid, filter);
            
            // Tạo tên file với timestamp
            String fileName = "DanhSachRuiRo_" + 
                java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + 
                ".xlsx";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
            headers.setContentDispositionFormData("attachment", fileName);
            headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");
            
            return new ResponseEntity<>(outputStream.toByteArray(), headers, HttpStatus.OK);
                    
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .body(("{\"error\":\"" + e.getMessage() + "\"}").getBytes());
        }
    }

} 
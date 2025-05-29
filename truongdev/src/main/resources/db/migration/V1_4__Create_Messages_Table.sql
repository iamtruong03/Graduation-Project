-- Tạo bảng messages cho hệ thống chat realtime
CREATE TABLE messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sender_id VARCHAR(255) NOT NULL COMMENT 'ID người gửi tin nhắn',
    receiver_id VARCHAR(255) NOT NULL COMMENT 'ID người nhận tin nhắn',
    content TEXT NOT NULL COMMENT 'Nội dung tin nhắn',
    timestamp DATETIME NOT NULL COMMENT 'Thời gian gửi tin nhắn',
    is_read BOOLEAN DEFAULT FALSE COMMENT 'Trạng thái đã đọc (true = đã đọc, false = chưa đọc)',
    message_type VARCHAR(50) DEFAULT 'TEXT' COMMENT 'Loại tin nhắn (TEXT, IMAGE, FILE, etc.)',
    department_id BIGINT COMMENT 'ID phòng ban để kiểm soát quyền truy cập',
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Ngày tạo record',
    updated_date DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Ngày cập nhật record',
    created_by VARCHAR(255) COMMENT 'Người tạo record',
    updated_by VARCHAR(255) COMMENT 'Người cập nhật record',
    
    -- Indexes để tối ưu hiệu suất truy vấn
    INDEX idx_sender_receiver (sender_id, receiver_id),
    INDEX idx_receiver_unread (receiver_id, is_read),
    INDEX idx_timestamp (timestamp),
    INDEX idx_department (department_id),
    
    -- Foreign key constraints
    CONSTRAINT fk_messages_department 
        FOREIGN KEY (department_id) 
        REFERENCES departments(id) 
        ON DELETE SET NULL
) COMMENT = 'Bảng lưu trữ tin nhắn chat realtime'; 
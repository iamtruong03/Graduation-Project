package com.dev.truongdev.service;

import com.dev.truongdev.dto.MessageDTO;
import com.dev.truongdev.entity.Message;
import com.dev.truongdev.payload.filter.MessageFilter;
import com.dev.truongdev.xdevbase.service.IXDevBaseService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface IMessageService extends IXDevBaseService<Message, MessageFilter> {
    
    /**
     * Gửi tin nhắn
     * @param messageDTO Thông tin tin nhắn
     * @return Tin nhắn đã gửi
     */
    MessageDTO sendMessage(MessageDTO messageDTO);
    
    /**
     * Lấy cuộc trò chuyện giữa 2 người dùng
     * @param senderId ID người gửi
     * @param receiverId ID người nhận
     * @param pageable Phân trang
     * @return Danh sách tin nhắn
     */
    Page<MessageDTO> getConversation(String senderId, String receiverId, Pageable pageable);
    
    /**
     * Lấy danh sách cuộc trò chuyện gần nhất
     * @param userId ID người dùng
     * @return Danh sách cuộc trò chuyện
     */
    List<MessageDTO> getRecentConversations(String userId);
    
    /**
     * Lấy tin nhắn chưa đọc
     * @param userId ID người dùng
     * @return Danh sách tin nhắn chưa đọc
     */
    List<MessageDTO> getUnreadMessages(String userId);
    
    /**
     * Đếm số tin nhắn chưa đọc
     * @param userId ID người dùng
     * @return Số lượng tin nhắn chưa đọc
     */
    Long countUnreadMessages(String userId);
    
    /**
     * Đánh dấu tin nhắn đã đọc
     * @param senderId ID người gửi
     * @param receiverId ID người nhận
     */
    void markMessagesAsRead(String senderId, String receiverId);
    
    /**
     * Xóa tin nhắn
     * @param messageId ID tin nhắn
     * @param userId ID người dùng (để kiểm tra quyền)
     */
    void deleteMessage(Long messageId, String userId);
    
    /**
     * Lấy tin nhắn theo phòng ban (cho admin)
     * @param departmentId ID phòng ban
     * @param pageable Phân trang
     * @return Danh sách tin nhắn
     */
    Page<MessageDTO> getMessagesByDepartment(Long departmentId, Pageable pageable);
    
    /**
     * Tạo room ID duy nhất cho 2 người dùng
     * @param userId1 ID người dùng 1
     * @param userId2 ID người dùng 2
     * @return Room ID
     */
    String createChatRoomId(String userId1, String userId2);
}
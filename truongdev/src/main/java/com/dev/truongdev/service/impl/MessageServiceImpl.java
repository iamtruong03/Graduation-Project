package com.dev.truongdev.service.impl;

import com.dev.truongdev.dto.MessageDTO;
import com.dev.truongdev.entity.Message;
import com.dev.truongdev.payload.filter.MessageFilter;
import com.dev.truongdev.repo.MessageRepo;
import com.dev.truongdev.repo.UserRepo;
import com.dev.truongdev.service.IMessageService;
import com.dev.truongdev.xdevbase.service.impl.XDevBaseServiceImpl;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MessageServiceImpl
    extends XDevBaseServiceImpl<Message, MessageFilter, MessageRepo>
    implements IMessageService {

    final MessageRepo repo;
    final UserRepo userRepo;

    public MessageServiceImpl(MessageRepo repo, UserRepo userRepo) {
        super(repo);
        this.repo = repo;
        this.userRepo = userRepo;
    }

    // New WebSocket methods
    @Override
    public MessageDTO sendMessage(MessageDTO messageDTO) {
        // Tạo entity Message từ DTO
        Message message = Message.builder()
                .senderId(messageDTO.getSenderId())
                .receiverId(messageDTO.getReceiverId())
                .content(messageDTO.getContent())
                .timestamp(new Date())
                .isRead(false)
                .messageType(messageDTO.getMessageType() != null ? messageDTO.getMessageType() : "TEXT")
                .departmentId(messageDTO.getDepartmentId())
                .build();

        // Lưu tin nhắn vào database
        Message savedMessage = repo.save(message);
        
        // Convert và trả về DTO
        return convertToDTO(savedMessage);
    }

    /**
     * Lấy cuộc trò chuyện giữa 2 người dùng với phân trang
     * @param senderId ID người gửi
     * @param receiverId ID người nhận
     * @param pageable Thông tin phân trang
     * @return Danh sách tin nhắn đã phân trang
     */
    @Override
    public Page<MessageDTO> getConversation(String senderId, String receiverId, Pageable pageable) {
        Page<Message> messages = repo.findConversationByStringIds(senderId, receiverId, pageable);
        return messages.map(this::convertToDTO);
    }

    /**
     * Lấy danh sách cuộc trò chuyện gần nhất của người dùng
     * @param userId ID người dùng
     * @return Danh sách tin nhắn gần nhất từ mỗi cuộc trò chuyện
     */
    @Override
    public List<MessageDTO> getRecentConversations(String userId) {
        List<Message> messages = repo.findRecentConversationsByStringId(userId);
        return messages.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Lấy tất cả tin nhắn chưa đọc của người dùng
     * @param userId ID người dùng
     * @return Danh sách tin nhắn chưa đọc
     */
    @Override
    public List<MessageDTO> getUnreadMessages(String userId) {
        List<Message> messages = repo.findUnreadMessagesByStringId(userId);
        return messages.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Đếm số lượng tin nhắn chưa đọc của người dùng
     * @param userId ID người dùng
     * @return Số lượng tin nhắn chưa đọc
     */
    @Override
    public Long countUnreadMessages(String userId) {
        return repo.countUnreadMessagesByStringId(userId);
    }

    /**
     * Đánh dấu tất cả tin nhắn trong cuộc trò chuyện là đã đọc
     * @param senderId ID người gửi
     * @param receiverId ID người nhận
     */
    @Override
    @Transactional
    public void markMessagesAsRead(String senderId, String receiverId) {
        repo.markConversationAsReadByStringIds(senderId, receiverId);
    }

    /**
     * Xóa tin nhắn (chỉ người gửi mới có quyền xóa)
     * @param messageId ID tin nhắn cần xóa
     * @param userId ID người dùng thực hiện xóa
     * @throws RuntimeException nếu không có quyền xóa hoặc tin nhắn không tồn tại
     */
    @Override
    @Transactional
    public void deleteMessage(Long messageId, String userId) {
        Message message = repo.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Tin nhắn không tồn tại"));
        
        // Chỉ người gửi mới có quyền xóa tin nhắn
        if (!message.getSenderId().equals(userId)) {
            throw new RuntimeException("Bạn không có quyền xóa tin nhắn này");
        }
        
        repo.delete(message);
    }

    /**
     * Lấy tin nhắn theo phòng ban (dành cho admin quản lý)
     * @param departmentId ID phòng ban
     * @param pageable Thông tin phân trang
     * @return Danh sách tin nhắn của phòng ban
     */
    @Override
    public Page<MessageDTO> getMessagesByDepartment(Long departmentId, Pageable pageable) {
        Page<Message> messages = repo.findByDepartmentId(departmentId, pageable);
        return messages.map(this::convertToDTO);
    }

    /**
     * Tạo room ID duy nhất cho cuộc trò chuyện giữa 2 người dùng
     * @param userId1 ID người dùng thứ nhất
     * @param userId2 ID người dùng thứ hai
     * @return Room ID được sắp xếp theo thứ tự alphabet để đảm bảo tính nhất quán
     */
    @Override
    public String createChatRoomId(String userId1, String userId2) {
        // Sắp xếp 2 userId theo thứ tự alphabet để tạo room ID nhất quán
        if (userId1.compareTo(userId2) < 0) {
            return userId1 + "_" + userId2;
        } else {
            return userId2 + "_" + userId1;
        }
    }

    /**
     * Convert Message entity sang MessageDTO và bổ sung thông tin hiển thị
     * @param message Message entity
     * @return MessageDTO với đầy đủ thông tin
     */
    private MessageDTO convertToDTO(Message message) {
        MessageDTO dto = new MessageDTO();
        dto.setId(message.getId());
        dto.setSenderId(message.getSenderId());
        dto.setReceiverId(message.getReceiverId());
        dto.setContent(message.getContent());
        dto.setTimestamp(message.getTimestamp());
        dto.setIsRead(message.getIsRead());
        dto.setMessageType(message.getMessageType());
        dto.setDepartmentId(message.getDepartmentId());
        
        // Lấy thông tin người gửi và người nhận
        userRepo.findById(Long.parseLong(message.getSenderId())).ifPresent(sender -> {
            dto.setSenderName(sender.getName());
        });
        
        userRepo.findById(Long.parseLong(message.getReceiverId())).ifPresent(receiver -> {
            dto.setReceiverName(receiver.getName());
        });
        
        // Tạo chat room ID
        dto.setChatRoomId(createChatRoomId(message.getSenderId(), message.getReceiverId()));
        
        // Tính toán thời gian "x phút trước"
        dto.setTimeAgo(calculateTimeAgo(message.getTimestamp()));
        
        return dto;
    }

    /**
     * Tính toán thời gian đã trôi qua từ khi gửi tin nhắn
     * @param timestamp Thời gian gửi tin nhắn
     * @return Chuỗi mô tả thời gian (VD: "5 phút trước", "2 giờ trước")
     */
    private String calculateTimeAgo(Date timestamp) {
        long diff = System.currentTimeMillis() - timestamp.getTime();
        
        long minutes = TimeUnit.MILLISECONDS.toMinutes(diff);
        long hours = TimeUnit.MILLISECONDS.toHours(diff);
        long days = TimeUnit.MILLISECONDS.toDays(diff);
        
        if (minutes < 1) {
            return "Vừa xong";
        } else if (minutes < 60) {
            return minutes + " phút trước";
        } else if (hours < 24) {
            return hours + " giờ trước";
        } else if (days < 7) {
            return days + " ngày trước";
        } else {
            // Hiển thị ngày tháng cụ thể nếu quá 1 tuần
            SimpleDateFormat sdf = new SimpleDateFormat("dd/MM/yyyy HH:mm");
            return sdf.format(timestamp);
        }
    }
}
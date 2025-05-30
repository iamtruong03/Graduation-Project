package com.dev.truongdev.repo;

import com.dev.truongdev.entity.Message;
import com.dev.truongdev.xdevbase.repo.XDevBaseRepo;
import jakarta.persistence.QueryHint;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.QueryHints;
import java.util.List;
import org.springframework.stereotype.Repository;

@Repository
public interface MessageRepo extends XDevBaseRepo<Message> {
    @Query(value = "SELECT m FROM Message m WHERE (m.senderId = :user1Id AND m.receiverId = :user2Id) OR (m.senderId = :user2Id AND m.receiverId = :user1Id) ORDER BY m.timestamp ASC")
    @QueryHints(@QueryHint(name = "org.hibernate.cacheable", value = "true"))
    List<Message> findMessagesBetweenUsers(@Param("user1Id") Long user1Id, @Param("user2Id") Long user2Id);

    @Query(value = "SELECT m FROM Message m WHERE m.receiverId = :receiverId AND m.isRead = false ORDER BY m.timestamp DESC")
    @QueryHints(@QueryHint(name = "org.hibernate.cacheable", value = "true"))
    List<Message> findByReceiverIdAndIsReadFalseOrderByTimestampDesc(@Param("receiverId") Long receiverId);

    @Query(value = "SELECT DISTINCT m.senderId FROM Message m WHERE m.receiverId = :userId AND EXISTS (SELECT 1 FROM Message m2 WHERE m2.senderId = m.senderId AND m2.receiverId = :userId AND m2.timestamp = (SELECT MAX(m3.timestamp) FROM Message m3 WHERE m3.senderId = m.senderId AND m3.receiverId = :userId))")
    @QueryHints(@QueryHint(name = "org.hibernate.cacheable", value = "true"))
    List<Long> findRecentChatUsers(@Param("userId") Long userId);

    @Query("SELECT m FROM Message m WHERE " +
           "(m.senderId = :senderId AND m.receiverId = :receiverId) OR " +
           "(m.senderId = :receiverId AND m.receiverId = :senderId) " +
           "ORDER BY m.timestamp DESC")
    @QueryHints(@QueryHint(name = "org.hibernate.cacheable", value = "true"))
    Page<Message> findConversationByStringIds(@Param("senderId") String senderId, 
                                              @Param("receiverId") String receiverId, 
                                              Pageable pageable);

    @Query("SELECT m FROM Message m WHERE m.receiverId = :receiverId AND m.isRead = false ORDER BY m.timestamp DESC")
    @QueryHints(@QueryHint(name = "org.hibernate.cacheable", value = "true"))
    List<Message> findUnreadMessagesByStringId(@Param("receiverId") String receiverId);

    @Query("SELECT COUNT(m) FROM Message m WHERE m.receiverId = :receiverId AND m.isRead = false")
    Long countUnreadMessagesByStringId(@Param("receiverId") String receiverId);

    @Query("SELECT m FROM Message m WHERE " +
           "m.id IN (SELECT MAX(m2.id) FROM Message m2 WHERE " +
           "(m2.senderId = :userId OR m2.receiverId = :userId) " +
           "GROUP BY CASE WHEN m2.senderId = :userId THEN m2.receiverId ELSE m2.senderId END) " +
           "ORDER BY m.timestamp DESC")
    @QueryHints(@QueryHint(name = "org.hibernate.cacheable", value = "true"))
    List<Message> findRecentConversationsByStringId(@Param("userId") String userId);

    @Query("SELECT m FROM Message m WHERE m.departmentId = :departmentId ORDER BY m.timestamp DESC")
    @QueryHints(@QueryHint(name = "org.hibernate.cacheable", value = "true"))
    Page<Message> findByDepartmentId(@Param("departmentId") Long departmentId, Pageable pageable);

    @Modifying
    @Query("UPDATE Message m SET m.isRead = true WHERE " +
           "m.senderId = :senderId AND m.receiverId = :receiverId AND m.isRead = false")
    void markConversationAsReadByStringIds(@Param("senderId") String senderId, @Param("receiverId") String receiverId);
}
package com.campusreuse.backend.service;

import com.campusreuse.backend.model.ChatRoom;
import com.campusreuse.backend.repository.ChatRoomRepository;
import com.campusreuse.backend.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@EnableScheduling
public class ChatCleanupService {

    @Autowired
    private ChatRoomRepository chatRoomRepository;

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // Run every 10 minutes
    @Scheduled(fixedRate = 600000)
    @Transactional
    public void cleanupExpiredChats() {
        LocalDateTime now = LocalDateTime.now();
        List<ChatRoom> allRooms = chatRoomRepository.findAll();
        
        for (ChatRoom room : allRooms) {
            if ("ACTIVE".equals(room.getStatus()) && room.getExpiresAt().isBefore(now)) {
                room.setStatus("EXPIRED");
                chatRoomRepository.save(room);
                
                // Delete messages for privacy
                List<com.campusreuse.backend.model.Message> messages = messageRepository.findByChatRoomIdOrderByTimestampAsc(room.getChatRoomId());
                messageRepository.deleteAll(messages);

                // Send WebSocket notification
                messagingTemplate.convertAndSend("/topic/trip/" + room.getTripId(), 
                    "{\"type\": \"EXPIRED\", \"content\": \"Chat has expired and is now closed.\"}");
            }
        }
    }

    // Run every minute
    @Scheduled(fixedRate = 60000)
    public void sendWarningNotifications() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime tenMinsFromNow = now.plusMinutes(10);
        List<ChatRoom> allRooms = chatRoomRepository.findAll();

        for (ChatRoom room : allRooms) {
            if ("ACTIVE".equals(room.getStatus()) && !room.getWarningSent()) {
                if (room.getExpiresAt().isBefore(tenMinsFromNow) && room.getExpiresAt().isAfter(now)) {
                    // Send WebSocket warning
                    messagingTemplate.convertAndSend("/topic/trip/" + room.getTripId(), 
                        "{\"type\": \"WARNING\", \"content\": \"Chat expires in 10 minutes\"}");
                    
                    room.setWarningSent(true);
                    chatRoomRepository.save(room);
                }
            }
        }
    }
}

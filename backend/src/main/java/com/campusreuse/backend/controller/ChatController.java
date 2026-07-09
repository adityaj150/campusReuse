package com.campusreuse.backend.controller;

import com.campusreuse.backend.model.ChatRoom;
import com.campusreuse.backend.model.Message;
import com.campusreuse.backend.repository.ChatRoomRepository;
import com.campusreuse.backend.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
public class ChatController {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private ChatRoomRepository chatRoomRepository;

    @Autowired
    private com.campusreuse.backend.repository.UserRepository userRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // REST endpoint to fetch chat history
    @GetMapping("/api/chat/{tripId}/messages")
    public ResponseEntity<List<Message>> getMessages(@PathVariable Long tripId) {
        ChatRoom chatRoom = chatRoomRepository.findByTripId(tripId)
                .orElseThrow(() -> new RuntimeException("Chat room not found"));
        List<Message> messages = messageRepository.findByChatRoomIdOrderByTimestampAsc(chatRoom.getChatRoomId());
        
        // Populate sender names
        for (Message msg : messages) {
            userRepository.findById(msg.getSenderId())
                    .ifPresent(user -> msg.setSenderName(user.getName()));
        }

        return ResponseEntity.ok(messages);
    }

    // REST endpoint to get chat room info
    @GetMapping("/api/chat/{tripId}")
    public ResponseEntity<ChatRoom> getChatRoom(@PathVariable Long tripId) {
        ChatRoom chatRoom = chatRoomRepository.findByTripId(tripId)
                .orElseThrow(() -> new RuntimeException("Chat room not found"));
        return ResponseEntity.ok(chatRoom);
    }

    // WebSocket handler for sending messages
    @MessageMapping("/chat/send/{tripId}")
    public void sendMessage(@DestinationVariable Long tripId, @Payload Map<String, Object> payload) {
        // Look up the chat room for this trip
        ChatRoom chatRoom = chatRoomRepository.findByTripId(tripId).orElse(null);
        if (chatRoom == null || "EXPIRED".equals(chatRoom.getStatus())) {
            return; // Silently drop if expired or not found
        }

        // Save message to database
        Message message = new Message();
        message.setChatRoomId(chatRoom.getChatRoomId());
        message.setSenderId(Long.valueOf(payload.get("senderId").toString()));
        message.setContent(payload.get("content").toString());
        message.setTimestamp(LocalDateTime.now());
        messageRepository.save(message);

        // Populate senderName for the broadcast
        userRepository.findById(message.getSenderId())
                .ifPresent(user -> message.setSenderName(user.getName()));

        // Broadcast to all subscribers
        messagingTemplate.convertAndSend("/topic/trip/" + tripId, message);
    }
}

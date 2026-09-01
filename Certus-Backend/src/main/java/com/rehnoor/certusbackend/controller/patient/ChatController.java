package com.rehnoor.certusbackend.controller.patient;

import com.rehnoor.certusbackend.dto.chatbot.ChatRequestDTO;
import com.rehnoor.certusbackend.dto.chatbot.ChatResponseDTO;
import com.rehnoor.certusbackend.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@PreAuthorize("hasRole('PATIENT')")
@RequestMapping("/api/v1/chat")
public class ChatController {

    @Autowired
    private ChatService chatService;

    @PostMapping("/message")
    public ResponseEntity<ChatResponseDTO> getResponse(@RequestBody ChatRequestDTO chatRequest) {
        return ResponseEntity.ok(chatService.chatResponse(chatRequest));
    }
}

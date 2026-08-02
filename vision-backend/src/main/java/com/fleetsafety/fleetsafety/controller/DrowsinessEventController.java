package com.fleetsafety.fleetsafety.controller;

import com.fleetsafety.fleetsafety.domain.DrowsinessEvent;
import com.fleetsafety.fleetsafety.dto.DrowsinessEventRequest;
import com.fleetsafety.fleetsafety.service.DrowsinessEventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/events/drowsiness")
public class DrowsinessEventController {
    @Autowired
    private DrowsinessEventService service;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // 1. Recibe eventos desde la cámara de Python
    @PostMapping
    public ResponseEntity<DrowsinessEvent> createEvent(@RequestBody DrowsinessEventRequest request) {
        // Guarda en MongoDB
        DrowsinessEvent savedEvent = service.processAndSaveEvent(request);

        // Emitir inmediatamente al Dashboard Web (React) vía WebSocket
        messagingTemplate.convertAndSend("/topic/alerts", savedEvent);

        return ResponseEntity.status(HttpStatus.CREATED).body(savedEvent);
    }

    // 2. Endpoint que consulta React al abrir el Dashboard para llenar la tabla
    @GetMapping
    public ResponseEntity<List<DrowsinessEvent>> getEvents(
            @RequestParam(required = false) String vehicleId) {
        List<DrowsinessEvent> events = service.getRecentEvents(vehicleId);
        return ResponseEntity.ok(events);
    }
}

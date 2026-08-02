package com.fleetsafety.fleetsafety.service;

import com.fleetsafety.fleetsafety.domain.DrowsinessEvent;
import com.fleetsafety.fleetsafety.dto.DrowsinessEventRequest;
import com.fleetsafety.fleetsafety.repository.DrowsinessEventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.Instant;
import java.util.List;

@Service
public class DrowsinessEventService {

    @Autowired
    private DrowsinessEventRepository repository;

    public DrowsinessEvent processAndSaveEvent(DrowsinessEventRequest request) {
        DrowsinessEvent event = new DrowsinessEvent(
                request.getVehicleId(),
                request.getDriverId(),
                request.getEarValue(),
                request.getDurationSeconds(),
                request.getTimestamp() != null ? request.getTimestamp() : Instant.now(),
                "CRITICAL"
        );

        return repository.save(event);
    }

    public List<DrowsinessEvent> getRecentEvents(String vehicleId) {
        if (vehicleId != null && !vehicleId.trim().isEmpty()) {
            return repository.findByVehicleIdOrderByTimestampDesc(vehicleId);
        }
        return repository.findTop50ByOrderByTimestampDesc();
    }
}

package com.fleetsafety.fleetsafety.domain;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.Instant;

@Document(collection = "drowsiness_events")
public class DrowsinessEvent {
    @Id
    private String id;
    @Indexed
    private String vehicleId;
    private String driverId;
    private Double earValue;
    private Double durationSeconds;
    @Indexed
    private Instant timestamp;
    private String status;

    public DrowsinessEvent() {}

    public DrowsinessEvent(String vehicleId, String driverId, Double earValue, Double durationSeconds, Instant timestamp, String status) {
        this.vehicleId = vehicleId;
        this.driverId = driverId;
        this.earValue = earValue;
        this.durationSeconds = durationSeconds;
        this.timestamp = timestamp;
        this.status = status;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getVehicleId() { return vehicleId; }
    public void setVehicleId(String vehicleId) { this.vehicleId = vehicleId; }

    public String getDriverId() { return driverId; }
    public void setDriverId(String driverId) { this.driverId = driverId; }

    public Double getEarValue() { return earValue; }
    public void setEarValue(Double earValue) { this.earValue = earValue; }

    public Double getDurationSeconds() { return durationSeconds; }
    public void setDurationSeconds(Double durationSeconds) { this.durationSeconds = durationSeconds; }

    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}

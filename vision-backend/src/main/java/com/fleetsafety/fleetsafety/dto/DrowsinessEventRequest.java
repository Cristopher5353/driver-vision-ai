package com.fleetsafety.fleetsafety.dto;

import java.time.Instant;

public class DrowsinessEventRequest {
    private String vehicleId;
    private String driverId;
    private Double earValue;
    private Double durationSeconds;
    private Instant timestamp;

    public DrowsinessEventRequest() {}

    public DrowsinessEventRequest(String vehicleId, String driverId, Double earValue, Double durationSeconds, Instant timestamp) {
        this.vehicleId = vehicleId;
        this.driverId = driverId;
        this.earValue = earValue;
        this.durationSeconds = durationSeconds;
        this.timestamp = timestamp;
    }

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
}
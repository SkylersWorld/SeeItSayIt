package com.ceas.controller;

import com.ceas.model.Alert;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.*;
import java.util.ArrayList;
import java.util.List;
package com.ceas.controller;
import com.ceas.service.LocationService;
import com.ceas.service.NotificationService;

@RestController
@RequestMapping("/api/alerts")
public class AlertController {

    // ... existing activeAlerts list ...

    private final LocationService locationService;
    private final NotificationService notificationService;

    // Constructor Injection
    public AlertController(LocationService locationService, NotificationService notificationService) {
        this.locationService = locationService;
        this.notificationService = notificationService;
    }

    // New DTO (Data Transfer Object) for incoming reports
    public static class ReportRequest {
        public String type;
        public String description;
        public double latitude;
        public double longitude;
        public String reporterName;
        public String phoneNumber; // NEW FIELD
        public String postalCode;  // NEW FIELD
    }

    // Update the endpoint to accept the new ReportRequest
    @MessageMapping("/report")
    @SendTo("/topic/alerts")
    public Alert reportIncident(ReportRequest request) {
        // 1. Create the Alert object
        Alert alert = new Alert(
            request.type, 
            request.description, 
            request.latitude, 
            request.longitude, 
            request.reporterName
        );
        activeAlerts.add(alert);

        String fullMessage = "CEAS URGENT ALERT: " + alert.getType() + " reported at " + alert.getTimestamp();

        // 2. Notify the Reporting Citizen (optional, for confirmation)
        if (request.phoneNumber != null && !request.phoneNumber.isEmpty()) {
            notificationService.sendSms(
                request.phoneNumber, 
                "CEAS: Your report (" + alert.getType() + ") has been received and broadcast."
            );
        }

        // 3. Identify and Notify Local Authorities
        String authorityContact = locationService.getLocalAuthorityContact(request.postalCode);
        if (authorityContact != null) {
            notificationService.sendSms(
                authorityContact, 
                fullMessage + " Location Ref: " + request.postalCode + ". Check CEAS map immediately."
            );
        }

        // 4. Broadcast to WebSockets (Frontend Live Feed)
        return alert; 
    }
}
@RestController
@RequestMapping("/api/alerts")
public class AlertController {

    private final List<Alert> activeAlerts = new ArrayList<>();

    // HTTP Endpoint to get all alerts on load
    @GetMapping
    public List<Alert> getAllAlerts() {
        return activeAlerts;
    }

    // WebSocket Endpoint: Receives report, broadcasts to all clients
    @MessageMapping("/report")
    @SendTo("/topic/alerts")
    public Alert reportIncident(Alert alert) {
        // In a real app, save to DB here
        if (alert.getReporterName().equals("Authority")) {
            // Auto-verify if from authority
             // alert.setVerified(true);
        }
        activeAlerts.add(alert);
        return alert;
    }
}

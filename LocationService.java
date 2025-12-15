package com.ceas.service;

import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.Map;

@Service
public class LocationService {

    // Mock Database: Maps Postal Codes (first 3 digits/chars) to Authority Contact Info
    private final Map<String, String> authorityContacts = new HashMap<>();

    public LocationService() {
        // Example data for different regions
        authorityContacts.put("902", "+15551234567"); // Police Station Beverly Hills
        authorityContacts.put("100", "+15559876543"); // Fire Department Manhattan
        authorityContacts.put("SW1", "+447700900001"); // London Metropolitan Police
    }

    /**
     * Identifies the contact number for the local authority based on the postal code.
     * @param postalCode The code provided by the user.
     * @return The phone number of the nearest authority, or null if not found.
     */
    public String getLocalAuthorityContact(String postalCode) {
        if (postalCode != null && postalCode.length() >= 3) {
            String prefix = postalCode.substring(0, 3).toUpperCase();
            return authorityContacts.get(prefix);
        }
        return null; // Return null if the code is invalid/unsupported
    }
}

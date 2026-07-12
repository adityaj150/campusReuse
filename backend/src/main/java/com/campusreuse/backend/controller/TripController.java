package com.campusreuse.backend.controller;

import com.campusreuse.backend.model.Trip;
import com.campusreuse.backend.service.TripService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/trips")
public class TripController {

    @Autowired
    private TripService tripService;

    @GetMapping
    public ResponseEntity<List<Trip>> getAllTrips() {
        return ResponseEntity.ok(tripService.getAllTrips());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Trip> getTripById(@PathVariable Long id) {
        return ResponseEntity.ok(tripService.getTripById(id));
    }

    @GetMapping("/joined")
    public ResponseEntity<List<Trip>> getJoinedTrips(@RequestParam Long userId) {
        return ResponseEntity.ok(tripService.getJoinedTrips(userId));
    }

    @PostMapping
    public ResponseEntity<?> createTrip(@RequestBody Trip trip) {
        try {
            return ResponseEntity.ok(tripService.createTrip(trip));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/join")
    public ResponseEntity<?> joinTrip(@PathVariable Long id, @RequestParam Long userId) {
        try {
            tripService.joinTrip(id, userId);
            Trip trip = tripService.getTripById(id);
            return ResponseEntity.ok(Map.of(
                "message", "Successfully joined the trip",
                "currentMembers", trip.getCurrentMembers(),
                "maxMembers", trip.getMaxMembers(),
                "status", trip.getStatus()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/leave")
    public ResponseEntity<?> leaveTrip(@PathVariable Long id, @RequestParam Long userId) {
        try {
            tripService.leaveTrip(id, userId);
            return ResponseEntity.ok(Map.of("message", "Successfully left the trip"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}

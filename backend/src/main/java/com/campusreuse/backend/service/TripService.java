package com.campusreuse.backend.service;

import com.campusreuse.backend.model.ChatRoom;
import com.campusreuse.backend.model.Trip;
import com.campusreuse.backend.model.TripMember;
import com.campusreuse.backend.repository.ChatRoomRepository;
import com.campusreuse.backend.repository.TripMemberRepository;
import com.campusreuse.backend.repository.TripRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TripService {
    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private TripMemberRepository tripMemberRepository;

    @Autowired
    private ChatRoomRepository chatRoomRepository;

    public List<Trip> getAllTrips() {
        return tripRepository.findAll();
    }

    public Trip getTripById(Long tripId) {
        return tripRepository.findById(tripId).orElseThrow(() -> new RuntimeException("Trip not found"));
    }

    public List<Trip> getJoinedTrips(Long userId) {
        List<TripMember> memberships = tripMemberRepository.findByUserId(userId);
        List<Long> tripIds = memberships.stream().map(TripMember::getTripId).collect(Collectors.toList());
        return tripRepository.findAllById(tripIds);
    }

    @Transactional
    public Trip createTrip(Trip trip) {
        trip.setCurrentMembers(1);
        trip.setStatus("OPEN");
        trip.setCreatedAt(LocalDateTime.now());
        trip = tripRepository.save(trip);
        
        // Add creator as member
        TripMember member = new TripMember();
        member.setTripId(trip.getTripId());
        member.setUserId(trip.getCreatedBy());
        member.setJoinedAt(LocalDateTime.now());
        tripMemberRepository.save(member);

        // Create Chat Room (expires 1 hour after departure)
        ChatRoom chatRoom = new ChatRoom();
        chatRoom.setTripId(trip.getTripId());
        chatRoom.setExpiresAt(trip.getTripDate().atTime(trip.getDepartureTime()).plusHours(1));
        chatRoom.setStatus("ACTIVE");
        chatRoom.setWarningSent(false);
        chatRoomRepository.save(chatRoom);

        return trip;
    }

    @Transactional
    public void joinTrip(Long tripId, Long userId) {
        Trip trip = getTripById(tripId);
        if ("FULL".equals(trip.getStatus()) || trip.getCurrentMembers() >= trip.getMaxMembers()) {
            throw new RuntimeException("Trip is full");
        }

        LocalDateTime departureDateTime = trip.getTripDate().atTime(trip.getDepartureTime());
        if (LocalDateTime.now().isAfter(departureDateTime)) {
            throw new RuntimeException("Cannot join a trip after its departure time");
        }
        
        Optional<TripMember> existing = tripMemberRepository.findByTripIdAndUserId(tripId, userId);
        if (existing.isPresent()) {
            throw new RuntimeException("You have already joined this trip");
        }

        TripMember member = new TripMember();
        member.setTripId(tripId);
        member.setUserId(userId);
        member.setJoinedAt(LocalDateTime.now());
        tripMemberRepository.save(member);

        trip.setCurrentMembers(trip.getCurrentMembers() + 1);
        if (trip.getCurrentMembers().equals(trip.getMaxMembers())) {
            trip.setStatus("FULL");
        }
        tripRepository.save(trip);
    }

    @Transactional
    public void leaveTrip(Long tripId, Long userId) {
        Trip trip = getTripById(tripId);

        Optional<TripMember> existing = tripMemberRepository.findByTripIdAndUserId(tripId, userId);
        if (existing.isEmpty()) {
            throw new RuntimeException("You are not a member of this trip");
        }

        // Creator cannot leave, they must cancel
        if (trip.getCreatedBy().equals(userId)) {
            throw new RuntimeException("Trip creator cannot leave. Cancel the trip instead.");
        }

        tripMemberRepository.delete(existing.get());

        trip.setCurrentMembers(trip.getCurrentMembers() - 1);
        if ("FULL".equals(trip.getStatus())) {
            trip.setStatus("OPEN");
        }
        tripRepository.save(trip);
    }
}

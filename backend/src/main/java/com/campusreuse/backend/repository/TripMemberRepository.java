package com.campusreuse.backend.repository;

import com.campusreuse.backend.model.TripMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TripMemberRepository extends JpaRepository<TripMember, Long> {
    List<TripMember> findByUserId(Long userId);
    List<TripMember> findByTripId(Long tripId);
    Optional<TripMember> findByTripIdAndUserId(Long tripId, Long userId);
}

package com.campusreuse.backend.repository;

import com.campusreuse.backend.model.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TripRepository extends JpaRepository<Trip, Long> {
    List<Trip> findByCreatedBy(Long createdBy);
    // Add filtering methods later if needed, e.g., by source/destination
}

package com.lcbackend.custom_contest_backend.repository;

import com.lcbackend.custom_contest_backend.model.Contest;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ContestRepository extends JpaRepository<Contest, Long> {
}

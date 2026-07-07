package com.lcbackend.custom_contest_backend.repository;

import com.lcbackend.custom_contest_backend.model.Contest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ContestRepository extends JpaRepository<Contest, Long> {
      Page<Contest> findByUser_UsernameOrderByStartedAtDesc(String username, Pageable pageable);
}

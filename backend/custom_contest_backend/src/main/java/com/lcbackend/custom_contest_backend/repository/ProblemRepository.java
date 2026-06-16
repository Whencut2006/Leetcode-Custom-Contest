package com.lcbackend.custom_contest_backend.repository;

import com.lcbackend.custom_contest_backend.model.Problem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProblemRepository extends JpaRepository<Problem, Long> {
    boolean existsByTitleSlug(String titleSlug);
}

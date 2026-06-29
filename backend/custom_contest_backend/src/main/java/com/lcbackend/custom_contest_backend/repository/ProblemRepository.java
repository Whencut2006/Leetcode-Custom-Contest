package com.lcbackend.custom_contest_backend.repository;

import com.lcbackend.custom_contest_backend.model.Problem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProblemRepository extends JpaRepository<Problem, Long> {
    boolean existsByTitleSlug(String titleSlug);

    @Query(value = "SELECT * FROM problems WHERE difficulty = :difficulty AND :topic = ANY(topics) AND title_slug NOT IN :excludedSlugs ORDER BY RANDOM() LIMIT 1", nativeQuery = true)
    Problem findRandomProblemByCriteria(@Param("difficulty") String difficulty,
                                        @Param("topic") String topic,
                                        @Param("excludedSlugs") List<String> excludedSlugs);
}

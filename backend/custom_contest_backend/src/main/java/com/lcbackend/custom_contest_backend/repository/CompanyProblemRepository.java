package com.lcbackend.custom_contest_backend.repository;

import com.lcbackend.custom_contest_backend.model.CompanyProblem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CompanyProblemRepository extends JpaRepository<CompanyProblem, Long> {
    @Query(value = "SELECT * FROM company_wise WHERE :company = ANY(companies) AND difficulty = :difficulty ORDER BY RANDOM() LIMIT :limit", nativeQuery = true)
    List<CompanyProblem> findRandomProblemsByCompanyAndDifficulty(
            @Param("company") String company,
            @Param("difficulty") String difficulty,
            @Param("limit") int limit
    );

}

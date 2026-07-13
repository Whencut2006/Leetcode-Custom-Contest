package com.lcbackend.custom_contest_backend.repository;

import com.lcbackend.custom_contest_backend.model.Contest;
import com.lcbackend.custom_contest_backend.model.ContestStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ContestRepository extends JpaRepository<Contest, Long> {
      Page<Contest> findByUser_UsernameOrderByStartedAtDesc(String username, Pageable pageable);

      @Query("SELECT COUNT(c) FROM Contest c WHERE c.user.username = :username AND c.status IN :statuses")
      Integer countContestsByUsernameAndStatuses(@Param("username") String username, @Param("statuses") List<ContestStatus> statuses);

      @Query("SELECT COUNT(cp) FROM Contest c JOIN c.contestProblems cp WHERE c.user.username = :username AND c.status IN :statuses")
      Integer countProblemsAttemptedByUsernameAndStatuses(@Param("username") String username, @Param("statuses") List<ContestStatus> statuses);
}

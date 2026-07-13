package com.lcbackend.custom_contest_backend.repository;

import com.lcbackend.custom_contest_backend.dto.ProblemCriteria;
import com.lcbackend.custom_contest_backend.model.Problem;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class ProblemPickerRepository {

    private final EntityManager entityManager;

    @SuppressWarnings("unchecked")
    public List<Problem> fetchCandidatePool(List<ProblemCriteria> criteriaList, List<String> excludedSlugs) {
        StringBuilder sql = new StringBuilder("SELECT * FROM problems WHERE title_slug NOT IN :excluded AND (");
        for (int i = 0; i < criteriaList.size(); i++) {
            if (i > 0) sql.append(" OR ");
            sql.append("(difficulty = :diff").append(i)
                    .append(" AND :topic").append(i).append(" = ANY(topics))");
        }
        sql.append(")");

        Query query = entityManager.createNativeQuery(sql.toString(), Problem.class);

        query.setParameter("excluded", excludedSlugs == null || excludedSlugs.isEmpty() ? List.of("dummy-slug") : excludedSlugs);

        for (int i = 0; i < criteriaList.size(); i++) {
            query.setParameter("diff" + i, criteriaList.get(i).getDifficulty());
            query.setParameter("topic" + i, criteriaList.get(i).getTopic());
        }

        return query.getResultList();
    }
}
package com.lcbackend.custom_contest_backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
import org.hibernate.type.SqlTypes;

import java.util.List;

@Entity
@Table(name = "contest_problems")
@Getter
@Setter
@NoArgsConstructor
public class ContestProblem {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "contest_problem_seq")
    @SequenceGenerator(name = "contest_problem_seq", sequenceName = "contest_problem_seq", allocationSize = 50)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contest_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Contest contest;

    private String title;

    @Column(nullable = false)
    private String titleSlug;

    @Column(nullable = false)
    private String difficulty;

    private int problemOrder; // 1, 2, 3, or 4
    
    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(columnDefinition = "text[]")
    private List<String> topics;

    private Integer timeTakenSeconds;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProblemStatus status = ProblemStatus.PENDING;

    @Column(name = "targeted_topic")
    private String targetedTopic;

}
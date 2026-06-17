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
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contest_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Contest contest;

    @Column(nullable = false)
    private String titleSlug;

    @Column(nullable = false)
    private String difficulty;

    private int problemOrder; // 1, 2, 3, or 4

    // --- ANALYTICS DATA ---
    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(columnDefinition = "text[]")
    private List<String> topics;

    private Integer timeTakenSeconds; // Populated by Status Poller when solved

    // --- STATE MACHINE ---
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProblemStatus status = ProblemStatus.PENDING;
}
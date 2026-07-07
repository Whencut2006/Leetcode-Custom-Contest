package com.lcbackend.custom_contest_backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.BatchSize;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "contests", indexes = {
        @Index(name = "idx_contest_user", columnList = "user_id")
})
@Getter
@Setter
@NoArgsConstructor
public class Contest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ContestType contestType;

    @Column(nullable = false)
    private String title;

    private String targetCompany;    // e.g., "google" (Null if Custom Contest)
    private int durationMinutes;     // e.g., 90

    // --- STATE MACHINE ---
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ContestStatus status = ContestStatus.GENERATED;

    // --- ANALYTICS TIMESTAMPS ---
    private LocalDateTime createdAt = LocalDateTime.now(); // When generated
    private LocalDateTime startedAt;                       // When they clicked Start
    private LocalDateTime endedAt;                         // When finished/quit

    @OneToMany(mappedBy = "contest", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @OrderBy("id ASC")
    @JsonIgnore
    @BatchSize(size = 25)
    private List<ContestProblem> contestProblems = new ArrayList<>();
}
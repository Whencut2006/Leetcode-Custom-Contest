package com.lcbackend.custom_contest_backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Entity
@Table(name = "topic_strengths")
@Getter
@Setter
@NoArgsConstructor
public class TopicStrength {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private User user;

    @Column(nullable = false)
    private String topicName;

    private int solvedCount = 0;

    @Column(columnDefinition = "numeric(10,2) default 0.0")
    private double strengthRating = 0.0;
}
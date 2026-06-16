package com.lcbackend.custom_contest_backend.model;
import java.util.*;
import jakarta.persistence.*;
import lombok.*;

@NoArgsConstructor
@Data
@Entity
@Table(name = "problems")
public class Problem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private long id;
    @Column(name = "title")
    private String title;
    @Column(name = "title_slug", unique = true)
    private String titleSlug;
    @Column(name = "difficulty")
    private String difficulty;
    @Column(name = "topics", columnDefinition = "text[]")
    private List<String> topics;
}

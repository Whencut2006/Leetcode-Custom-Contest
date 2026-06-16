package com.lcbackend.custom_contest_backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.List;

@Entity
@Table(name = "company_wise")
@NoArgsConstructor
@Data
public class CompanyProblem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private long id;
    @Column(name = "title_slug", unique = true)
    private String titleSlug;
    @Column(name = "title")
    private String title;
    @Column(name = "difficulty")
    private String difficulty;
    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "companies", columnDefinition = "text[]")
    private List<String> companies;
    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "topics", columnDefinition = "text[]")
    private List<String> topics;
}

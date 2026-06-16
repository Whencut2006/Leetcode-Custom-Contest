package com.lcbackend.custom_contest_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ContestProblemDto {
    private String title;
    private String titleSlug;
    private String difficulty;
}
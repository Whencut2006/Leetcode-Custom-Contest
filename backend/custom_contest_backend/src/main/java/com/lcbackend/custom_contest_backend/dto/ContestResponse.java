package com.lcbackend.custom_contest_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ContestResponse {
    private Long contestId;
    private String title;
    private String company;
    private int durationMinutes;
    private List<ContestProblemDto> problems;
}
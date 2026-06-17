package com.lcbackend.custom_contest_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CompanyContestResponse {
    private Long contestId;
    private String company;
    private List<ContestProblemDto> problems;
}
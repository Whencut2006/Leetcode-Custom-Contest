package com.lcbackend.custom_contest_backend.dto;

import lombok.Data;

import java.util.List;

@Data
public class CustomContestRequest {
    private String username;
    private int durationMinutes = 90;
    List<ContestRuleDto> rules;
}

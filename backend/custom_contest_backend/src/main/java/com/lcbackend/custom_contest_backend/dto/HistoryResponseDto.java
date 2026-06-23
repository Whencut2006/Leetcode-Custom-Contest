package com.lcbackend.custom_contest_backend.dto;

import com.lcbackend.custom_contest_backend.model.ContestStatus;
import com.lcbackend.custom_contest_backend.model.ContestType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class HistoryResponseDto {
    private long contestId;
    private String title;
    private ContestType contestType;
    private ContestStatus status;
    private LocalDateTime startedAt;
    private List<ContestProblemDto> contestProblems;
    private int totalProblems;
    private int solvedProblems;
}

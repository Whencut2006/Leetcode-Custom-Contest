package com.lcbackend.custom_contest_backend.dto;

import lombok.Data;
import java.util.List;

@Data
public class AnalyticsDto {
    private int totalContestsAttended;
    private int totalProblemsAttended;
    private int totalProblemsSolved;
    private int overallElo;
    private int maangReadiness;

    private List<MacroTopicDto> macroTopics;
    private List<MicroTopicDto> top3StrongTopics;
    private List<MicroTopicDto> top3WeakTopics;

}

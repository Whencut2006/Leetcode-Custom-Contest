package com.lcbackend.custom_contest_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
@Data
@AllArgsConstructor
@NoArgsConstructor
public class MacroTopicDto {
    private String macroName;
    private int averageElo;
    private int totalMacroSolvedCount;
    private List<MicroTopicDto> subtopics;
}

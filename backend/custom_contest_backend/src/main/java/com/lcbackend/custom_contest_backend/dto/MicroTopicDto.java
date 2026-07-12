package com.lcbackend.custom_contest_backend.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MicroTopicDto {
    private String topicName;
    private int elo;
    private int solvedCount;
}

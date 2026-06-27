package com.lcbackend.custom_contest_backend.dto;

import lombok.Data;

import java.util.List;

@Data
public class ContestSubmitRequest {
    private List<String> solvedSlugs;
}

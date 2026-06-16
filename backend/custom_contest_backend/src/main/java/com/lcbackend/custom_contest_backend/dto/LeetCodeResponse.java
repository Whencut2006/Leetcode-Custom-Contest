package com.lcbackend.custom_contest_backend.dto;

import java.util.List;
import lombok.Data;

@Data
public class LeetCodeResponse {
    // outer "data" key
    private DataContent data;

    @Data
    public static class DataContent {
        // middle "problemsetQuestionList" wrapper key
        private ProblemsetWrapper problemsetQuestionList;
    }

    @Data
    public static class ProblemsetWrapper {
        // "questions" array list
        private List<QuestionDTO> questions;
    }

    @Data
    public static class QuestionDTO {
        private String title;
        private String titleSlug;
        private String difficulty;
        private boolean paidOnly;
        private List<TopicTagDto> topicTags;
    }

    @Data
    public static class TopicTagDto {
        private String name;
        private String slug;
    }
}
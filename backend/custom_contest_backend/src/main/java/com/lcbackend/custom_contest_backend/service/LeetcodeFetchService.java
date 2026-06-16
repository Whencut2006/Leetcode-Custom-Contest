package com.lcbackend.custom_contest_backend.service;

import java.util.*;
import com.lcbackend.custom_contest_backend.dto.LeetCodeResponse;
import com.lcbackend.custom_contest_backend.model.Problem;
import com.lcbackend.custom_contest_backend.repository.ProblemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

@Service
@RequiredArgsConstructor
public class LeetcodeFetchService {

    private final ProblemRepository problemRepo;
    private final WebClient webClient;

    // Trigger immediately on startup for the mass seed
//    @EventListener(ApplicationReadyEvent.class)
    @Scheduled(cron = "0 0 6 * * SUN")
    public void fetchAndSaveProblems() {
        System.out.println("Harvesting all available LeetCode problems...");

        String query = """
                query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
                  problemsetQuestionList: questionList(
                    categorySlug: $categorySlug
                    limit: $limit
                    skip: $skip
                    filters: $filters
                  ) {
                    questions: data {
                      difficulty
                      paidOnly: isPaidOnly
                      title
                      titleSlug
                      topicTags {
                        name
                        slug
                      }
                    }
                  }
                }
                """;

        int pageSize = 50;
        long totalExistingInDb = problemRepo.count();
        int currentSkip = (int) totalExistingInDb;
        boolean recordsRemaining = true;
        int totalSavedOverall = 0;

        while (recordsRemaining) {
            System.out.println("🌐 Requesting batch range: " + currentSkip + " to " + (currentSkip + pageSize));

            Map<String, Object> variables = new HashMap<>();
            variables.put("categorySlug", "algorithms");
            variables.put("limit", pageSize);
            variables.put("skip", currentSkip);
            variables.put("filters", new HashMap<>());

            Map<String, Object> payload = new HashMap<>();
            payload.put("query", query);
            payload.put("variables", variables);

            try {
                LeetCodeResponse response = webClient.post()
                        .uri("https://leetcode.com/graphql")
                        .header("Content-Type", "application/json")
                        .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
                        .bodyValue(payload)
                        .retrieve()
                        .bodyToMono(LeetCodeResponse.class)
                        .block();

                if (response != null && response.getData() != null
                        && response.getData().getProblemsetQuestionList() != null
                        && !response.getData().getProblemsetQuestionList().getQuestions().isEmpty()) {

                    var leetcodeQuestions = response.getData().getProblemsetQuestionList().getQuestions();
                    int savedInThisBatch = 0;

                    for (var q : leetcodeQuestions) {
                        if(q.isPaidOnly() || q.getTopicTags().isEmpty())
                            continue;
                        String slug = q.getTitleSlug();

                        if (!problemRepo.existsByTitleSlug(slug)) {
                            Problem newProblem = new Problem();
                            newProblem.setTitle(q.getTitle());
                            newProblem.setDifficulty(q.getDifficulty());
                            newProblem.setTitleSlug(slug);

                            List<String> topicSlugs = new ArrayList<>();
                            if (q.getTopicTags() != null) {
                                for (var tag : q.getTopicTags()) {
                                    topicSlugs.add(tag.getSlug());
                                }
                            }
                            newProblem.setTopics(topicSlugs);
                            problemRepo.save(newProblem);
                            savedInThisBatch++;
                            totalSavedOverall++;
                        }
                    }

                    System.out.println("Batch processed. Added " + savedInThisBatch + " new rows to database.");

                    currentSkip += pageSize;

                } else {
                    // Loop terminates naturally when LeetCode returns an empty questions array
                    System.out.println("Reached absolute end of LeetCode dataset records.");
                    recordsRemaining = false;
                }

                // 1-second polite rest to keep our profile organic and clear firewalls
                Thread.sleep(1000);

            } catch (Exception e) {
                System.err.println("Critical sync processing error: " + e.getMessage());
                recordsRemaining = false;
            }
        }
    }
}
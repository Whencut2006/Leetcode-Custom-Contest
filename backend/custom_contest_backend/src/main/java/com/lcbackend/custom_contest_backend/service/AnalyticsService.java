package com.lcbackend.custom_contest_backend.service;

import com.lcbackend.custom_contest_backend.dto.AnalyticsDto;
import com.lcbackend.custom_contest_backend.dto.MacroTopicDto;
import com.lcbackend.custom_contest_backend.dto.MicroTopicDto;
import com.lcbackend.custom_contest_backend.model.Contest;
import com.lcbackend.custom_contest_backend.model.ContestStatus;
import com.lcbackend.custom_contest_backend.model.TopicStrength;
import com.lcbackend.custom_contest_backend.model.User;
import com.lcbackend.custom_contest_backend.repository.ContestRepository;
import com.lcbackend.custom_contest_backend.repository.TopicStrengthRepository;
import com.lcbackend.custom_contest_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final TopicStrengthRepository topicStrengthRepository;
    private final UserRepository userRepository;
    private final ContestRepository contestRepository;

    public AnalyticsDto getUserAnalytics(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        AnalyticsDto response = new AnalyticsDto();

        // 1. Fetch User Contests & Calculate Counts
        List<Contest> userContests = contestRepository.findByUser_UsernameOrderByStartedAtDesc(username, Pageable.unpaged()).getContent();
        int contestsAttended = 0;
        int totalAttempted = 0;
        int totalSolved = 0;

        for (Contest c : userContests) {
            if (c.getStatus() == ContestStatus.COMPLETED || c.getStatus() == ContestStatus.ABANDONED) {
                contestsAttended++;
                totalAttempted += c.getContestProblems().size();
                totalSolved += (int)c.getContestProblems().stream()
                        .filter(p -> "SOLVED".equals(p.getStatus().name()))
                        .count();
            }
        }

        response.setTotalContestsAttended(contestsAttended);
        response.setTotalProblemsAttended(totalAttempted);
        response.setTotalProblemsSolved(totalSolved);

        // 2. Fetch Topic Strengths
        List<TopicStrength> allStrengths = topicStrengthRepository.findByUser(user);

        if (allStrengths.isEmpty()) {
            response.setOverallElo(1200);
            response.setMaangReadiness(0);
            response.setMacroTopics(new ArrayList<>());
            return response;
        }

        int overallElo = (int) allStrengths.stream().mapToDouble(TopicStrength::getStrengthRating).average().orElse(1200.0);
        response.setOverallElo(overallElo);

        int maangScore = (int) Math.min(100, ((double) overallElo / 1900.0) * 100);
        response.setMaangReadiness(maangScore);

        Map<String, List<MicroTopicDto>> groupedTopics = new HashMap<>();

        for (TopicStrength ts : allStrengths) {
            String microName = ts.getTopicName();
            String macroName = determineMacroCategory(microName);

            groupedTopics.putIfAbsent(macroName, new ArrayList<>());
            groupedTopics.get(macroName).add(new MicroTopicDto(microName, (int)ts.getStrengthRating(), ts.getSolvedCount()));
        }

        List<MacroTopicDto> macroList = new ArrayList<>();
        for (Map.Entry<String, List<MicroTopicDto>> entry : groupedTopics.entrySet()) {
            List<MicroTopicDto> micros = entry.getValue();
            int macroElo = (int) micros.stream().mapToInt(MicroTopicDto::getElo).average().orElse(1200);
            int macroSolved = micros.stream().mapToInt(MicroTopicDto::getSolvedCount).sum();

            micros.sort((a, b) -> Integer.compare(b.getElo(), a.getElo())); // Sort for modal display

            macroList.add(new MacroTopicDto(entry.getKey(), macroElo, macroSolved, micros));
        }
        response.setMacroTopics(macroList);

        List<MicroTopicDto> allMicros = allStrengths.stream()
                .map(ts -> new MicroTopicDto(ts.getTopicName(), (int)ts.getStrengthRating(), ts.getSolvedCount()))
                .sorted((a, b) -> Integer.compare(b.getElo(), a.getElo()))
                .collect(Collectors.toList());

        response.setTop3StrongTopics(allMicros.stream().limit(3).collect(Collectors.toList()));

        List<MicroTopicDto> reversedMicros = new ArrayList<>(allMicros);
        Collections.reverse(reversedMicros);
        response.setTop3WeakTopics(reversedMicros.stream().limit(3).collect(Collectors.toList()));

        return response;
    }


    private String determineMacroCategory(String topic) {
        if (topic == null) {
            return "Algorithms";
        }

        String t = topic.toLowerCase();
        if (t.contains("array") || t.contains("string") || t.contains("hash") ||
                t.contains("list") || t.contains("stack") || t.contains("queue") ||
                t.contains("heap") || t.contains("union")) {
            return "Data Structures";

        } else if (t.contains("tree") || t.contains("graph") || t.contains("bfs") ||
                t.contains("dfs") || t.contains("trie")) {
            return "Graphs & Trees";

        } else if (t.contains("dynamic") || t.contains("memo")) {
            return "Dynamic Programming";

        } else if (t.contains("math") || t.contains("bit") || t.contains("greedy") ||
                t.contains("backtrack")) {
            return "Math & Logic";
        }
        return "Algorithms";
    }
}
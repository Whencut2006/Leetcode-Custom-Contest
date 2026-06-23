package com.lcbackend.custom_contest_backend.service;

import com.lcbackend.custom_contest_backend.dto.CompanyContestRequest;
import com.lcbackend.custom_contest_backend.dto.CompanyContestResponse;
import com.lcbackend.custom_contest_backend.dto.ContestProblemDto;
import com.lcbackend.custom_contest_backend.dto.HistoryResponseDto;
import com.lcbackend.custom_contest_backend.model.*;
import com.lcbackend.custom_contest_backend.repository.CompanyProblemRepository;
import com.lcbackend.custom_contest_backend.repository.ContestRepository;
import com.lcbackend.custom_contest_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ContestService {

    private final CompanyProblemRepository companyProblemRepository;
    private final UserRepository userRepository;
    private final ContestRepository contestRepository;

    @Transactional
    public CompanyContestResponse createCompanyContest(@NonNull CompanyContestRequest request) {
        String companyLower = request.getCompany().toLowerCase().trim();
        String reqUsername = request.getUsername();

        if (reqUsername == null || reqUsername.isBlank()) {
            throw new IllegalArgumentException("Username is required to start a contest.");
        }


        User user = userRepository.findByUsername(reqUsername).orElseGet(() -> {
            User newUser = new User();
            newUser.setUsername(reqUsername);
            return userRepository.save(newUser);
        });

        List<CompanyProblem> easyProblems = companyProblemRepository
                .findRandomProblemsByCompanyAndDifficulty(companyLower, "Easy", 1);
        List<CompanyProblem> mediumProblems = companyProblemRepository
                .findRandomProblemsByCompanyAndDifficulty(companyLower, "Medium", 2);
        List<CompanyProblem> hardProblems = companyProblemRepository
                .findRandomProblemsByCompanyAndDifficulty(companyLower, "Hard", 1);

        if (easyProblems.isEmpty() || mediumProblems.size() < 2 || hardProblems.isEmpty()) {
            throw new IllegalArgumentException("Insufficient questions found for company: " + request.getCompany());
        }

        List<CompanyProblem> selectedEntities = new ArrayList<>();
        selectedEntities.addAll(easyProblems);
        selectedEntities.addAll(mediumProblems);
        selectedEntities.addAll(hardProblems);


        Contest contest = new Contest();
        contest.setUser(user);
        contest.setContestType(ContestType.COMPANY);
        contest.setDurationMinutes(90);
        contest.setTargetCompany(companyLower);

        String formattedCompany = request.getCompany().substring(0, 1).toUpperCase() + request.getCompany().substring(1).toLowerCase();
        contest.setTitle(formattedCompany + " Assessment");
        contest.setStatus(ContestStatus.GENERATED);


        int order = 1;
        for (CompanyProblem cp : selectedEntities) {
            ContestProblem problem = new ContestProblem();
            problem.setContest(contest);
            problem.setTitleSlug(cp.getTitleSlug());
            problem.setDifficulty(cp.getDifficulty());
            problem.setProblemOrder(order++);
            problem.setTitle(cp.getTitle());
            problem.setStatus(ProblemStatus.PENDING);

            problem.setTopics(cp.getTopics());

            contest.getContestProblems().add(problem);
        }


        contestRepository.save(contest);


        List<ContestProblemDto> problemDtos = selectedEntities.stream()
                .map(entity -> new ContestProblemDto(
                        entity.getTitle(),
                        entity.getTitleSlug(),
                        entity.getDifficulty(),
                        ProblemStatus.PENDING
                ))
                .collect(Collectors.toList());

        return new CompanyContestResponse(contest.getId(), request.getCompany(), problemDtos);
    }


    @Transactional
    public void updateContestState(Long contestId, ContestStatus newStatus) {
        Contest contest = contestRepository.findById(contestId)
                .orElseThrow(() -> new IllegalArgumentException("Contest not found"));

        contest.setStatus(newStatus);

        if (newStatus == ContestStatus.IN_PROGRESS) {
            contest.setStartedAt(java.time.LocalDateTime.now());
        } else if (newStatus == ContestStatus.ABANDONED || newStatus == ContestStatus.COMPLETED) {
            contest.setEndedAt(java.time.LocalDateTime.now());
        }

        contestRepository.save(contest);
    }

    public List<HistoryResponseDto> getContestHistory(String username){
        List<Contest> contests = contestRepository.findByUser_UsernameOrderByStartedAtDesc(username);
        List<HistoryResponseDto> history = new ArrayList<>();
        for(Contest contest : contests){
            int solvedProblems = 0;
            HistoryResponseDto historyResponse = new HistoryResponseDto();
            historyResponse.setContestId(contest.getId());
            historyResponse.setTitle(contest.getTitle());
            historyResponse.setContestType(contest.getContestType());
            historyResponse.setStatus(contest.getStatus());
            historyResponse.setStartedAt(contest.getStartedAt());

            List<ContestProblemDto> contestProblems = new ArrayList<>();
            for(ContestProblem contestProblem : contest.getContestProblems()){
                ContestProblemDto newContestProblem = new ContestProblemDto();
                if(contestProblem.getStatus() == ProblemStatus.SOLVED){
                    ++solvedProblems;
                }
                newContestProblem.setTitle(contestProblem.getTitle());
                newContestProblem.setTitleSlug(contestProblem.getTitleSlug());
                newContestProblem.setDifficulty(contestProblem.getDifficulty());
                newContestProblem.setStatus(contestProblem.getStatus());
                contestProblems.add(newContestProblem);
            }
            historyResponse.setTotalProblems(contest.getContestProblems().size());
            historyResponse.setSolvedProblems(solvedProblems);
            historyResponse.setContestProblems(contestProblems);
            history.add(historyResponse);
        }
        return history;
    }
}
package com.lcbackend.custom_contest_backend.service;

import com.lcbackend.custom_contest_backend.dto.CompanyContestRequest;
import com.lcbackend.custom_contest_backend.dto.CompanyContestResponse;
import com.lcbackend.custom_contest_backend.dto.ContestProblemDto;
import com.lcbackend.custom_contest_backend.model.CompanyProblem;
import com.lcbackend.custom_contest_backend.model.Contest;
import com.lcbackend.custom_contest_backend.model.ContestProblem;
import com.lcbackend.custom_contest_backend.model.User;
import com.lcbackend.custom_contest_backend.repository.CompanyProblemRepository;
import com.lcbackend.custom_contest_backend.repository.ContestRepository;
import com.lcbackend.custom_contest_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
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
    public CompanyContestResponse createCompanyContest(CompanyContestRequest request) {
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

        // 2. Fetch problems from the optimized database layer
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
        contest.setContestType("COMPANY");
        contest.setMetaValue(request.getCompany());
        contest.setDurationMinutes(90); // Hardcoded for now, you can pass this from React later


        int order = 1;
        for (CompanyProblem cp : selectedEntities) {
            ContestProblem problem = new ContestProblem();
            problem.setContest(contest);
            problem.setTitleSlug(cp.getTitleSlug());
            problem.setDifficulty(cp.getDifficulty());
            problem.setProblemOrder(order++);
            problem.setStatus("PENDING");


            contest.getContestProblems().add(problem);
        }


        contestRepository.save(contest);


        List<ContestProblemDto> problemDtos = selectedEntities.stream()
                .map(entity -> new ContestProblemDto(
                        entity.getTitle(),
                        entity.getTitleSlug(),
                        entity.getDifficulty()
                ))
                .collect(Collectors.toList());

        return new CompanyContestResponse(request.getCompany(), problemDtos);
    }
}
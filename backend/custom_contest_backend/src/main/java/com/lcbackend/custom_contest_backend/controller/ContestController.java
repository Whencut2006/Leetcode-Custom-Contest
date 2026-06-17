package com.lcbackend.custom_contest_backend.controller;

import com.lcbackend.custom_contest_backend.dto.CompanyContestRequest;
import com.lcbackend.custom_contest_backend.dto.CompanyContestResponse;
import com.lcbackend.custom_contest_backend.model.ContestStatus;
import com.lcbackend.custom_contest_backend.service.ContestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/contests")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ContestController {

    private final ContestService contestService;

    @PostMapping("/company")
    public ResponseEntity<?> generateCompanyContest(@RequestBody CompanyContestRequest request) {
        try {
            CompanyContestResponse response = contestService.createCompanyContest(request);
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Void> updateStatus(
            @PathVariable Long id,
            @RequestParam ContestStatus status) {

        contestService.updateContestState(id, status);
        return ResponseEntity.ok().build();
    }
}
package com.lcbackend.custom_contest_backend.controller;

import com.lcbackend.custom_contest_backend.dto.*;
import com.lcbackend.custom_contest_backend.model.ContestStatus;
import com.lcbackend.custom_contest_backend.service.ContestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contests")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ContestController {

    private final ContestService contestService;

    @PostMapping("/company")
    public ResponseEntity<?> generateCompanyContest(@RequestBody CompanyContestRequest request) {
        try {
            ContestResponse response = contestService.createCompanyContest(request);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        }
    }

    @PostMapping("/custom")
    public ResponseEntity<?> generateCustomContest(@RequestBody CustomContestRequest request){
        try {
            ContestResponse response = contestService.createCustomContest(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
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


    @GetMapping("/history/{username}")
    public ResponseEntity<List<HistoryResponseDto>> getContestHistory(@PathVariable String username){
        try {
            List<HistoryResponseDto> history = contestService.getContestHistory(username);
            return ResponseEntity.ok(history);
        } catch (Exception e){
            return ResponseEntity.status(500).build();
        }
    }

    @PutMapping("/{id}/submit")
    public ResponseEntity<String> submitContest(
            @PathVariable Long id,
            @RequestBody ContestSubmitRequest request) {

        contestService.submitContest(id, request);

        return ResponseEntity.ok("Contest submitted successfully");
    }
}
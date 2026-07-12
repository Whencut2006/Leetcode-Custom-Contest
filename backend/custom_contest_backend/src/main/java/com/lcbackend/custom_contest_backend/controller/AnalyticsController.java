package com.lcbackend.custom_contest_backend.controller;


import com.lcbackend.custom_contest_backend.dto.AnalyticsDto;
import com.lcbackend.custom_contest_backend.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/{username}")
    public ResponseEntity<AnalyticsDto> getUserAnalytics(@PathVariable String username) {
        return ResponseEntity.ok(analyticsService.getUserAnalytics(username));
    }
}

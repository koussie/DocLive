package com.example.doctorapp.dto;

import com.example.doctorapp.entity.AppointmentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentResponse {
    private Long id;
    private LocalDate date;
    private LocalTime time;
    private AppointmentStatus status;
    private LocalDateTime canceledAt;
    private UserSummaryResponse doctor;
    private UserSummaryResponse patient;
}

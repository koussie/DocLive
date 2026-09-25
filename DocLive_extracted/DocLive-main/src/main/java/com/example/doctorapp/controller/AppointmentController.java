package com.example.doctorapp.controller;

import com.example.doctorapp.dto.AppointmentRequest;
import com.example.doctorapp.dto.AppointmentResponse;
import com.example.doctorapp.entity.User;
import com.example.doctorapp.exception.ForbiddenException;
import com.example.doctorapp.service.AppointmentService;
import com.example.doctorapp.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;
    private final UserService userService;

    public AppointmentController(AppointmentService appointmentService, UserService userService) {
        this.appointmentService = appointmentService;
        this.userService = userService;
    }

    @PreAuthorize("hasRole('PATIENT')")
    @GetMapping("/me")
    public ResponseEntity<List<AppointmentResponse>> listForPatient(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = findUserId(userDetails);
        return ResponseEntity.ok(appointmentService.findAppointmentsForPatient(userId));
    }

    @PreAuthorize("hasRole('DOCTOR')")
    @GetMapping("/doctor")
    public ResponseEntity<List<AppointmentResponse>> listForDoctor(@AuthenticationPrincipal UserDetails userDetails) {
        User doctor = findUser(userDetails);
        if (!userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_DOCTOR"))) {
            throw new ForbiddenException("DOCTOR_ONLY", "Accès réservé aux médecins");
        }
        return ResponseEntity.ok(appointmentService.findAppointmentsForDoctor(doctor.getId()));
    }

    @PreAuthorize("hasRole('PATIENT')")
    @PostMapping
    public ResponseEntity<AppointmentResponse> create(@AuthenticationPrincipal UserDetails userDetails,
                                                      @Valid @RequestBody AppointmentRequest request) {
        Long userId = findUserId(userDetails);
        return ResponseEntity.ok(appointmentService.createAppointment(userId, request));
    }

    @PreAuthorize("hasAnyRole('PATIENT','DOCTOR')")
    @PutMapping("/{id}/cancel")
    public ResponseEntity<AppointmentResponse> cancel(@AuthenticationPrincipal UserDetails userDetails, @PathVariable Long id) {
        Long userId = findUserId(userDetails);
        AppointmentResponse response = appointmentService.cancelAppointment(id, userId);
        return ResponseEntity.ok(response);
    }

    private Long findUserId(UserDetails userDetails) {
        return findUser(userDetails).getId();
    }

    private User findUser(UserDetails userDetails) {
        return userService.getUserEntityByEmail(userDetails.getUsername());
    }
}

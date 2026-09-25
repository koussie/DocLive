package com.example.doctorapp.service;

import com.example.doctorapp.dto.AppointmentRequest;
import com.example.doctorapp.dto.AppointmentResponse;
import com.example.doctorapp.entity.Appointment;
import com.example.doctorapp.entity.AppointmentStatus;
import com.example.doctorapp.entity.Role;
import com.example.doctorapp.entity.User;
import com.example.doctorapp.repository.AppointmentRepository;
import com.example.doctorapp.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mail.javamail.JavaMailSender;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AppointmentServiceTest {

    private AppointmentRepository appointmentRepository;
    private UserRepository userRepository;
    private AppointmentService appointmentService;

    @BeforeEach
    void setup() {
        appointmentRepository = mock(AppointmentRepository.class);
        userRepository = mock(UserRepository.class);
        appointmentService = new AppointmentService(appointmentRepository, userRepository, Optional.of(mock(JavaMailSender.class)));
    }

    @Test
    void shouldCreateAppointmentWhenSlotIsFree() {
        User patient = User.builder().id(1L).nom("Patient").role(Role.PATIENT).build();
        User doctor = User.builder().id(2L).nom("Doctor").role(Role.DOCTOR).build();
        LocalDateTime date = LocalDateTime.now().plusDays(1);
        AppointmentRequest request = new AppointmentRequest();
        request.setDoctorId(doctor.getId());
        request.setDateHeure(date);
        request.setMotif("Consultation");

        when(userRepository.findById(patient.getId())).thenReturn(Optional.of(patient));
        when(userRepository.findById(doctor.getId())).thenReturn(Optional.of(doctor));
        when(appointmentRepository.existsByDoctorAndDateHeure(doctor, date)).thenReturn(false);
        when(appointmentRepository.save(any(Appointment.class))).thenAnswer(invocation -> {
            Appointment appt = invocation.getArgument(0);
            appt.setId(5L);
            return appt;
        });

        AppointmentResponse response = appointmentService.createAppointment(patient.getId(), request);

        assertEquals(5L, response.getId());
        assertEquals(AppointmentStatus.PENDING, response.getStatut());
        assertEquals(doctor.getId(), response.getDoctorId());
        verify(appointmentRepository, times(1)).save(any(Appointment.class));
    }

    @Test
    void shouldRejectDoubleBookingForDoctor() {
        User patient = User.builder().id(1L).nom("Patient").role(Role.PATIENT).build();
        User doctor = User.builder().id(2L).nom("Doctor").role(Role.DOCTOR).build();
        LocalDateTime date = LocalDateTime.now().plusDays(1);
        AppointmentRequest request = new AppointmentRequest();
        request.setDoctorId(doctor.getId());
        request.setDateHeure(date);
        request.setMotif("Consultation");

        when(userRepository.findById(patient.getId())).thenReturn(Optional.of(patient));
        when(userRepository.findById(doctor.getId())).thenReturn(Optional.of(doctor));
        when(appointmentRepository.existsByDoctorAndDateHeure(doctor, date)).thenReturn(true);

        assertThrows(IllegalStateException.class, () -> appointmentService.createAppointment(patient.getId(), request));
        verify(appointmentRepository, never()).save(any(Appointment.class));
    }
}

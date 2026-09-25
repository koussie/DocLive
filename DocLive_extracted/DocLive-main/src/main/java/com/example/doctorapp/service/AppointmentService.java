package com.example.doctorapp.service;

import com.example.doctorapp.dto.AppointmentRequest;
import com.example.doctorapp.dto.AppointmentResponse;
import com.example.doctorapp.entity.Appointment;
import com.example.doctorapp.entity.AppointmentStatus;
import com.example.doctorapp.entity.Role;
import com.example.doctorapp.entity.User;
import com.example.doctorapp.exception.BadRequestException;
import com.example.doctorapp.exception.ConflictException;
import com.example.doctorapp.exception.ForbiddenException;
import com.example.doctorapp.exception.NotFoundException;
import com.example.doctorapp.mapper.AppointmentMapper;
import com.example.doctorapp.repository.AppointmentRepository;
import com.example.doctorapp.repository.UserRepository;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final JavaMailSender mailSender;
    private final AppointmentMapper appointmentMapper;

    public AppointmentService(AppointmentRepository appointmentRepository,
                              UserRepository userRepository,
                              Optional<JavaMailSender> mailSender,
                              AppointmentMapper appointmentMapper) {
        this.appointmentRepository = appointmentRepository;
        this.userRepository = userRepository;
        this.mailSender = mailSender.orElse(null);
        this.appointmentMapper = appointmentMapper;
    }

    @Transactional
    public AppointmentResponse createAppointment(Long patientId, AppointmentRequest request) {
        User patient = userRepository.findById(patientId)
                .orElseThrow(() -> new NotFoundException("PATIENT_NOT_FOUND", "Patient introuvable"));
        if (patient.getRole() != Role.PATIENT) {
            throw new ForbiddenException("INVALID_ROLE", "Seuls les patients peuvent créer des rendez-vous");
        }
        User doctor = userRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new NotFoundException("DOCTOR_NOT_FOUND", "Médecin introuvable"));

        if (doctor.getRole() != Role.DOCTOR) {
            throw new BadRequestException("INVALID_DOCTOR_ROLE", "Le destinataire doit être un médecin");
        }

        LocalDateTime dateTime = combineDateTime(request.getDate(), request.getTime());
        if (dateTime.isBefore(LocalDateTime.now())) {
            throw new BadRequestException("PAST_APPOINTMENT", "La date de rendez-vous doit être future");
        }

        if (appointmentRepository.existsByDoctorAndDateHeureAndStatutNot(doctor, dateTime, AppointmentStatus.CANCELLED)) {
            throw new ConflictException("APPOINTMENT_CONFLICT", "Ce créneau est déjà réservé pour ce médecin");
        }

        if (doctor.getId().equals(patient.getId())) {
            throw new BadRequestException("SELF_APPOINTMENT", "Un patient ne peut pas prendre rendez-vous avec lui-même");
        }

        Appointment appointment = Appointment.builder()
                .patient(patient)
                .doctor(doctor)
                .dateHeure(dateTime)
                .motif("Consultation")
                .statut(AppointmentStatus.CONFIRMED)
                .build();

        Appointment saved = appointmentRepository.save(appointment);
        sendConfirmationEmail(patient, saved);
        return appointmentMapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponse> findAppointmentsForPatient(Long patientId) {
        return appointmentRepository.findByPatientIdOrderByDateHeureAsc(patientId).stream()
                .map(appointmentMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponse> findAppointmentsForDoctor(Long doctorId) {
        return appointmentRepository.findByDoctorIdOrderByDateHeureAsc(doctorId).stream()
                .map(appointmentMapper::toResponse)
                .toList();
    }

    @Transactional
    public AppointmentResponse cancelAppointment(Long appointmentId, Long userId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new NotFoundException("APPOINTMENT_NOT_FOUND", "Rendez-vous introuvable"));
        if (!appointment.getPatient().getId().equals(userId) && !appointment.getDoctor().getId().equals(userId)) {
            throw new ForbiddenException("APPOINTMENT_FORBIDDEN", "Ce rendez-vous n'appartient pas à l'utilisateur connecté");
        }
        if (appointment.getStatut() == AppointmentStatus.CANCELLED) {
            throw new ConflictException("ALREADY_CANCELLED", "Le rendez-vous est déjà annulé");
        }
        appointment.setStatut(AppointmentStatus.CANCELLED);
        appointment.setCanceledAt(LocalDateTime.now());
        Appointment saved = appointmentRepository.save(appointment);
        return appointmentMapper.toResponse(saved);
    }

    private LocalDateTime combineDateTime(LocalDate date, LocalTime time) {
        return LocalDateTime.of(date, time);
    }

    private void sendConfirmationEmail(User patient, Appointment appointment) {
        if (mailSender == null) {
            return;
        }
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setTo(patient.getEmail());
            helper.setSubject("Confirmation de rendez-vous");
            helper.setText("Bonjour " + patient.getNom() + ", votre rendez-vous est programmé le "
                    + appointment.getDateHeure() + " pour : " + appointment.getMotif());
            mailSender.send(message);
        } catch (MessagingException ignored) {
        }
    }
}

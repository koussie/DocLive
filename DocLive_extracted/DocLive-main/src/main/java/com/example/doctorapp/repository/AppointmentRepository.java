package com.example.doctorapp.repository;

import com.example.doctorapp.entity.Appointment;
import com.example.doctorapp.entity.AppointmentStatus;
import com.example.doctorapp.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByPatientIdOrderByDateHeureAsc(Long patientId);

    List<Appointment> findByDoctorIdOrderByDateHeureAsc(Long doctorId);

    boolean existsByDoctorAndDateHeureAndStatutNot(User doctor, LocalDateTime dateHeure, AppointmentStatus statut);
}

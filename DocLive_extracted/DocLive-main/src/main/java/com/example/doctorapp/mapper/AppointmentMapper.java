package com.example.doctorapp.mapper;

import com.example.doctorapp.dto.AppointmentResponse;
import com.example.doctorapp.entity.Appointment;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalTime;

@Component
public class AppointmentMapper {

    private final UserMapper userMapper;

    public AppointmentMapper(UserMapper userMapper) {
        this.userMapper = userMapper;
    }

    public AppointmentResponse toResponse(Appointment appointment) {
        LocalDate date = appointment.getDateHeure().toLocalDate();
        LocalTime time = appointment.getDateHeure().toLocalTime();

        return AppointmentResponse.builder()
                .id(appointment.getId())
                .date(date)
                .time(time)
                .status(appointment.getStatut())
                .canceledAt(appointment.getCanceledAt())
                .doctor(userMapper.toSummary(appointment.getDoctor()))
                .patient(userMapper.toSummary(appointment.getPatient()))
                .build();
    }
}

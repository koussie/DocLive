package com.example.doctorapp.dto;

import com.example.doctorapp.entity.Role;
import lombok.Builder;
import lombok.Value;

import java.time.LocalDate;

@Value
@Builder
public class UserProfileResponse {
    Long id;
    String name;
    String email;
    Role role;
    String phone;
    LocalDate birthdate;
}

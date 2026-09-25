package com.example.doctorapp.dto;

import com.example.doctorapp.entity.Role;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class UserSummaryResponse {
    Long id;
    String name;
    String email;
    Role role;
    String phone;
}

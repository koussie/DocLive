package com.example.doctorapp.mapper;

import com.example.doctorapp.dto.UserProfileResponse;
import com.example.doctorapp.dto.UserSummaryResponse;
import com.example.doctorapp.entity.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public UserProfileResponse toProfile(User user) {
        return UserProfileResponse.builder()
                .id(user.getId())
                .name(user.getNom())
                .email(user.getEmail())
                .role(user.getRole())
                .phone(user.getPhone())
                .birthdate(user.getBirthdate())
                .build();
    }

    public UserSummaryResponse toSummary(User user) {
        return UserSummaryResponse.builder()
                .id(user.getId())
                .name(user.getNom())
                .email(user.getEmail())
                .role(user.getRole())
                .phone(user.getPhone())
                .build();
    }
}

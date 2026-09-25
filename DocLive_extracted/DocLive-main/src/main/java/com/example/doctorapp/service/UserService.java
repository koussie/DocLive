package com.example.doctorapp.service;

import com.example.doctorapp.dto.RegisterRequest;
import com.example.doctorapp.dto.UserProfileResponse;
import com.example.doctorapp.dto.UserSummaryResponse;
import com.example.doctorapp.dto.UserUpdateRequest;
import com.example.doctorapp.entity.Role;
import com.example.doctorapp.entity.User;
import com.example.doctorapp.exception.ConflictException;
import com.example.doctorapp.exception.NotFoundException;
import com.example.doctorapp.exception.UnauthorizedException;
import com.example.doctorapp.mapper.UserMapper;
import com.example.doctorapp.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, UserMapper userMapper) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.userMapper = userMapper;
    }

    public User registerUser(RegisterRequest request) {
        userRepository.findByEmail(request.getEmail()).ifPresent(user -> {
            throw new ConflictException("EMAIL_EXISTS", "Un utilisateur avec cet email existe déjà");
        });
        User newUser = User.builder()
                .nom(request.getNom())
                .email(request.getEmail())
                .motDePasse(passwordEncoder.encode(request.getMotDePasse()))
                .role(request.getRole())
                .build();
        return userRepository.save(newUser);
    }

    public UserProfileResponse getProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("USER_NOT_FOUND", "Utilisateur introuvable"));
        return userMapper.toProfile(user);
    }

    public UserProfileResponse updateProfile(String email, UserUpdateRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("USER_NOT_FOUND", "Utilisateur introuvable"));

        Optional.ofNullable(request.getName()).filter(name -> !name.isBlank()).ifPresent(user::setNom);
        Optional.ofNullable(request.getPhone()).filter(phone -> !phone.isBlank()).ifPresent(user::setPhone);
        Optional.ofNullable(request.getBirthdate()).ifPresent(user::setBirthdate);

        if (request.getEmail() != null && !request.getEmail().isBlank() && !request.getEmail().equals(user.getEmail())) {
            userRepository.findByEmail(request.getEmail()).ifPresent(existing -> {
                if (!existing.getId().equals(user.getId())) {
                    throw new ConflictException("EMAIL_EXISTS", "Cet email est déjà utilisé");
                }
            });
            user.setEmail(request.getEmail());
        }

        User saved = userRepository.save(user);
        return userMapper.toProfile(saved);
    }

    public User getUserEntityByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("USER_NOT_FOUND", "Utilisateur introuvable"));
    }

    public User findDoctorById(Long id) {
        return userRepository.findById(id)
                .filter(user -> user.getRole() == Role.DOCTOR)
                .orElseThrow(() -> new NotFoundException("DOCTOR_NOT_FOUND", "Médecin introuvable"));
    }

    public List<UserSummaryResponse> listDoctorSummaries() {
        return userRepository.findAllByRole(Role.DOCTOR).stream()
                .map(userMapper::toSummary)
                .toList();
    }
}

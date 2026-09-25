package com.example.doctorapp.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class UserUpdateRequest {
    @Size(min = 1, max = 100)
    private String name;

    @Email
    @Size(min = 5, max = 150)
    private String email;

    @Pattern(regexp = "^$|^[+0-9 .-]{6,20}$", message = "Numéro de téléphone invalide")
    private String phone;

    @Past(message = "La date de naissance doit être dans le passé")
    private LocalDate birthdate;
}

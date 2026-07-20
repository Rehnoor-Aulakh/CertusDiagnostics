package com.rehnoor.certusbackend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.ColumnTransformer;
import org.hibernate.annotations.JdbcType;
import org.hibernate.annotations.Type;

import java.time.LocalDate;
import java.time.ZonedDateTime;

@Entity
@Table(name="patients")
@Getter
@Setter
@NoArgsConstructor
public class Patient {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="patient_id")
    private Long patientId;

    @Column(nullable = false)
    private String name;

    @Column(unique = true)
    private String email;

    @Column(length=15)
    private String phone;

    @Column(length=255)
    private String password;

    private LocalDate dob;

    @Column(name = "gender", columnDefinition = "gender_enum")
    @ColumnTransformer(write="?::gender_enum")
    private String gender; // Mapped as standard string text at boundary level
    public enum Gender {
        Male, Female, Other
    }
    public Gender getGender(){
        return this.gender==null ? null : Gender.valueOf(this.gender);
    }

    public void setGender(Gender gender){
        this.gender = gender==null ? null : gender.name();
    }

    @Column(name="google_id")
    private String googleId;

    @Column(name="profile_picture", length = 500)
    private String profilePicture;

    @Column(name="email_verified")
    private Boolean emailVerified = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private ZonedDateTime createdAt = ZonedDateTime.now();

    @Column(name = "last_login")
    private ZonedDateTime lastLogin;

}

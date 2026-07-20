package com.rehnoor.certusbackend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.ZonedDateTime;

@Entity
@Table(name = "admin_otp")
@Getter
@Setter
@NoArgsConstructor
public class AdminOtp {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String email;

    @Column(nullable = false, length =10)
    private String otp;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "google_data", nullable = false, columnDefinition = "jsonb")
    private String googleData;  // Stored as queryable JSON String

    @Column(name = "created_at", nullable = false, updatable = false)
    private ZonedDateTime createdAt = ZonedDateTime.now();

    @Column(name = "expires_at", nullable = false)
    private ZonedDateTime expiresAt;

    @Column(nullable = false)
    private Boolean used = false;

}

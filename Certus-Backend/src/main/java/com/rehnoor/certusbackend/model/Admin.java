package com.rehnoor.certusbackend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.ZonedDateTime;

@Entity
@Table(name="admin")
@Getter
@Setter
@NoArgsConstructor
public class Admin {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "admin_id")
    private Long adminId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(length = 15)
    private String phone;

    @Column(length = 255)
    private String password;

    @Column(name="google_id")
    private String googleId;

    @Column(name="profile_picture", length=500)
    private String profilePicture;

    @Column(name = "last_login")
    private ZonedDateTime lastLogin;

    @Column(name = "created_at", nullable = false, updatable = false)
    private ZonedDateTime createdAt = ZonedDateTime.now();

    @Column(name = "updated_at", nullable = false, updatable = false)
    private ZonedDateTime updatedAt = ZonedDateTime.now();

    @Column(nullable = false, length = 20)
    private String status = "APPROVED";     // Default to approved for seeded admins, new ones get "PENDING"

    @Column(name="approval_token", length=255)
    private String approvalToken;


    // when anything in the Admin Entity is updated, this function gets called, which will set the updatedAt time
    @PreUpdate
    protected void onUpdate(){
        this.updatedAt = ZonedDateTime.now();
    }

}

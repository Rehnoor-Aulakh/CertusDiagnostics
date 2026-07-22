package com.rehnoor.certusbackend.controller;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.beans.factory.annotation.Value;
import com.rehnoor.certusbackend.config.security.JwtTokenProvider;
import com.rehnoor.certusbackend.config.security.SecurityUser;
import com.rehnoor.certusbackend.dto.*;
import com.rehnoor.certusbackend.model.Admin;
import com.rehnoor.certusbackend.model.Patient;
import com.rehnoor.certusbackend.repository.AdminRepository;
import com.rehnoor.certusbackend.repository.PatientRepository;
import com.rehnoor.certusbackend.service.EmailService;
import org.apache.coyote.Response;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.parameters.P;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.nio.file.attribute.UserPrincipal;
import java.util.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    @Value("${app.google.client-id:${GOOGLE_CLIENT_ID:}}")
    private String googleClientId;

    /// Native Email Password Registration
    @PostMapping("/patient/register")
    public ResponseEntity<?> registerPatient(@RequestBody RegisterRequest request) {
        if (patientRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", "Email is already registered"));
        }
        Patient patient = new Patient();
        patient.setName(request.getName());
        patient.setEmail(request.getEmail());
        patient.setPhone(request.getPhone());

        // Hash the password using BCrypt before storing it to Postgres
        patient.setPassword(passwordEncoder.encode(request.getPassword()));
        patient.setEmailVerified(false);

        patientRepository.save(patient);

        return ResponseEntity.ok(Map.of("success", true, "message", "Patient account created successfully."));
    }

    /// Patient Login Endpoint
    @PostMapping("/patient/login")
    public ResponseEntity<?> authenticatePatient(@RequestBody LoginRequest loginRequest) {
        try {
            // 1. Hand the credentials to Spring Security's manager engine
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getEmail(),
                            loginRequest.getPassword()));
            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = tokenProvider.generateToken(authentication);

            Optional<Patient> patientOpt = patientRepository.findByEmail(loginRequest.getEmail());
            if (patientOpt.isEmpty()) {
                // if you cant find record, you cant login
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User record discrepancy encountered.");
            }
            Patient patient = patientOpt.get();
            Map<String, Object> userPayload = new HashMap<>();
            userPayload.put("patient_id", patient.getPatientId());
            userPayload.put("name", patient.getName());
            userPayload.put("email", patient.getEmail());
            userPayload.put("phone", patient.getPhone());
            userPayload.put("role", "ROLE_PATIENT");
            userPayload.put("token", jwt);

            return ResponseEntity.ok(new ReactAuthResponse(true, "Authentication Successful", false, userPayload));

        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Authentication Failed: Invalid email or password configuration");
        }
    }

    @PostMapping("/google-login")
    public ResponseEntity<?> handleGoogleLogin(@RequestBody GoogleLoginRequest request) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(),
                    new GsonFactory())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();
            GoogleIdToken idToken = verifier.verify(request.getCredential());
            if (idToken == null) {
                return ResponseEntity.ok(
                        new ReactAuthResponse(false, "Invalid Cryptographic Token Integrity Validation", false, null));
            }
            GoogleLoginRequest.GoogleUserData data = request.getUser_data();
            String targetRole = request.getRole();

            boolean isNewUser = false;
            Map<String, Object> userPayload = new HashMap<>();
            String userEmail = data.getEmail();

            // ADMIN OAUTH PIPELINE
            if ("ROLE_ADMIN".equalsIgnoreCase(targetRole)) {
                Optional<Admin> adminOpt = adminRepository.findByGoogleId(data.getGoogle_id());

                // If not found by Google ID, find by email
                if (adminOpt.isEmpty()) {
                    adminOpt = adminRepository.findByEmail(data.getEmail());
                }
                Admin admin;
                if (adminOpt.isEmpty()) {
                    // SCENERIO 1: Complete stranger requesting access. Create a pending staging
                    admin = new Admin();
                    admin.setName(data.getName());
                    admin.setEmail(data.getEmail());
                    admin.setGoogleId(data.getGoogle_id());
                    admin.setPassword("");
                    admin.setProfilePicture(data.getPicture());
                    admin.setStatus("PENDING"); // Lock them out until approval triggers

                    String generatedToken = java.util.UUID.randomUUID().toString();
                    admin.setApprovalToken(generatedToken);
                    adminRepository.save(admin);

                    // Fire background dispatch notification straight to your email channel
                    emailService.sendAdminApprovalEmail(data.getName(), data.getEmail(), generatedToken);

                    Map<String, Object> pendingResponse = new HashMap<>();
                    pendingResponse.put("success", false);
                    pendingResponse.put("pending", true);
                    pendingResponse.put("message",
                            "Your access request has been sent to the super admin for approval. Come back shortly!");
                    return ResponseEntity.ok(pendingResponse);
                } else {
                    admin = adminOpt.get();
                }

                // SCENERIO 2: They exist but their access token is flagged as still awaiting
                // confirmation
                if ("PENDING".equalsIgnoreCase(admin.getStatus())) {
                    Map<String, Object> pendingResponse = new HashMap<>();
                    pendingResponse.put("success", false);
                    pendingResponse.put("pending", true);
                    pendingResponse.put("message",
                            "Your registration profile is currently awaiting super administrator review.");
                    return ResponseEntity.ok(pendingResponse);
                }
                // SCENERIO 3: Approved Admin. Generate full session application credentials
                SecurityUser userPrincipal = new SecurityUser(admin.getEmail(), "", "ROLE_ADMIN");
                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        userPrincipal, null, userPrincipal.getAuthorities());
                SecurityContextHolder.getContext().setAuthentication(authentication);
                String appJwt = tokenProvider.generateToken(authentication);

                userPayload.put("admin_id", admin.getAdminId());
                userPayload.put("name", admin.getName());
                userPayload.put("email", admin.getEmail());
                userPayload.put("role", "ROLE_ADMIN");
                userPayload.put("token", appJwt);

                return ResponseEntity.ok(Map.of("success", true, "admin", userPayload));
            }
            // Patient pipeline
            else {
                Optional<Patient> patientOpt = patientRepository.findByEmailIgnoreCase(userEmail);

                if (patientOpt.isEmpty()) {
                    patientOpt = patientRepository.findByGoogleId(data.getGoogle_id());
                }

                Patient patient;

                if (patientOpt.isEmpty()) {
                    // Patients can register fluidly self-service
                    isNewUser = true;
                    patient = new Patient();
                    patient.setName(data.getName());
                    patient.setEmail(userEmail);
                    patient.setGoogleId(data.getGoogle_id());
                    patient.setProfilePicture(data.getPicture());
                    patient.setEmailVerified(data.isEmail_verified());
                    patient.setPhone("");
                    patient.setPassword("");
                    patient = patientRepository.save(patient);
                } else {
                    patient = patientOpt.get();
                    // Update Google ID if it was missing (e.g., added by receptionist)
                    if (patient.getGoogleId() == null) {
                        patient.setGoogleId(data.getGoogle_id());
                        patient.setProfilePicture(data.getPicture());
                        patient = patientRepository.save(patient);
                    }
                }

                // Establish Spring Security Context for Patient
                SecurityUser userPrincipal = new SecurityUser(patient.getEmail(), "", "ROLE_PATIENT");
                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        userPrincipal, null, userPrincipal.getAuthorities());
                SecurityContextHolder.getContext().setAuthentication(authentication);

                String appJwt = tokenProvider.generateToken(authentication);

                // Structure response matching Customer frontend state expectations
                userPayload.put("patient_id", patient.getPatientId());
                userPayload.put("name", patient.getName());
                userPayload.put("email", patient.getEmail());
                userPayload.put("phone", patient.getPhone());
                userPayload.put("role", "ROLE_PATIENT");
                userPayload.put("token", appJwt);
            }
            return ResponseEntity
                    .ok(new ReactAuthResponse(true, "Google Authentication Successful", isNewUser, userPayload));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Auth engine validation error: " + e.getMessage()));
        }
    }

    // Unified phone number update
    @PostMapping("/update-phone")
    public ResponseEntity<?> updatePhone(@RequestBody PhoneUpdateRequest request) {
        if ("ROLE_ADMIN".equalsIgnoreCase(request.getRole())) {
            Optional<Admin> adminOpt = adminRepository.findById(request.getUser_id());
            if (adminOpt.isPresent()) {
                Admin admin = adminOpt.get();
                admin.setPhone(request.getPhone_number());
                adminRepository.save(admin);
                return ResponseEntity.ok(Map.of("success", true, "message", "Admin phone record updated"));
            }
        } else {
            Optional<Patient> patientOpt = patientRepository.findById(request.getUser_id());
            if (patientOpt.isPresent()) {
                Patient patient = patientOpt.get();
                patient.setPhone(request.getPhone_number());
                patientRepository.save(patient);
                return ResponseEntity.ok(Map.of("success", true, "message", "Patient phone record updated."));
            }
        }
        return ResponseEntity.ok(Map.of("success", false, "message", "Target user profile context not found."));
    }

    // Web Link Resolution Pathway (Triggered via email link clicks)
    // means when super admin clicks on the links provided in the email
    @GetMapping("/admin/request")
    public ResponseEntity<String> handleAdminLinkResolution(@RequestParam("action") String action,
            @RequestParam("token") String token) {
        Optional<Admin> adminOpt = adminRepository.findByApprovalToken(token);
        if (adminOpt.isEmpty()) {
            return ResponseEntity.ok(buildHtmlResponse("Approval Link Invalid",
                    "The verification path signature is malformed or has expired.", "#dc2626"));
        }
        Admin admin = adminOpt.get();
        if ("approve".equalsIgnoreCase(action)) {
            admin.setStatus("APPROVED");
            admin.setApprovalToken(null);
            adminRepository.save(admin);
            return ResponseEntity.ok(buildHtmlResponse("Access Approved!",
                    admin.getName() + " is now granted full administrative data controls.", "#16a34a"));
        } else if ("reject".equalsIgnoreCase(action)) {
            adminRepository.delete(admin);
            return ResponseEntity.ok(buildHtmlResponse("Access Rejected",
                    "The candidate request profile has been dropped safely.", "#dc2626"));
        }
        return ResponseEntity.badRequest().body("Invalid Action Specification Parameter");

    }

    private String buildHtmlResponse(String title, String message, String color) {
        return "<html><body style='font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: linear-gradient(135deg, "
                + color + ", #111827);'>"
                + "<div style='background: white; padding: 40px; border-radius: 12px; box-shadow: 0 10px 15px rgba(0,0,0,0.3); text-align: center; max-width: 450px;'>"
                + "<h1 style='color: " + color + "; margin-bottom: 15px;'>" + title + "</h1>"
                + "<p style='color: #4b5563; line-height: 1.6; font-size: 16px;'>" + message + "</p>"
                + "</div></body></html>";
    }

}

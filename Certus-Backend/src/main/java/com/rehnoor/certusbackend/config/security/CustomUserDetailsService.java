package com.rehnoor.certusbackend.config.security;

import com.rehnoor.certusbackend.model.Admin;
import com.rehnoor.certusbackend.model.Patient;
import com.rehnoor.certusbackend.repository.AdminRepository;
import com.rehnoor.certusbackend.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {
    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // Fallback for cases where role is not available
        var adminOpt = adminRepository.findByEmail(email);
        if(adminOpt.isPresent()){
            Admin admin = adminOpt.get();
            return new SecurityUser(admin.getEmail(), admin.getPassword(), "ROLE_ADMIN");
        }

        var patientOpt = patientRepository.findByEmail(email);
        if(patientOpt.isPresent()){
            Patient patient = patientOpt.get();
            return new SecurityUser(patient.getEmail(), patient.getPassword(), "ROLE_PATIENT");
        }
        throw new UsernameNotFoundException("Identity credentials not found for email: "+email);
    }

    public UserDetails loadUserByUsernameAndRole(String email, String role) throws UsernameNotFoundException {
        if ("ROLE_ADMIN".equals(role)) {
            var adminOpt = adminRepository.findByEmail(email);
            if(adminOpt.isPresent()){
                Admin admin = adminOpt.get();
                return new SecurityUser(admin.getEmail(), admin.getPassword(), "ROLE_ADMIN");
            }
        } else if ("ROLE_PATIENT".equals(role)) {
            var patientOpt = patientRepository.findByEmail(email);
            if(patientOpt.isPresent()){
                Patient patient = patientOpt.get();
                return new SecurityUser(patient.getEmail(), patient.getPassword(), "ROLE_PATIENT");
            }
        }
        // Fallback
        return loadUserByUsername(email);
    }
}

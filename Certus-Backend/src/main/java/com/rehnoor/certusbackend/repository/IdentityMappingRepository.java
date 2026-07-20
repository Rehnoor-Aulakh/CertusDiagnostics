package com.rehnoor.certusbackend.repository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public class IdentityMappingRepository {
    @Autowired
    private JdbcTemplate jdbcTemplate;

    public Optional<Long> findFakeIdByRealName(String realName) {
        String sql = "SELECT fake_patient_id FROM patient_identity_mapping WHERE real_name = ?";
        try{
            Long id = jdbcTemplate.queryForObject(sql, Long.class, realName);
            return Optional.ofNullable(id);
        } catch (Exception e){
            return Optional.empty();
        }
    }

    public void saveMapping(String realName, Long fakePatientId){
        String sql = "INSERT INTO patient_identity_mapping (real_name, fake_patient_id) VALUES (?,?)";
        jdbcTemplate.update(sql, realName, fakePatientId);
    }
}

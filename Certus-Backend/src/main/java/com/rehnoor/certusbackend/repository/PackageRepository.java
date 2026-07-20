package com.rehnoor.certusbackend.repository;

import com.rehnoor.certusbackend.model.Package;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PackageRepository extends JpaRepository<Package, Long> {
    // basic crud methods inherited automatically
}

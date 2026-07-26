package com.rehnoor.certusbackend.repository;

import com.rehnoor.certusbackend.dto.PackageResponseDTO;
import com.rehnoor.certusbackend.model.Package;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PackageRepository extends JpaRepository<Package, Long> {
    List<Package> findAllByStatusAvailableTrueOrderByCategory_DisplayOrderAscDisplayOrderAsc();

    List<Package> findAllByOrderByDisplayOrder();
    // basic crud methods inherited automatically
}

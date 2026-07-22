package com.rehnoor.certusbackend.repository;

import com.rehnoor.certusbackend.model.Patient;
import com.rehnoor.certusbackend.model.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.security.core.parameters.P;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    boolean existsByReportHash(String reportHash);

    @Query("SELECT r FROM Report r WHERE r.patientId.patientId = :patientId ORDER BY r.reportDate DESC")
    List<Report> findByPatientIdField(@Param("patientId") Long patientId);

    @Query(value = "SELECT COUNT(*) FROM reports WHERE DATE(report_date) = CURRENT_DATE ", nativeQuery = true)
    long countTestsToday();

    @Query(value = "SELECT COUNT(*) FROM reports WHERE report_location IS NULL OR report_location=''", nativeQuery = true)
    long countPendingReports();

    @Query(value = "SELECT COALESCE(SUM(price),0) FROM reports WHERE DATE(report_date)=CURRENT_DATE ", nativeQuery = true)
    double getRevenueToday();

    @Query(value = "SELECT COALESCE(SUM(price), 0) FROM reports WHERE EXTRACT(WEEK FROM report_date) = EXTRACT(WEEK FROM CURRENT_DATE) AND EXTRACT(YEAR FROM report_date) = EXTRACT(YEAR FROM CURRENT_DATE)", nativeQuery = true)
    double getRevenueThisWeek();

    @Query(value = "SELECT COALESCE(SUM(price),0) FROM reports WHERE EXTRACT(MONTH FROM report_date)= EXTRACT(MONTH FROM CURRENT_DATE)", nativeQuery = true)
    double getRevenueThisMonth();

    @Query(value = "SELECT COUNT(*) FROM reports WHERE EXTRACT(WEEK FROM report_date) = EXTRACT(WEEK FROM CURRENT_DATE) AND EXTRACT(YEAR FROM report_date) = EXTRACT(YEAR FROM CURRENT_DATE)", nativeQuery = true)
    long countTestsThisWeek();

    @Query(value = "SELECT COUNT(*) FROM reports WHERE EXTRACT(MONTH FROM report_date) = EXTRACT(MONTH FROM CURRENT_DATE) AND EXTRACT(YEAR FROM report_date) = EXTRACT(YEAR FROM CURRENT_DATE)", nativeQuery = true)
    long countTestsThisMonth();

    // Fetches metrics required for active dynamic growth tracking
    @Query(value = "SELECT COUNT(*) FROM reports WHERE EXTRACT(MONTH FROM report_date)=:month and EXTRACT(YEAR FROM report_date)=:year", nativeQuery = true)
    long countTestsByMonthAndYear(@Param("month") int month, @Param("year") int year);

    @Query(value = "SELECT COALESCE(SUM(price),0) FROM reports WHERE EXTRACT(MONTH FROM report_date)=:month and EXTRACT(YEAR FROM report_date)=:year", nativeQuery = true)
    double getRevenueByMonthAndYear(@Param("month") int month, @Param("year") int year);

    @Query(value = "SELECT COUNT(*) FROM reports WHERE EXTRACT(MONTH FROM report_date) = :month AND EXTRACT(YEAR FROM report_date) = :year AND (report_location IS NULL OR report_location = '')", nativeQuery = true)
    long countPendingReportsByMonthAndYear(@Param("month") int month, @Param("year") int year);

    // Dynamic extraction of recent items linking tables natively
    @Query(value = "SELECT r.report_id, r.test_name, p.name as patient_name, r.report_date, " +
            "CASE WHEN r.report_location IS NOT NULL AND r.report_location != '' THEN 'Completed' ELSE 'Pending' END as status, " +
            "EXTRACT(EPOCH FROM (NOW() - r.report_date))/3600 as hours_ago " +
            "FROM reports r JOIN patients p ON r.patient_id = p.patient_id " +
            "ORDER BY r.report_date DESC LIMIT 5", nativeQuery = true)
    List<Object[]> findRecentTestsNative();


    List<Report> findByPatientIdOrderByReportDateDesc(Patient patient);

    List<Report> findByPatientIdOrderByReportDateAsc(Patient patient);
}

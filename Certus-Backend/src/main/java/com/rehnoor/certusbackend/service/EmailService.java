package com.rehnoor.certusbackend.service;

import com.rehnoor.certusbackend.model.Patient;
import com.rehnoor.certusbackend.model.Report;
import com.rehnoor.certusbackend.parser.model.DiagnosticReport;
import com.rehnoor.certusbackend.parser.model.TestResult;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.File;
import java.util.List;

@Service
public class EmailService {
    @Autowired
    private JavaMailSender mailSender;

    @Value("${SUPER_ADMIN_EMAIL:${super_admin_email:${app.superadmin.email:}}}")
    private String superAdminEmail;

    public void sendAdminApprovalEmail(String applicantName, String applicantEmail, String token) {
        String baseServerUrl = "http://localhost:8080/api/v1/auth/admin/request";

        String approveUrl = baseServerUrl + "?action=approve&token=" + token;
        String rejectUrl = baseServerUrl + "?action=reject&token=" + token;

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(superAdminEmail);
            helper.setSubject("\uD83D\uDEA8 Action Required: New Admin Access Request");

            String htmlContent = "<html><body style='font-family: Arial, sans-serif; background-color: #f3f4f6; padding: 20px;'>"
                    + "<div style='max-width: 500px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);'>"
                    + "<h2 style='color: #1e3a8a; margin-bottom: 20px;'>New Admin Access Request</h2>"
                    + "<p style='color: #4b5563;'>A user is attempting to register as an administrator for the Certus Diagnostics portal.</p>"
                    + "<hr style='border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;'>"
                    + "<p><strong>Name:</strong> " + applicantName + "</p>"
                    + "<p><strong>Email:</strong> " + applicantEmail + "</p>"
                    + "<hr style='border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;'>"
                    + "<p style='color: #4b5563;'>Would you like to grant this user administrative dashboard privileges?</p>"
                    + "<div style='margin-top: 25px; display: flex; gap: 15px;'>"
                    + "<a href='" + approveUrl
                    + "' style='background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;'>Approve Access</a>"
                    + "<a href='" + rejectUrl
                    + "' style='background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-left: 10px;'>Reject Request</a>"
                    + "</div>"
                    + "</div></body></html>";

            helper.setText(htmlContent, true);
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to dispatch admin notification email: " + e.getMessage());
        }
    }

    @Async
    public void sendReportUploadedEmail(Patient patient, Report savedReport, File pdfFile,
            DiagnosticReport diagnosticReport) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(patient.getEmail());
            helper.setSubject("Your Diagnostic Report is Ready – Certus Diagnostics");

            StringBuilder html = new StringBuilder();

            html.append("""
                    <!DOCTYPE html>
                    <html>
                    <head>
                    <meta charset="UTF-8">
                    </head>
                    <body style="margin:0;padding:0;background:#f5f7fb;font-family:Arial,Helvetica,sans-serif;">

                    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f7fb;padding:40px 0;">
                    <tr>
                    <td align="center">

                    <table width="650" cellpadding="0" cellspacing="0"
                    style="background:#ffffff;border-radius:12px;
                    box-shadow:0 4px 15px rgba(0,0,0,.08);
                    overflow:hidden;">

                    <!-- HEADER -->

                    <tr>
                    <td style="background:#1565C0;padding:28px;text-align:center;">

                    <h1 style="margin:0;color:white;font-size:30px;">
                    🩺 Certus Diagnostics
                    </h1>

                    <p style="margin-top:8px;color:#dcecff;font-size:15px;">
                    Your Diagnostic Report is Ready
                    </p>

                    </td>
                    </tr>

                    <!-- BODY -->

                    <tr>
                    <td style="padding:35px;">

                    <p style="font-size:18px;color:#1565C0;margin-top:0;">
                    Hello <strong>""");

            html.append(patient.getName());

            html.append("""
                    </strong>,
                    </p>

                    <p style="font-size:15px;line-height:1.7;color:#444;">
                    Your diagnostic report has been successfully processed and uploaded.
                    The original PDF report has been attached to this email for your convenience.
                    </p>

                    <table width="100%"
                    style="background:#eef6ff;
                    border-left:5px solid #1565C0;
                    border-radius:8px;
                    padding:15px;
                    margin-top:25px;margin-bottom:30px;">

                    <tr>
                    <td>

                    <p style="margin:6px 0;color:#1565C0;">
                    <b>Report Name</b><br>
                    """);

            html.append(savedReport.getTestName());

            html.append("""
                    </p>

                    <p style="margin:6px 0;color:#1565C0;">
                    <b>Report Date</b><br>
                    """);

            html.append(savedReport.getReportDate());

            html.append("""
                    </p>

                    <p style="margin:6px 0;color:#1565C0;">
                    <b>Report ID</b><br>
                    #""");

            html.append(savedReport.getReportId());

            html.append("""
                    </p>

                    </td>
                    </tr>
                    </table>
                    """);

            List<TestResult> abnormal = diagnosticReport.getAbnormalTests();

            if (abnormal != null && !abnormal.isEmpty()) {

                html.append("""
                        <h2 style="
                        color:#d32f2f;
                        margin-bottom:18px;
                        ">
                        ⚠ Abnormal Test Results
                        </h2>

                        <table width="100%"
                        cellpadding="10"
                        cellspacing="0"
                        style="
                        border-collapse:collapse;
                        font-size:14px;
                        ">

                        <tr style="background:#1565C0;color:white;">

                        <th align="left">Test</th>
                        <th align="center">Value</th>
                        <th align="center">Normal Range</th>

                        </tr>
                        """);

                for (TestResult test : abnormal) {

                    html.append("<tr style='background:#fff5f5;'>");

                    html.append("<td style='border-bottom:1px solid #eee;color:#d32f2f;font-weight:bold;'>")
                            .append(test.getTestName())
                            .append("</td>");

                    html.append("<td align='center' style='border-bottom:1px solid #eee;color:#d32f2f;'>")
                            .append(test.getValue())
                            .append(" ")
                            .append(test.getUnit() == null ? "" : test.getUnit())
                            .append("</td>");

                    html.append("<td align='center' style='border-bottom:1px solid #eee;color:#666;'>")
                            .append(test.getReferenceRange() == null ? "N/A" : test.getReferenceRange())
                            .append("</td>");

                    html.append("</tr>");
                }

                html.append("</table>");

            } else {

                html.append("""
                        <div style="
                        background:#edf9f0;
                        padding:18px;
                        border-left:5px solid #2e7d32;
                        border-radius:8px;
                        margin-top:25px;
                        ">

                        <h2 style="margin-top:0;color:#2e7d32;">
                        ✓ Everything Looks Normal
                        </h2>

                        <p style="color:#444;">
                        No abnormal values were detected in this report.
                        Please refer to the attached PDF for the complete report.
                        </p>

                        </div>
                        """);

            }

            html.append("""

                    <div style="text-align:center;margin:45px 0;">

                    <a href="http://localhost:5173/sign-in"

                    style="
                    background:#1565C0;
                    color:white;
                    text-decoration:none;
                    padding:16px 36px;
                    border-radius:8px;
                    font-size:16px;
                    font-weight:bold;
                    display:inline-block;
                    ">

                    View My Reports

                    </a>

                    </div>

                    <p style="
                    font-size:15px;
                    line-height:1.8;
                    color:#444;
                    ">

                    Sign in using your
                    <b>Google account</b>
                    with the same email address that received this message.

                    Once signed in you'll be able to:

                    </p>

                    <ul style="color:#1565C0;line-height:2;">

                    <li>View all current reports</li>

                    <li>Access historical reports</li>

                    <li>Download original PDFs</li>

                    <li>See health summaries</li>

                    <li>Track abnormal values over time</li>

                    </ul>

                    <hr style="margin:35px 0;border:none;border-top:1px solid #eee;">

                    <p style="
                    font-size:13px;
                    color:#888;
                    line-height:1.7;
                    text-align:center;
                    ">

                    This email was automatically generated by
                    <b>Certus Diagnostics</b>.

                    The original PDF report is attached.

                    If you did not request this report,
                    please contact the laboratory immediately.

                    </p>

                    </td>
                    </tr>

                    </table>

                    </td>
                    </tr>

                    </table>

                    </body>
                    </html>
                    """);

            helper.setText(html.toString(), true);
            helper.addAttachment(pdfFile.getName(), pdfFile);
            mailSender.send(message);

        } catch (Exception e) {
            System.err.println("Failed to dispatch report upload email: " + e.getMessage());
        }
    }

}

package com.campusreuse.backend.service;

import com.campusreuse.backend.model.Inquiry;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    @Value("${app.base-url:http://localhost:80}")
    private String baseUrl;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Async
    public void sendInterestNotification(Inquiry inquiry) {
        try {
            if (fromEmail == null || fromEmail.isBlank()) {
                System.out.println("[EmailService] Mail not configured, skipping email notification.");
                return;
            }

            String sellerEmail = inquiry.getProduct().getSeller().getEmail();
            String sellerName = inquiry.getProduct().getSeller().getName();
            String buyerName = inquiry.getBuyer().getName();
            String productTitle = inquiry.getProduct().getTitle();
            double productPrice = inquiry.getProduct().getPrice();

            String subject = "New Interest in Your Product — " + productTitle;

            String htmlBody = """
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #f8faf8; border-radius: 12px;">
                    <div style="background: linear-gradient(135deg, #065f46, #059669); padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 22px;">CampusReuse</h1>
                        <p style="color: #d1fae5; margin: 4px 0 0; font-size: 13px;">Campus sharing made simple</p>
                    </div>
                    <div style="background: #ffffff; padding: 32px 24px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb;">
                        <p style="font-size: 16px; color: #1f2937;">Hi <strong>%s</strong>,</p>
                        <p style="font-size: 15px; color: #374151; line-height: 1.6;">
                            Great news! <strong>%s</strong> has shown interest in your product:
                        </p>
                        <div style="background: #f0fdf4; border-left: 4px solid #059669; padding: 16px; margin: 20px 0; border-radius: 0 8px 8px 0;">
                            <p style="margin: 0 0 4px; font-size: 17px; font-weight: 600; color: #065f46;">%s</p>
                            <p style="margin: 0; font-size: 15px; color: #059669; font-weight: 600;">₹%.2f</p>
                        </div>
                        <p style="font-size: 14px; color: #6b7280; line-height: 1.6;">
                            Login to CampusReuse to view the inquiry and share your contact details with the buyer.
                        </p>
                        <div style="text-align: center; margin-top: 28px;">
                            <a href="%s/dashboard"
                               style="display: inline-block; background: #059669; color: #ffffff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
                                View Inquiry
                            </a>
                        </div>
                    </div>
                    <p style="text-align: center; font-size: 12px; color: #9ca3af; margin-top: 16px;">
                        You received this email because someone showed interest in your listing on CampusReuse.
                    </p>
                </div>
                """.formatted(sellerName, buyerName, productTitle, productPrice, baseUrl);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(sellerEmail);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);

            mailSender.send(message);
            System.out.println("[EmailService] Interest notification sent to " + sellerEmail);
        } catch (Exception e) {
            System.err.println("[EmailService] Failed to send email: " + e.getMessage());
        }
    }
}

package email

import (
	"fmt"
	"log"
	"net/smtp"
	"os"

	"github.com/joho/godotenv"
)

func SendHTMLEmail(to, subject, htmlBody string) error {
	// Load .env file (optional, but safer than hardcoding)
	cfg := config.LoadConfig()

	from := cfg.Get("smtp")
	password := os.Getenv("SMTP_PASSWORD")

	// Receiver email
	toList := []string{to}

	// SMTP configuration
	smtpHost := "smtp.gmail.com"
	smtpPort := "587"

	// Construct the message with headers and HTML content
	message := []byte(fmt.Sprintf("Subject: %s\r\n", subject) +
		"MIME-Version: 1.0\r\n" +
		"Content-Type: text/html; charset=\"UTF-8\"\r\n\r\n" +
		htmlBody)

	// Auth
	auth := smtp.PlainAuth("", from, password, smtpHost)

	// Send
	err := smtp.SendMail(smtpHost+":"+smtpPort, auth, from, toList, message)
	if err != nil {
		return err
	}

	fmt.Println("✅ HTML email sent successfully!")
	return nil
}

func main() {
	html := `
	<!DOCTYPE html>
	<html>
	<head>
		<style>
			body {
				font-family: Arial, sans-serif;
				background-color: #f9f9f9;
				color: #333;
				padding: 20px;
			}
			.container {
				background: white;
				padding: 20px;
				border-radius: 10px;
				box-shadow: 0 2px 10px rgba(0,0,0,0.1);
				max-width: 600px;
				margin: auto;
			}
			h2 {
				color: #007BFF;
			}
			.footer {
				margin-top: 20px;
				font-size: 12px;
				color: #777;
				text-align: center;
			}
		</style>
	</head>
	<body>
		<div class="container">
			<h2>📊 Website Status Report</h2>
			<p>Hello there,</p>
			<p>Your website <strong>https://example.com</strong> is currently <span style="color: green;">UP</span>.</p>
			<p>Average response time: <strong>243ms</strong></p>
			<p>Generated at: <strong>2025-10-15 10:30 AM</strong></p>
			<div class="footer">Powered by <strong>GoLang</strong></div>
		</div>
	</body>
	</html>`

	err := SendHTMLEmail("receiver@example.com", "Daily Website Report 🌐", html)
	if err != nil {
		log.Fatal("Error sending email:", err)
	}
}

package email

import (
	"better-uptime/config"
	"fmt"
	"net/smtp"
)

func SendHTMLEmail(to string, subject string, htmlBody string) error {
	// Load configuration
	cfg := config.LoadConfig()
	from := cfg.SMTP_EMAIL
	password := cfg.SMTP_PASSWORD

	// Validate credentials
	if from == "" {
		return fmt.Errorf("SMTP_EMAIL is empty - check your .env file")
	}
	if password == "" {
		return fmt.Errorf("SMTP_PASSWORD is empty - check your .env file")
	}

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

	// Send email
	err := smtp.SendMail(smtpHost+":"+smtpPort, auth, from, toList, message)
	if err != nil {
		return fmt.Errorf("failed to send email: %v", err)
	}

	fmt.Println("✅ HTML email sent successfully!")
	return nil
}

// GetSampleHTML returns a sample HTML email template
func GetSampleHTML() string {
	return `
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
		.status-up {
			color: green;
			font-weight: bold;
		}
		.status-down {
			color: red;
			font-weight: bold;
		}
	</style>
</head>
<body>
	<div class="container">
		<h2>📊 Website Status Report</h2>
		<p>Hello there,</p>
		<p>Your website <strong>https://example.com</strong> is currently <span class="status-up">UP</span>.</p>
		<p>Average response time: <strong>243ms</strong></p>
		<p>Last checked: <strong>2025-10-15 10:30 AM</strong></p>
		<div class="footer">Powered by <strong>Better Uptime Monitor</strong></div>
	</div>
</body>
</html>`
}

// SendTestEmail sends a test email using the sample template
func SendTestEmail(to string) error {
	subject := "Test Email - Better Uptime Monitor"
	htmlBody := GetSampleHTML()
	
	return SendHTMLEmail(to, subject, htmlBody)
}

// SendStatusAlert sends a website status alert email
func SendStatusAlert(to string, websiteURL string, isUp bool, responseTime string, lastChecked string) error {
	status := "UP"
	statusClass := "status-up"
	if !isUp {
		status = "DOWN"
		statusClass = "status-down"
	}

	subject := fmt.Sprintf("🌐 Website Status: %s - %s", websiteURL, status)
	
	htmlBody := fmt.Sprintf(`
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
		.%s {
			color: %s;
			font-weight: bold;
			font-size: 18px;
		}
	</style>
</head>
<body>
	<div class="container">
		<h2>📊 Website Status Alert</h2>
		<p>Hello,</p>
		<p>Your website <strong>%s</strong> is currently <span class="%s">%s</span>.</p>
		<p>Response time: <strong>%s</strong></p>
		<p>Last checked: <strong>%s</strong></p>
		<div class="footer">Powered by <strong>Better Uptime Monitor</strong></div>
	</div>
</body>
</html>`, statusClass, getStatusColor(isUp), websiteURL, statusClass, status, responseTime, lastChecked)

	return SendHTMLEmail(to, subject, htmlBody)
}

func getStatusColor(isUp bool) string {
	if isUp {
		return "green"
	}
	return "red"
}
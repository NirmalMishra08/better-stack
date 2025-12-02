package alert

import (
	"better-uptime/common/email"
	"better-uptime/internal/api/monitor"
	db "better-uptime/internal/db/sqlc"
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgtype"
)

type TestURLResponse struct {
	Url          string  `json:"url"`
	StatusCode   int32   `json:"status_code"`
	ResponseTime float64 `json:"response_time"`
	Status       string  `json:"status"`
	DnsOk        bool    `json:"dns_ok"`
	SslOk        bool    `json:"ssl_ok"`
	Error        string  `json:"error,omitempty"`
}

func (h *Handler) GetAlertContactsForMonitor(ctx context.Context, monitorID int32) ([]db.AlertContact, error) {
	return h.store.GetAlertContactsByMonitor(ctx, pgtype.Int4{Int32: monitorID, Valid: true})
}

func (h *Handler) CheckAndSendAlerts(ctx context.Context, monitor db.Monitor, checkResult *monitor.TestURLResponse) error {
	contacts, err := h.GetAlertContactsForMonitor(ctx, monitor.ID)
	if err != nil {
		return err
	}

	newStatus := checkResult.Status
	oldStatus := monitor.LastStatus

	// If status hasn't changed, don't send alerts.
	if string(oldStatus.MonitorStatus) == newStatus {
		return nil
	}

	isUp := false
	alertType := "down"
	if newStatus == "up" {
		alertType = "up"
		isUp = true
	}

	message := fmt.Sprintf(
		"Monitor %s is now %s (was %s). Status Code: %d, Response Time: %.0fms",
		monitor.Url,
		newStatus,
		string(oldStatus.MonitorStatus),
		checkResult.StatusCode,
		checkResult.ResponseTime,
	)

	// 5. Send email to all contacts
	for _, c := range contacts {
		if err := email.SendStatusAlert(
			c.Email,     // to
			monitor.Url, // websiteURL
			isUp,        // isUp bool
			fmt.Sprintf("%.0fms", checkResult.ResponseTime), // responseTime string
			time.Now().Format("2006-01-02 15:04:05"),        // lastChecked string
		); err != nil {
			fmt.Println("Email failed:", err)
		}
	}

	// Save the alert log once
	if _, err := h.store.CreateAlert(ctx, db.CreateAlertParams{
		MonitorID: pgtype.Int4{Int32: monitor.ID, Valid: true},
		AlertType: alertType,
		Message:   message,
	}); err != nil {
		return err
	}

	// 6. Update last_status and last_alert_sent_at
	err = h.store.UpdateMonitorAlertState(ctx, db.UpdateMonitorAlertStateParams{
		ID: monitor.ID,
		LastStatus: db.NullMonitorStatus{
			MonitorStatus: db.MonitorStatus(newStatus),
			Valid:         true,
		},
		LastAlertSentAt: pgtype.Timestamp{
			Time:  time.Now(),
			Valid: true,
		},
	})
	return err
}

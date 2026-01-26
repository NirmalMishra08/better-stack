package monitor

import (
	db "better-uptime/internal/db/sqlc"
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/jackc/pgx/v5/pgtype"
)

func (h *Handler) PerformMonitorCheck(
	ctx context.Context,
	monitor db.Monitor,
) (*TestURLResponse, error) {

	client := &http.Client{
		Timeout: 30 * time.Second,
	}

	start := time.Now()

	req, err := http.NewRequestWithContext(
		ctx,
		monitor.Method.String,
		monitor.Url,
		nil,
	)
	if err != nil {
		return nil, err
	}

	resp, err := client.Do(req)
	responseTime := time.Since(start).Seconds() * 1000

	status := "down"
	var statusCode int32
	dnsOk := true
	sslOk := false
	var errorMsg string

	if err != nil {
		dnsOk = false
		statusCode = 0
		errorMsg = err.Error()
	} else {
		defer resp.Body.Close()
		statusCode = int32(resp.StatusCode)

		if statusCode >= 200 && statusCode < 400 {
			status = "up"
		} else {
			errorMsg = fmt.Sprintf(
				"HTTP %d - %s",
				statusCode,
				http.StatusText(int(statusCode)),
			)
		}
	}

	// ---------------------------
	// Save log
	// ---------------------------
	_, err = h.store.CreateMonitorLog(ctx, db.CreateMonitorLogParams{
		MonitorID:    pgtype.Int4{Int32: monitor.ID, Valid: true},
		StatusCode:   pgtype.Int4{Int32: statusCode, Valid: true},
		ResponseTime: pgtype.Float8{Float64: responseTime, Valid: true},
		DnsOk:        pgtype.Bool{Bool: dnsOk, Valid: true},
		SslOk:        pgtype.Bool{Bool: sslOk, Valid: true},
		ContentOk:    pgtype.Bool{Bool: true, Valid: true},
	})
	if err != nil {
		return nil, err
	}

	// ---------------------------
	// Update monitor status
	// ---------------------------
	_, err = h.store.UpdateMonitorStatus(ctx, db.UpdateMonitorStatusParams{
		ID: monitor.ID,
		Status: db.NullMonitorStatus{
			MonitorStatus: db.MonitorStatus(status),
			Valid:         true,
		},
	})
	if err != nil {
		return nil, err
	}

	return &TestURLResponse{
		Url:          monitor.Url,
		StatusCode:   statusCode,
		ResponseTime: responseTime,
		Status:       status,
		DnsOk:        dnsOk,
		SslOk:        sslOk,
		Error:        errorMsg,
	}, nil
}

package monitor

import (
	db "better-uptime/internal/db/sqlc"
	"context"
	"crypto/tls"
	"fmt"
	"net/http"
	"time"

	"github.com/jackc/pgx/v5/pgtype"
)



func (h *Handler) performMonitorCheck(ctx context.Context, monitor db.Monitor) (*TestURLResponse, error) {
	client := &http.Client{
		Timeout: 30 * time.Second,
		Transport: &http.Transport{
			TLSClientConfig: &tls.Config{
				InsecureSkipVerify: false,
			},
		},
	}

	start := time.Now()
	req, err := http.NewRequestWithContext(ctx, monitor.Method.String, monitor.Url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %v", err)
	}

	// Add common headers
	req.Header.Set("User-Agent", "BetterUptime-Monitor/1.0")
	req.Header.Set("Accept", "*/*")

	resp, err := client.Do(req)
	responseTime := time.Since(start).Seconds() * 1000 // in milliseconds

	var statusCode int32
	var status string = "down"
	var errorMsg string
	var dnsOk bool = true
	var sslOk bool = false
	var screenshotUrl string

	if err != nil {
		statusCode = 0
		status = "down"
		errorMsg = err.Error()
		dnsOk = false
	} else {
		defer resp.Body.Close()
		statusCode = int32(resp.StatusCode)

		// Check SSL
		if resp.TLS != nil && len(resp.TLS.PeerCertificates) > 0 {
			sslOk = true
		}

		if statusCode >= 200 && statusCode < 400 {
			status = "up"
		} else {
			status = "down"
			errorMsg = fmt.Sprintf("HTTP %d - %s", statusCode, http.StatusText(int(statusCode)))
		}
	}

	if status == "down" {
		screenshotUrl, err = h.TakeScreenshot(ctx, monitor)
		if err != nil {
			fmt.Printf("Failed to take screenshot: %v\n", err)
		}
	}

	// Save to monitor_logs
	_, err = h.store.CreateMonitorLog(ctx, db.CreateMonitorLogParams{
		MonitorID:    pgtype.Int4{Int32: monitor.ID, Valid: true},
		StatusCode:   pgtype.Int4{Int32: statusCode, Valid: true},
		ResponseTime: pgtype.Float8{Float64: responseTime, Valid: true},
		DnsOk:        pgtype.Bool{Bool: dnsOk, Valid: true},
		SslOk:        pgtype.Bool{Bool: sslOk, Valid: true},
		ContentOk:    pgtype.Bool{Bool: true, Valid: true}, // Basic content check
		ScreenshotUrl: pgtype.Text{String: screenshotUrl, Valid: screenshotUrl != ""},
	})
	if err != nil {
		fmt.Printf("Failed to create monitor log: %v\n", err)
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

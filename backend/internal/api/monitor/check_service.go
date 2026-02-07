package monitor

import (
	db "better-uptime/internal/db/sqlc"
	"context"
	"crypto/tls"
	"fmt"
	"net"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/jackc/pgx/v5/pgtype"
)

// ErrorType categorizes the type of monitoring error
type ErrorType string

const (
	ErrorNone              ErrorType = ""
	ErrorDNSFailed         ErrorType = "DNS_FAILED"
	ErrorConnectionRefused ErrorType = "CONNECTION_REFUSED"
	ErrorSSLError          ErrorType = "SSL_ERROR"
	ErrorTimeout           ErrorType = "TIMEOUT"
	ErrorHTTPError         ErrorType = "HTTP_ERROR"
	ErrorUnknown           ErrorType = "UNKNOWN_ERROR"
)

func (h *Handler) PerformMonitorCheck(
	ctx context.Context,
	monitor db.Monitor,
) (*TestURLResponse, error) {
	start := time.Now()

	// Parse the URL to get the host
	parsedURL, err := url.Parse(monitor.Url)
	if err != nil {
		return h.createErrorResponse(ctx, monitor, 0, 0, false, false, ErrorUnknown, fmt.Sprintf("Invalid URL: %s", err.Error()))
	}

	host := parsedURL.Hostname()
	isHTTPS := parsedURL.Scheme == "https"

	// Step 1: DNS Resolution Check

	dnsOk := true
	_, dnsErr := net.LookupHost(host)
	if dnsErr != nil {
		dnsOk = false
		responseTime := time.Since(start).Seconds() * 1000
		return h.createErrorResponse(ctx, monitor, 0, responseTime, false, false, ErrorDNSFailed,
			fmt.Sprintf("Domain does not exist or DNS lookup failed: %s", dnsErr.Error()))
	}


	// Step 2: SSL Certificate Check (for HTTPS)

	sslOk := true
	if isHTTPS {
		port := parsedURL.Port()
		if port == "" {
			port = "443"
		}
		conn, sslErr := tls.DialWithDialer(&net.Dialer{Timeout: 10 * time.Second}, "tcp", host+":"+port, &tls.Config{
			InsecureSkipVerify: false,
		})
		if sslErr != nil {
			sslOk = false
			// Don't fail entirely for SSL errors, but record it
			if strings.Contains(sslErr.Error(), "certificate") {
				responseTime := time.Since(start).Seconds() * 1000
				return h.createErrorResponse(ctx, monitor, 0, responseTime, true, false, ErrorSSLError,
					fmt.Sprintf("SSL certificate error: %s", sslErr.Error()))
			}
		} else {
			conn.Close()
		}
	} else {
		sslOk = false // HTTP doesn't have SSL
	}

	// -----------------------------------------
	// Step 3: HTTP Request
	// -----------------------------------------
	client := &http.Client{
		Timeout: 30 * time.Second,
		CheckRedirect: func(req *http.Request, via []*http.Request) error {
			// Allow up to 10 redirects
			if len(via) >= 10 {
				return fmt.Errorf("too many redirects")
			}
			return nil
		},
	}

	req, err := http.NewRequestWithContext(
		ctx,
		monitor.Method.String,
		monitor.Url,
		nil,
	)
	if err != nil {
		responseTime := time.Since(start).Seconds() * 1000
		return h.createErrorResponse(ctx, monitor, 0, responseTime, dnsOk, sslOk, ErrorUnknown,
			fmt.Sprintf("Failed to create request: %s", err.Error()))
	}

	// Add common headers
	req.Header.Set("User-Agent", "BetterUptime/1.0")

	resp, httpErr := client.Do(req)
	responseTime := time.Since(start).Seconds() * 1000

	var statusCode int32
	var status string
	var errorMsg string
	var errorType ErrorType

	if httpErr != nil {
		statusCode = 0
		status = "down"

		// Categorize the error
		if strings.Contains(httpErr.Error(), "connection refused") {
			errorType = ErrorConnectionRefused
			errorMsg = "Connection refused - server is not accepting connections"
		} else if strings.Contains(httpErr.Error(), "timeout") || strings.Contains(httpErr.Error(), "deadline exceeded") {
			errorType = ErrorTimeout
			errorMsg = "Request timed out - server did not respond in time"
		} else if strings.Contains(httpErr.Error(), "no such host") {
			errorType = ErrorDNSFailed
			errorMsg = "Domain does not exist"
		} else {
			errorType = ErrorUnknown
			errorMsg = httpErr.Error()
		}
	} else {
		defer resp.Body.Close()
		statusCode = int32(resp.StatusCode)

		if statusCode >= 200 && statusCode < 400 {
			status = "up"
			errorType = ErrorNone
			errorMsg = ""
		} else {
			status = "down"
			errorType = ErrorHTTPError
			errorMsg = fmt.Sprintf("HTTP %d - %s", statusCode, http.StatusText(int(statusCode)))
		}
	}

	// -----------------------------------------
	// Step 4: Save log
	// -----------------------------------------
	_, err = h.store.CreateMonitorLog(ctx, db.CreateMonitorLogParams{
		MonitorID:    pgtype.Int4{Int32: monitor.ID, Valid: true},
		StatusCode:   pgtype.Int4{Int32: statusCode, Valid: true},
		ResponseTime: pgtype.Float8{Float64: responseTime, Valid: true},
		DnsOk:        pgtype.Bool{Bool: dnsOk, Valid: true},
		SslOk:        pgtype.Bool{Bool: sslOk, Valid: true},
		ContentOk:    pgtype.Bool{Bool: status == "up", Valid: true},
	})
	if err != nil {
		return nil, err
	}

	// -----------------------------------------
	// Step 5: Update monitor status and check for status change
	// -----------------------------------------
	previousStatus := string(monitor.Status.MonitorStatus)

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

	// -----------------------------------------
	// Step 6: Create alert if status changed to "down"
	// -----------------------------------------
	if status == "down" && previousStatus != "down" && previousStatus != "" {
		// Create an alert for the status change
		_, alertErr := h.store.CreateAlert(ctx, db.CreateAlertParams{
			MonitorID: pgtype.Int4{Int32: monitor.ID, Valid: true},
			AlertType: "down",
			Message:   fmt.Sprintf("Monitor %s is now DOWN. %s: %s", monitor.Url, errorType, errorMsg),
		})
		if alertErr != nil {
			// Log the error but don't fail the check
			fmt.Printf("Failed to create alert: %v\n", alertErr)
		}

		// Update the monitor's alert state
		h.store.UpdateMonitorAlertState(ctx, db.UpdateMonitorAlertStateParams{
			ID: monitor.ID,
			LastStatus: db.NullMonitorStatus{
				MonitorStatus: db.MonitorStatus(status),
				Valid:         true,
			},
			LastAlertSentAt: pgtype.Timestamp{Time: time.Now(), Valid: true},
		})
	}

	// Create alert when service comes back up
	if status == "up" && previousStatus == "down" {
		_, alertErr := h.store.CreateAlert(ctx, db.CreateAlertParams{
			MonitorID: pgtype.Int4{Int32: monitor.ID, Valid: true},
			AlertType: "up",
			Message:   fmt.Sprintf("Monitor %s is now UP. Status Code: %d, Response Time: %.0fms", monitor.Url, statusCode, responseTime),
		})
		if alertErr != nil {
			fmt.Printf("Failed to create recovery alert: %v\n", alertErr)
		}
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

// createErrorResponse is a helper to create error responses and log them
func (h *Handler) createErrorResponse(
	ctx context.Context,
	monitor db.Monitor,
	statusCode int32,
	responseTime float64,
	dnsOk, sslOk bool,
	errorType ErrorType,
	errorMsg string,
) (*TestURLResponse, error) {
	status := "down"

	// Save log
	_, err := h.store.CreateMonitorLog(ctx, db.CreateMonitorLogParams{
		MonitorID:    pgtype.Int4{Int32: monitor.ID, Valid: true},
		StatusCode:   pgtype.Int4{Int32: statusCode, Valid: true},
		ResponseTime: pgtype.Float8{Float64: responseTime, Valid: true},
		DnsOk:        pgtype.Bool{Bool: dnsOk, Valid: true},
		SslOk:        pgtype.Bool{Bool: sslOk, Valid: true},
		ContentOk:    pgtype.Bool{Bool: false, Valid: true},
	})
	if err != nil {
		return nil, err
	}

	// Update monitor status
	previousStatus := string(monitor.Status.MonitorStatus)
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

	// Create alert if status changed
	if previousStatus != "down" && previousStatus != "" {
		_, alertErr := h.store.CreateAlert(ctx, db.CreateAlertParams{
			MonitorID: pgtype.Int4{Int32: monitor.ID, Valid: true},
			AlertType: "down",
			Message:   fmt.Sprintf("Monitor %s is DOWN. %s: %s", monitor.Url, errorType, errorMsg),
		})
		if alertErr != nil {
			fmt.Printf("Failed to create alert: %v\n", alertErr)
		}
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

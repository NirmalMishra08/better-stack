package monitor

import (
	"better-uptime/common/middleware"
	"better-uptime/common/util"
	db "better-uptime/internal/db/sqlc"
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/jackc/pgx/v5/pgtype"
)

func (h *Handler) CheckSingleMonitor(ctx context.Context, monitor db.Monitor) error {
	client := &http.Client{Timeout: 30 * time.Second}

	start := time.Now()
	resp, err := client.Get(monitor.Url)
	responseTime := time.Since(start).Seconds()

	var statusCode int32
	status := "down"

	if err != nil {
		statusCode = int32(resp.StatusCode)
	} else {
		defer resp.Body.Close()
		statusCode = int32(resp.StatusCode)
		if statusCode >= 200 && statusCode < 400 {
			status = "up"
		}
	}

	// Save log entry
	_, err = h.store.CreateMonitorLog(ctx, db.CreateMonitorLogParams{
		MonitorID:    pgtype.Int4{Int32: monitor.ID, Valid: true},
		StatusCode:   pgtype.Int4{Int32: statusCode, Valid: true},
		ResponseTime: pgtype.Float8{Float64: responseTime, Valid: true},
		DnsOk:        pgtype.Bool{Bool: (err == nil), Valid: true},
		SslOk:        pgtype.Bool{Bool: true, Valid: true},
		ContentOk:    pgtype.Bool{Bool: true, Valid: true},
	})
	if err != nil {
		return err
	}

	// Update monitor status
	_, err = h.store.UpdateMonitor(ctx, db.UpdateMonitorParams{
		ID:       monitor.ID,
		Url:      monitor.Url,
		Method:   monitor.Method,
		Type:     monitor.Type,
		Interval: monitor.Interval,
		Status:   db.NullMonitorStatus{MonitorStatus: db.MonitorStatus(status), Valid: true},
		IsActive: monitor.IsActive,
		UserID:   monitor.UserID,
	})
	if err != nil {
		return err
	}

	return nil
}

func (h *Handler) CheckAllActiveMonitors(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	payload, err := middleware.GetFirebasePayloadFromContext(ctx)
	if err != nil {
		util.ErrorJson(w, util.ErrUnauthorized)
		return
	}
	userId := payload.UserId

	monitors, err := h.store.GetActiveMonitors(ctx, pgtype.UUID{Bytes: userId, Valid: true})
	if err != nil {
		util.ErrorJson(w, err)
		return
	}

	for _, monitor := range monitors {
		// Only check monitors belonging to this user
		if monitor.UserID.Bytes != userId {
			continue
		}

		go func(m db.Monitor) {
			if err := h.CheckSingleMonitor(ctx, m); err != nil {
				// Optional: log internally (not to user)
				util.ErrorJson(w, fmt.Errorf("failed to check monitor %d: %w", m.ID, err))
			}
		}(monitor)
	}

	util.WriteJson(w, http.StatusOK, map[string]interface{}{
		"message":       "Active monitors check started",
		"monitor_count": len(monitors),
		"timestamp":     time.Now().Format(time.RFC3339),
	})
}

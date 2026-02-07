package analytics

import (
	"better-uptime/common/middleware"
	"better-uptime/common/util"
	db "better-uptime/internal/db/sqlc"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/jackc/pgx/v5/pgtype"
)

type OverviewResponse struct {
	TotalMonitors   int     `json:"total_monitors"`
	ActiveMonitors  int     `json:"active_monitors"`
	UptimePercent   float64 `json:"uptime_percent"`
	AvgResponseTime float64 `json:"avg_response_time"`
	AlertsToday     int     `json:"alerts_today"`
	MonitorsUp      int     `json:"monitors_up"`
	MonitorsDown    int     `json:"monitors_down"`
}

// GetOverview returns aggregated analytics for the user's dashboard
func (h *Handler) GetOverview(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	payload, err := middleware.GetFirebasePayloadFromContext(ctx)
	if err != nil {
		util.ErrorJson(w, util.ErrUnauthorized)
		return
	}
	userId := payload.UserId

	// Get all monitors for this user
	monitors, err := h.store.GetUserMonitors(ctx, pgtype.UUID{Bytes: userId, Valid: true})
	if err != nil {
		util.ErrorJson(w, err)
		return
	}

	totalMonitors := len(monitors)
	activeMonitors := 0
	monitorsUp := 0
	monitorsDown := 0

	var totalUptime float64
	var totalResponseTime float64
	monitorsWithData := 0

	now := time.Now()

	for _, m := range monitors {
		// Count active monitors
		if m.IsActive.Bool {
			activeMonitors++
		}

		// Count up/down status
		if m.Status.MonitorStatus == "up" {
			monitorsUp++
		} else if m.Status.MonitorStatus == "down" {
			monitorsDown++
		}

		// Get recent logs for this monitor to calculate stats
		logs, err := h.store.GetMonitorLogs(ctx, db.GetMonitorLogsParams{
			MonitorID: pgtype.Int4{Int32: m.ID, Valid: true},
			Limit:     100,
		})
		if err != nil || len(logs) == 0 {
			continue
		}

		// Calculate stats from logs (same logic as monitor handler)
		var monitorResponseTime float64
		var successfulChecks int64
		var responseTimeCount int64

		for _, log := range logs {
			if log.ResponseTime.Valid && log.ResponseTime.Float64 > 0 {
				monitorResponseTime += log.ResponseTime.Float64
				responseTimeCount++
			}
			if log.StatusCode.Valid && log.StatusCode.Int32 >= 200 && log.StatusCode.Int32 < 400 {
				successfulChecks++
			}
		}

		if len(logs) > 0 {
			monitorUptime := float64(successfulChecks) / float64(len(logs)) * 100
			totalUptime += monitorUptime
			monitorsWithData++
			fmt.Printf("Monitor %d: uptime=%.2f%%, checks=%d\n", m.ID, monitorUptime, len(logs))
		}

		if responseTimeCount > 0 {
			avgResp := monitorResponseTime / float64(responseTimeCount)
			totalResponseTime += avgResp
			fmt.Printf("Monitor %d: avg_response=%.2fms\n", m.ID, avgResp)
		}
	}

	// Calculate averages
	avgUptime := 0.0
	avgResponseTime := 0.0
	if monitorsWithData > 0 {
		avgUptime = totalUptime / float64(monitorsWithData)
		avgResponseTime = totalResponseTime / float64(monitorsWithData)
	}
	fmt.Printf("Analytics: monitors=%d, withData=%d, avgUptime=%.2f%%, avgResponse=%.2fms\n",
		totalMonitors, monitorsWithData, avgUptime, avgResponseTime)

	// Get today's alerts count
	today := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
	alerts, err := h.store.GetRecentAlerts(ctx, db.GetRecentAlertsParams{
		UserID: pgtype.UUID{Bytes: userId, Valid: true},
		Limit:  100,
	})
	alertsToday := 0
	if err == nil {
		for _, a := range alerts {
			if a.CreatedAt.Valid && a.CreatedAt.Time.After(today) {
				alertsToday++
			}
		}
	}

	response := OverviewResponse{
		TotalMonitors:   totalMonitors,
		ActiveMonitors:  activeMonitors,
		UptimePercent:   avgUptime,
		AvgResponseTime: avgResponseTime,
		AlertsToday:     alertsToday,
		MonitorsUp:      monitorsUp,
		MonitorsDown:    monitorsDown,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

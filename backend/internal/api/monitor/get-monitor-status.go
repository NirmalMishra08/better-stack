package monitor

import (
	"better-uptime/common/middleware"
	"better-uptime/common/util"
	db "better-uptime/internal/db/sqlc"
	"fmt"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

type MonitorStatusResponse struct {
	Monitor *db.Monitor     `json:"monitor"`
	Logs    []db.MonitorLog `json:"logs"`
	Stats   *MonitorStats   `json:"stats"`
}

type MonitorStats struct {
	UptimePercentage float64 `json:"uptime_percentage"`
	AvgResponseTime  float64 `json:"avg_response_time"`
	TotalChecks      int64   `json:"total_checks"`
	Last24HUp        int64   `json:"last_24h_up"`
	Last24HDown      int64   `json:"last_24h_down"`
}

func (h *Handler) GetMonitorStatus(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	payload, err := middleware.GetFirebasePayloadFromContext(ctx)
	if err != nil {
		util.ErrorJson(w, util.ErrUnauthorized)
		return
	}

	monitorIDStr := chi.URLParam(r, "id")
	monitorID, err := strconv.ParseInt(monitorIDStr, 10, 32)
	if err != nil {
		util.ErrorJson(w, util.ErrNotValidRequest)
		return
	}

	// Get monitor
	monitor, err := h.store.GetMonitorByID(ctx, db.GetMonitorByIDParams{
		ID:     int32(monitorID),
		UserID: pgtype.UUID{Bytes: payload.UserId, Valid: true},
	})
	if err != nil {
		util.ErrorJson(w, fmt.Errorf("monitor not found: %v", err))
		return
	}

	// Get recent logs
	logs, err := h.store.GetMonitorLogs(ctx, db.GetMonitorLogsParams{
		MonitorID: pgtype.Int4{Int32: monitor.ID, Valid: true},
		Limit:     50,
	})
	if err != nil {
		util.ErrorJson(w, fmt.Errorf("failed to get monitor logs: %v", err))
		return
	}

	// Calculate basic stats
	stats := h.calculateMonitorStats(logs)

	response := MonitorStatusResponse{
		Monitor: &monitor,
		Logs:    logs,
		Stats:   stats,
	}

	util.WriteJson(w, http.StatusOK, response)
}

func (h *Handler) calculateMonitorStats(logs []db.MonitorLog) *MonitorStats {
	if len(logs) == 0 {
		return &MonitorStats{}
	}

	var totalResponseTime float64
	var successfulChecks int64
	var responseTimeCount int64

	for _, log := range logs {
		if log.ResponseTime.Valid && log.ResponseTime.Float64 > 0 {
			totalResponseTime += log.ResponseTime.Float64
			responseTimeCount++
		}
		if log.StatusCode.Valid && log.StatusCode.Int32 >= 200 && log.StatusCode.Int32 < 400 {
			successfulChecks++
		}
	}

	uptimePercentage := 0.0
	if len(logs) > 0 {
		uptimePercentage = float64(successfulChecks) / float64(len(logs)) * 100
	}

	avgResponseTime := 0.0
	if responseTimeCount > 0 {
		avgResponseTime = totalResponseTime / float64(responseTimeCount)
	}

	return &MonitorStats{
		UptimePercentage: uptimePercentage,
		AvgResponseTime:  avgResponseTime,
		TotalChecks:      int64(len(logs)),
		Last24HUp:        successfulChecks,
		Last24HDown:      int64(len(logs)) - successfulChecks,
	}
}

package monitor

import (
	"better-uptime/common/middleware"
	"better-uptime/common/util"
	"fmt"
	"net/http"
	"time"

	"github.com/jackc/pgx/v5/pgtype"
)

type MonitorStatsResponse struct {
	ID               int32   `json:"id"`
	UserID           string  `json:"user_id"`
	Url              string  `json:"url"`
	Type             string  `json:"type"`
	Interval         int32   `json:"interval"`
	Status           string  `json:"status"`
	IsActive         bool    `json:"is_active"`
	AvgResponseTime  string  `json:"avg_response_time"` // "123ms"
	UptimePercentage string  `json:"uptime_percentage"` // "99.9%"
	LastCheck        string  `json:"last_check"`        // "2h ago" or ISO/UTC
}

func (h *Handler) GetUserMonitorsWithStats(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	payload, err := middleware.GetFirebasePayloadFromContext(ctx)
	if err != nil {
		util.ErrorJson(w, util.ErrUnauthorized)
		return
	}
	userId := payload.UserId

	monitors, err := h.store.GetUserMonitorsWithStats(ctx, pgtype.UUID{Bytes: userId, Valid: true})
	if err != nil {
		util.ErrorJson(w, err)
		return
	}

	response := make([]MonitorStatsResponse, len(monitors))
	for i, m := range monitors {
		uptime := "—"
		if m.TotalChecks > 0 {
			val := (float64(m.SuccessfulChecks) / float64(m.TotalChecks)) * 100
			uptime = fmt.Sprintf("%.1f%%", val)
		}

		lastCheck := "Never"
		if m.LastCheck != nil {
			// Type assertion for LastCheck
			// Depending on driver, it might be time.Time
			if t, ok := m.LastCheck.(time.Time); ok {
				lastCheck = t.Format(time.RFC3339)
			} else if tPtr, ok := m.LastCheck.(*time.Time); ok && tPtr != nil {
				lastCheck = tPtr.Format(time.RFC3339)
			} else if pgTs, ok := m.LastCheck.(pgtype.Timestamp); ok && pgTs.Valid {
				lastCheck = pgTs.Time.Format(time.RFC3339)
			}
		}

		status := "unknown"
		if m.Status.Valid {
			status = string(m.Status.MonitorStatus)
		}

		isActive := false
		if m.IsActive.Valid {
			isActive = m.IsActive.Bool
		}

		monitorType := "HTTP"
		if m.Type.Valid {
			monitorType = m.Type.String
		}
		
		avgResponse := "0ms"
		if m.AvgResponseTime > 0 {
			avgResponse = fmt.Sprintf("%.0fms", m.AvgResponseTime)
		}

		// Inline UUID to String conversion
		src := m.UserID.Bytes
		userIDStr := fmt.Sprintf("%x-%x-%x-%x-%x", src[0:4], src[4:6], src[6:8], src[8:10], src[10:16])

		response[i] = MonitorStatsResponse{
			ID:               m.ID,
			UserID:           userIDStr,
			Url:              m.Url,
			Type:             monitorType,
			Interval:         m.Interval,
			Status:           status,
			IsActive:         isActive,
			AvgResponseTime:  avgResponse,
			UptimePercentage: uptime,
			LastCheck:        lastCheck,
		}
	}

	util.WriteJson(w, http.StatusOK, response)
}

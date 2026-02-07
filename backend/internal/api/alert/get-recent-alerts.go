package alert

import (
	"better-uptime/common/middleware"
	"better-uptime/common/util"
	db "better-uptime/internal/db/sqlc"
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/jackc/pgx/v5/pgtype"
)

// GetRecentAlerts returns the user's recent alerts
func (h *Handler) GetRecentAlerts(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	payload, err := middleware.GetFirebasePayloadFromContext(ctx)
	if err != nil {
		util.ErrorJson(w, util.ErrUnauthorized)
		return
	}
	userId := payload.UserId

	// Get limit from query params, default to 50
	limit := int32(50)
	if limitStr := r.URL.Query().Get("limit"); limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 && l <= 100 {
			limit = int32(l)
		}
	}

	alerts, err := h.store.GetRecentAlerts(ctx, db.GetRecentAlertsParams{
		UserID: pgtype.UUID{Bytes: userId, Valid: true},
		Limit:  limit,
	})
	if err != nil {
		util.ErrorJson(w, err)
		return
	}

	// Transform to response format
	type AlertResponse struct {
		ID        int32  `json:"id"`
		MonitorID int32  `json:"monitor_id"`
		URL       string `json:"url"`
		Type      string `json:"type"`
		Message   string `json:"message"`
		Timestamp string `json:"timestamp"`
		Status    string `json:"status"`
	}

	response := make([]AlertResponse, 0, len(alerts))
	for _, a := range alerts {
		timestamp := ""
		if a.SentAt.Valid {
			timestamp = a.SentAt.Time.Format("2006-01-02T15:04:05Z")
		} else if a.CreatedAt.Valid {
			timestamp = a.CreatedAt.Time.Format("2006-01-02T15:04:05Z")
		}

		response = append(response, AlertResponse{
			ID:        a.ID,
			MonitorID: a.MonitorID.Int32,
			URL:       a.Url,
			Type:      a.AlertType,
			Message:   a.Message,
			Timestamp: timestamp,
			Status:    "resolved",
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

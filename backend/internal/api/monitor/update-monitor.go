package monitor

import (
	"better-uptime/common/middleware"
	"better-uptime/common/util"
	db "better-uptime/internal/db/sqlc"
	"fmt"
	"net/http"

	"github.com/jackc/pgx/v5/pgtype"
)

type UpdateMonitorRequest struct {
	ID       int64  `json:"id" validate:"required"`
	Url      string `json:"url" validate:"required,url"`
	Method   string `json:"method"`
	Type     string `json:"type"`
	Interval int32  `json:"interval" validate:"min=1"`
}

func (h *Handler) UpdateMonitor(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	payload, err := middleware.GetFirebasePayloadFromContext(ctx)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	userId := payload.UserId

	var req UpdateMonitorRequest
	if err := util.ReadJsonAndValidate(w, r, &req); err != nil {
		util.ErrorJson(w, err)
		return
	}

	existing, err := h.store.GetMonitorByID(ctx, db.GetMonitorByIDParams{
		ID:     int32(req.ID),
		UserID: pgtype.UUID{Bytes: userId, Valid: true},
	})
	if err != nil {
		util.ErrorJson(w, fmt.Errorf("not found this monitor"))
		return
	}

	monitor, err := h.store.UpdateMonitor(ctx, db.UpdateMonitorParams{
		ID:       int32(req.ID),
		UserID:   pgtype.UUID{Bytes: userId, Valid: true},
		Url:      req.Url,
		Method:   pgtype.Text{String: req.Method, Valid: req.Method != ""},
		Type:     pgtype.Text{String: req.Type, Valid: req.Type != ""},
		Interval: int32(req.Interval),
		Status:   existing.Status,  
		IsActive: existing.IsActive, 
	})
	if err != nil {
		util.ErrorJson(w, err)
		return
	}

	util.WriteJson(w, http.StatusOK, monitor)
}

package monitor

import (
	"better-uptime/common/middleware"
	"better-uptime/common/util"
	db "better-uptime/internal/db/sqlc"
	"net/http"

	"github.com/jackc/pgx/v5/pgtype"
)

type ToggleMonitorParams struct {
	ID       int32
	UserID   string
	IsActive bool
}

type ToggleMonitorRequest struct {
	ID       int64 `json:"id" validate:"required"`
	IsActive bool  `json:"is_active" validate:"required"`
}

func (h *Handler) ToggleMonitor(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	payload, err := middleware.GetFirebasePayloadFromContext(ctx)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	userId := payload.UserId

	var req ToggleMonitorRequest
	if err := util.ReadJsonAndValidate(w, r, &req); err != nil {
		util.ErrorJson(w, util.ErrNotValidRequest)
		return
	}

	monitor, err := h.store.ToggleMonitor(ctx, db.ToggleMonitorParams{
		ID:       int32(req.ID),
		UserID:   pgtype.UUID{Bytes: userId, Valid: true},
		IsActive: pgtype.Bool{Bool: req.IsActive, Valid: true},
	})
	if err != nil {
		util.ErrorJson(w, err)
		return
	}

	util.WriteJson(w, http.StatusOK, monitor)

}

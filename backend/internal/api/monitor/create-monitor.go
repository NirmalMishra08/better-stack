package monitor

import (
	"better-uptime/common/middleware"
	"better-uptime/common/util"
	db "better-uptime/internal/db/sqlc"
	"net/http"

	"github.com/jackc/pgx/v5/pgtype"
)

func (h *Handler) CreateMonitor(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	payload, err := middleware.GetFirebasePayloadFromContext(ctx)
	if err != nil {
		util.ErrorJson(w, util.ErrUnauthorized)
		return
	}
	userId := payload.UserId

	var req CreateMonitorRequest
	if err := util.ReadJsonAndValidate(w, r, &req); err != nil {
		util.ErrorJson(w, util.ErrNotValidRequest)
		return
	}
	monitor, err := h.store.CreateMonitor(ctx, db.CreateMonitorParams{
		UserID:   pgtype.UUID{Bytes: userId, Valid: true},
		Url:      req.Url,
		Method:   req.Method,
		Type:     req.Type,
		Interval: req.Interval,
		Status:   db.NullMonitorStatus{MonitorStatus: db.MonitorStatus(req.Status), Valid: true},
		IsActive: req.IsActive,
	})
	if err != nil {
		util.ErrorJson(w, err)
		return
	}
	util.WriteJson(w, http.StatusOK, monitor)
}

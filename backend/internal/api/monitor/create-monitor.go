package monitor

import (
	"better-uptime/common/middleware"
	"better-uptime/common/util"
	db "better-uptime/internal/db/sqlc"
	"fmt"
	"net/http"

	"github.com/jackc/pgx/v5/pgtype"
)

type CreateMonitorResponse struct {
	Monitor    *db.Monitor      `json:"monitor"`
	FirstCheck *TestURLResponse `json:"first_check,omitempty"`
	Message    string           `json:"message"`
}

func (h *Handler) CreateMonitor(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	payload, err := middleware.GetFirebasePayloadFromContext(ctx)
	if err != nil {
		util.ErrorJson(w, util.ErrUnauthorized)
		return
	}
	userId := payload.UserId
	fmt.Printf("userId: %v\n", userId)

	var req CreateMonitorRequest
	if err := util.ReadJsonAndValidate(w, r, &req); err != nil {
		util.ErrorJson(w, util.ErrNotValidRequest)
		return
	}

	// Check if a monitor with the same URL already exists for this user
	existingMonitor, err := h.store.GetMonitorByIdandURL(ctx, db.GetMonitorByIdandURLParams{
		UserID: pgtype.UUID{Bytes: userId, Valid: true},
		Url:    req.Url,
	})
	if err == nil && existingMonitor.ID != 0 {
		util.ErrorJson(w, fmt.Errorf("a monitor with the same URL already exists"))
		return
	}

	monitor, err := h.store.CreateMonitor(ctx, db.CreateMonitorParams{
		UserID:   pgtype.UUID{Bytes: userId, Valid: true},
		Url:      req.Url,
		Method:   pgtype.Text{String: req.Method, Valid: true},
		Type:     pgtype.Text{String: req.Type, Valid: true},
		Interval: req.Interval,
		Status:   db.NullMonitorStatus{MonitorStatus: db.MonitorStatus(req.Status), Valid: true},
		IsActive: util.ToPgBool(req.IsActive),
	})
	if err != nil {
		util.ErrorJson(w, err)
		return
	}

	checkResult, err := h.PerformMonitorCheck(ctx,monitor)
	if err != nil {
		// Monitor created but check failed
		response := CreateMonitorResponse{
			Monitor: &monitor,
			Message: "Monitor created but initial check failed",
		}
		util.WriteJson(w, http.StatusCreated, response)
		return
	}

	_, err = h.store.UpdateMonitorStatus(ctx, db.UpdateMonitorStatusParams{
		ID:     monitor.ID,
		Status: db.NullMonitorStatus{MonitorStatus: db.MonitorStatus(checkResult.Status), Valid: true},
	})

	if err != nil {
		fmt.Printf("Failed to update monitor status: %v\n", err)
	}

	response := CreateMonitorResponse{
		Monitor:    &monitor,
		FirstCheck: checkResult,
		Message:    "Monitor created and initial check completed",
	}

	util.WriteJson(w, http.StatusCreated, response)
}

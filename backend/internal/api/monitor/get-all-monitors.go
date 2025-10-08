package monitor

import (
	"better-uptime/common/middleware"
	"better-uptime/common/util"
	"errors"
	"net/http"

	"github.com/jackc/pgx/v5/pgtype"
)

func (h *Handler) GetAllMonitors(w http.ResponseWriter, r *http.Request) {

	ctx := r.Context()

	payload, err := middleware.GetFirebasePayloadFromContext(ctx)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	userId := payload.UserId

	// Fetch the monitor from the database
	monitors, err := h.store.GetUserMonitors(ctx, pgtype.UUID{Bytes: userId, Valid: true})
	if err != nil {
		util.ErrorJson(w, errors.New("monitor not found"))
		return
	}

	util.WriteJson(w, http.StatusOK, monitors)
}

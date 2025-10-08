package monitor

import (
	"better-uptime/common/middleware"
	"better-uptime/common/util"
	db "better-uptime/internal/db/sqlc"
	"errors"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

func (h *Handler) DeleteMonitor(w http.ResponseWriter, r *http.Request) {

	ctx := r.Context()

	payload, err := middleware.GetFirebasePayloadFromContext(ctx)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	userId := payload.UserId

	monitorIdStr := chi.URLParam(r, "id")
	if monitorIdStr == "" {
		http.Error(w, "Monitor ID is required", http.StatusBadRequest)
		return
	}
	// Convert monitorIdStr to int32
	monitorIdInt, err := strconv.Atoi(monitorIdStr)
	if err != nil {
		http.Error(w, "Invalid Monitor ID", http.StatusBadRequest)
		return
	}
	monitorId := int32(monitorIdInt)

	// Fetch the monitor from the database
	err = h.store.DeleteMonitor(ctx, db.DeleteMonitorParams{
		ID:     monitorId,
		UserID: pgtype.UUID{Bytes: userId, Valid: true},
	})
	if err != nil {
		util.ErrorJson(w, errors.New("could not delete monitor"))
		return
	}

	util.WriteJson(w, http.StatusOK, map[string]string{"message": "Monitor deleted successfully"})
}

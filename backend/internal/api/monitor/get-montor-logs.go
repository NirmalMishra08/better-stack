package monitor

import (
	"better-uptime/common/middleware"
	"better-uptime/common/util"
	db "better-uptime/internal/db/sqlc"
	"errors"
	"net/http"
	"strconv"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

func (h *Handler) GetMonitorLogs(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	// payload
	payload, err := middleware.GetFirebasePayloadFromContext(ctx)
	if err != nil {
		util.ErrorJson(w, util.ErrUnauthorized)
	}

	userId := payload.UserId

	monitorIdStr := chi.URLParam(r, "id")

	monitorId, err := strconv.ParseInt(monitorIdStr, 10, 32)
	if err != nil {
		util.ErrorJson(w, util.ErrNotValidRequest)
		return
	}

	monitorID := int32(monitorId)

	monitor, err := h.store.GetMonitorByID(ctx, db.GetMonitorByIDParams{
		ID:     monitorID,
		UserID: pgtype.UUID{Bytes: userId, Valid: true},
	})
	if err != nil {
		util.ErrorJson(w, errors.New("new error occured"))
		return
	}
	if monitor.UserID.Bytes != userId {
		util.ErrorJson(w, util.ErrUnauthorized)
		return
	}

	limit := int32(20)
	if l := r.URL.Query().Get("limit"); l != "" {
		if parsed, err := strconv.Atoi(l); err == nil {
			limit = int32(parsed)
		}
	}

	offset := int32(0)
	if o := r.URL.Query().Get("offset"); o != "" {
		if parsed, err := strconv.ParseInt(o, 10, 32); err == nil {
			offset = int32(parsed)
		}
	}

	fromParam := r.URL.Query().Get("from")
	toParam := r.URL.Query().Get("to")

	var fromTS, toTS pgtype.Timestamp

	if fromParam != "" {
		if t, err := time.Parse("2006-01-02", fromParam); err == nil {
			fromTS = pgtype.Timestamp{Time: t, Valid: true}
		}
	}

	if toParam != "" {
		if t, err := time.Parse("2006-01-02", toParam); err == nil {
			toTS = pgtype.Timestamp{Time: t, Valid: true}
		}
	}

	logs, err := h.store.GetMonitorLogs(ctx, db.GetMonitorLogsParams{
		MonitorID: pgtype.Int4{Int32: monitorID, Valid: true},
		Column2:   fromTS,
		Column3:   toTS,
		Limit:     limit,
		Offset:    offset,
	})
	if err != nil {
		util.ErrorJson(w, err)
		return
	}

	totalCount, err := h.store.CountMonitorLogs(ctx, db.CountMonitorLogsParams{
		MonitorID: pgtype.Int4{Int32: monitorID, Valid: true},
		Column2:   fromTS,
		Column3:   toTS,
	})
	if err != nil {
		util.ErrorJson(w, err)
		return
	}

	var count int64
	if len(totalCount) > 0 {
		count = totalCount[0]
	}

	hasMore := (int64(offset) + int64(limit)) < count

	resp := map[string]any{
		"logs": logs,
		"pageination": map[string]any{
			"limit":   limit,
			"offset":  offset,
			"total":   totalCount,
			"hasMore": hasMore,
		},
	}

	util.WriteJson(w, http.StatusOK, resp)

}

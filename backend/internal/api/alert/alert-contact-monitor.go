package alert

import (
	db "better-uptime/internal/db/sqlc"
	"context"

	"github.com/jackc/pgx/v5/pgtype"
)

func ( h *Handler) GetAlertContactsForMonitor(ctx context.Context,monitorID int32)([]db.AlertContact , error ){
	return h.store.GetAlertContactsByMonitor(ctx,pgtype.Int4{Int32:monitorID,Valid:true})
}

func ( h *Handler)CheckAndSendAlerts(ctx context.Context,monitor db.Monitor,checkResult *TestURLResponse)(error){

}

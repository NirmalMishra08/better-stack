package alert

import (
	"better-uptime/common/middleware"
	"better-uptime/common/util"
	"encoding/json"
	"net/http"

	"github.com/jackc/pgx/v5/pgtype"
)

// GetAlertContacts returns the user's alert contacts
func (h *Handler) GetAlertContacts(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	payload, err := middleware.GetFirebasePayloadFromContext(ctx)
	if err != nil {
		util.ErrorJson(w, util.ErrUnauthorized)
		return
	}
	userId := payload.UserId

	contacts, err := h.store.GetAlertContactsByUserID(ctx, pgtype.UUID{Bytes: userId, Valid: true})
	if err != nil {
		util.ErrorJson(w, err)
		return
	}

	// Transform to response format
	type ContactResponse struct {
		ID         int32  `json:"id"`
		Name       string `json:"name"`
		Email      string `json:"email"`
		IsVerified bool   `json:"is_verified"`
		CreatedAt  string `json:"created_at"`
	}

	response := make([]ContactResponse, 0, len(contacts))
	for _, c := range contacts {
		createdAt := ""
		if c.CreatedAt.Valid {
			createdAt = c.CreatedAt.Time.Format("2006-01-02T15:04:05Z")
		}

		response = append(response, ContactResponse{
			ID:         c.ID,
			Name:       c.Name,
			Email:      c.Email,
			IsVerified: c.IsVerified.Bool,
			CreatedAt:  createdAt,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

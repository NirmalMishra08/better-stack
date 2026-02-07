package alert

import (
	"better-uptime/common/middleware"
	"better-uptime/common/util"
	db "better-uptime/internal/db/sqlc"
	"encoding/json"
	"net/http"

	"github.com/jackc/pgx/v5/pgtype"
)

type CreateAlertContactRequest struct {
	Name  string `json:"name"`
	Email string `json:"email"`
}

// CreateAlertContact creates a new alert contact for the user
func (h *Handler) CreateAlertContact(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	payload, err := middleware.GetFirebasePayloadFromContext(ctx)
	if err != nil {
		util.ErrorJson(w, util.ErrUnauthorized)
		return
	}
	userId := payload.UserId

	var req CreateAlertContactRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		util.ErrorJson(w, util.ErrNotValidRequest)
		return
	}

	if req.Name == "" || req.Email == "" {
		util.ErrorJson(w, util.ErrNotValidRequest)
		return
	}

	contact, err := h.store.CreateAlertContact(ctx, db.CreateAlertContactParams{
		UserID: pgtype.UUID{Bytes: userId, Valid: true},
		Name:   req.Name,
		Email:  req.Email,
	})
	if err != nil {
		util.ErrorJson(w, err)
		return
	}

	// Response format
	type ContactResponse struct {
		ID         int32  `json:"id"`
		Name       string `json:"name"`
		Email      string `json:"email"`
		IsVerified bool   `json:"is_verified"`
		CreatedAt  string `json:"created_at"`
	}

	createdAt := ""
	if contact.CreatedAt.Valid {
		createdAt = contact.CreatedAt.Time.Format("2006-01-02T15:04:05Z")
	}

	response := ContactResponse{
		ID:         contact.ID,
		Name:       contact.Name,
		Email:      contact.Email,
		IsVerified: contact.IsVerified.Bool,
		CreatedAt:  createdAt,
	}

	util.WriteJson(w, http.StatusCreated, response)
}

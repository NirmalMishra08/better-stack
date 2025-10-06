package auth

import (
	"better-uptime/common/middleware"
	"better-uptime/common/util"
	"net/http"
)

func (h *Handler) UserDetails(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	payload, err := middleware.GetFirebasePayloadFromContext(ctx)
	if err != nil {
		util.ErrorJson(w, util.ErrUnauthorized)
		return
	}

	user, err := h.store.GetUserByID(ctx, payload.UserId)
	if err != nil {
		util.ErrorJson(w, err)
		return
	}
	util.WriteJson(w, http.StatusOK, user)
}

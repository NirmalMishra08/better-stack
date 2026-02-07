package analytics

import (
	"better-uptime/common/middleware"
	"better-uptime/common/routes"
	"better-uptime/config"
	db "better-uptime/internal/db/sqlc"

	"github.com/go-chi/chi/v5"
)

type Handler struct {
	config *config.Config
	store  db.Store
}

func NewHandler(config *config.Config, store db.Store) *Handler {
	return &Handler{
		config: config,
		store:  store,
	}
}

func (h *Handler) Routes() *chi.Mux {
	router := routes.DefaultRouter()

	router.Group(func(r chi.Router) {
		r.Use(middleware.TokenMiddleware(h.store))

		r.Get("/overview", h.GetOverview)
	})

	return router
}

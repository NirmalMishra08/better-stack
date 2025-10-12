package monitor

import (
	"better-uptime/common/middleware"
	"better-uptime/common/routes"
	"better-uptime/config"
	db "better-uptime/internal/db/sqlc"
	"context"
	"go/token"

	"github.com/go-chi/chi/v5"
)

type Handler struct {
	config *config.Config
	store  db.Store
}

type HandlerConfig struct {
	Config     *config.Config
	Store      db.Store
	TokenMaker token.Token
}

func (h *Handler) GetStore() db.Store {
	return h.store
}

func NewHandler(config *config.Config, store db.Store) *Handler {
	return &Handler{
		config: config,
		store:  store,
	}
}

func (h *Handler) PerformMonitorCheck(ctx context.Context, monitor db.Monitor) (*TestURLResponse, error) {
	return h.performMonitorCheck(ctx, monitor)
}

func (h *Handler) Routes() *chi.Mux {
	router := routes.DefaultRouter()

	router.Group(func(r chi.Router) {
		r.Use(middleware.TokenMiddleware(h.store))
		r.Post("/create-monitor", h.CreateMonitor)
		r.Get("/get-monitor/{id}", h.GetMonitorByID)
		r.Get("/monitor-status/{id}", h.GetMonitorStatus)
		r.Post("/toggle-monitor", h.ToggleMonitor)
		r.Delete("/delete-monitor/{id}", h.DeleteMonitor)
		r.Get("/get-active-monitors", h.GetAllActiveMonitors)
		r.Get("/get-all-monitors", h.GetAllMonitors)
		r.Post("/take-screenshot", h.TakeScreenshot)

	})

	return router
}

package api

import (
	"better-uptime/common/routes"

	"github.com/go-chi/chi/v5"
)

func (app *Server) routes() *chi.Mux {
	router := routes.DefaultRouter()

	router.Route("/v1", func(r chi.Router) {
		r.Mount("/auth", app.authHandler.Routes())
		r.Mount("/monitor", app.monitorHandler.Routes())
		r.Mount("/alert", app.alertHandler.Routes())
		r.Mount("/analytics", app.analyticsHandler.Routes())
	})

	return router
}

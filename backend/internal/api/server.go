package api

import (
	"fmt"
	"net/http"

	"better-uptime/config"
	db "better-uptime/internal/db/sqlc"

	"github.com/go-chi/chi/v5"
)

type Server struct {
	store  db.Store
	cfg    *config.Config
	router *chi.Mux
}

type ServerConfig struct {
	Config *config.Config
	Store  db.Store
	// Uncomment these if you need them later
	// Redis           redis.Client
	// S3Session       s3.S3Interface
	// Firestore       firestore.FirestoreInterface
	// Email           email.EmailInterface
	// CalendarService *calendar.Service
}

// NewServer creates a new API server instance
func NewServer(store db.Store, cfg *config.Config) *Server {
	r := chi.NewRouter()

	// Simple health check route
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("TFC backend running 🚀"))
	})

	return &Server{
		store:  store,
		cfg:    cfg,
		router: r,
	}
}

// Start launches the HTTP server
func (s *Server) Start() error {
	addr := fmt.Sprintf(":%s", s.cfg.PORT)
	srv := &http.Server{
		Addr:    addr,
		Handler: s.router,
	}
	fmt.Println("Server running on", addr)
	return srv.ListenAndServe()
}

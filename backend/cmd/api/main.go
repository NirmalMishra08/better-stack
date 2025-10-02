package main

import (
	"better-uptime/config"
	"better-uptime/internal/api"
	db "better-uptime/internal/db/sqlc"
	"context"

	"fmt"
	"log"

	"github.com/jackc/pgx/v5/pgxpool"
)

func main() {

	// Connect to DB
	cfg := config.LoadConfig()
	pool, err := pgxpool.New(context.Background(), cfg.POSTGRES_CONNECTION)
	if err != nil {
		log.Fatalf("Cannot connect to DB: %v", err)
	}
	defer pool.Close()

	store := db.NewStore(pool) // <-- this creates Store
	defer pool.Close()

	server := api.NewServer(store, cfg)

	fmt.Printf("Server running on port %s\n", cfg.PORT)
	if err := server.Start(); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}

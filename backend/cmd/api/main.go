package main

import (
	"better-uptime/common/cloudinary"
	"better-uptime/config"
	"better-uptime/internal/api"
	db "better-uptime/internal/db/sqlc"
	"context"
	"fmt"
	"log"

	"github.com/jackc/pgx/v5/pgxpool"
)

func main() {
	// Load config
	cfg := config.LoadConfig()

	if cfg.POSTGRES_CONNECTION == "" {
		log.Fatal("POSTGRES_CONNECTION is empty! Check your .env")
	}
	fmt.Println("Connecting to DB:", cfg.POSTGRES_CONNECTION)

	// Connect to DB
	pool, err := pgxpool.New(context.Background(), cfg.POSTGRES_CONNECTION)
	if err != nil {
		log.Fatalf("Cannot connect to DB: %v", err)
	}
	defer pool.Close()

	


	// Initialize Cloudinary
	cloudinaryUploader, err := cloudinary.NewImageUploader(
		cfg.CLOUDINARY_CLOUD_NAME,
		cfg.CLOUDINARY_API_KEY,
		cfg.CLOUDINARY_API_SECRET,
	)
	if err != nil {
		log.Printf("Warning: Cloudinary initialization failed: %v", err)
		// Continue without Cloudinary if it's optional
	} else {
		fmt.Println("Cloudinary initialized successfully")
	}
	// Create store
	store := db.NewStore(pool)

	// Start server
	server := api.NewServer(store, cfg,cloudinaryUploader)
	fmt.Printf("Server running on port %s\n", cfg.PORT)
	if err := server.Start(); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}

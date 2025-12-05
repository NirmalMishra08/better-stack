package main

import (
	"better-uptime/common/cloudinary"
	"better-uptime/config"
	"better-uptime/internal/api"
	"better-uptime/internal/api/worker"
	db "better-uptime/internal/db/sqlc"
	"context"
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"

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
	} else {
		fmt.Println("Cloudinary initialized successfully")
	}

	// Create store
	store := db.NewStore(pool)

	// ✅ ADD THIS: Start Monitor Worker
	// worker := worker.NewMonitorWorker(store, cfg)

	// Create background context for the worker
	// workerCtx, cancelWorker := context.WithCancel(context.Background())
	// defer cancelWorker()

	// // Start worker in background
	// go worker.Start(workerCtx)
	// fmt.Println("🚀 Monitor worker started - checking monitors every minute")

	// Start server
	server := api.NewServer(store, cfg, cloudinaryUploader)

	// Channel for graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt, syscall.SIGTERM)

	// ---      fake code for testing email sending -- testing purposes only
	// err = email.SendStatusAlert("mishranrml@gmail.com", "example.com",true, "up", "200 ms")
	// if err != nil {
	// 	log.Fatal(err)
	// }

	// Start server in goroutine
	go func() {
		fmt.Printf("🌐 Server running on port %s\n", cfg.PORT)
		if err := server.Start(); err != nil {
			log.Printf("Server failed: %v", err)
			quit <- os.Interrupt
		}
	}()

	// Wait for shutdown signal
	<-quit
	fmt.Println("\n🛑 Shutting down server...")

	// Stop the worker
	// cancelWorker()
	fmt.Println("✅ Monitor worker stopped")

	fmt.Println("🎯 Application shutdown complete")
}

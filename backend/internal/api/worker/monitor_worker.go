package worker

import (
	"better-uptime/config"
	"better-uptime/internal/api/monitor"
	db "better-uptime/internal/db/sqlc"
	"context"
	"log"
	"time"
)

type MonitorWorker struct {
	handler  *monitor.Handler
	interval time.Duration
}

func NewMonitorWorker(store db.Store, config *config.Config) *MonitorWorker {
	return &MonitorWorker{
		handler:  monitor.NewHandler(config, store),
		interval: 1 * time.Minute,
	}
}

func (w *MonitorWorker) Start(ctx context.Context) {
	ticker := time.NewTicker(w.interval)
	defer ticker.Stop()

	log.Println("🚀 Monitor worker started")

	w.runChecks(ctx)

	for {
		select {
		case <-ticker.C:
			w.runChecks(ctx)
		case <-ctx.Done():
			log.Println("🛑 Monitor worker stopped")
			return
		}
	}
}

func (w *MonitorWorker) runChecks(ctx context.Context) {
	// Use handler's store to get monitors
	monitors, err := w.handler.GetStore().GetActiveMonitors(ctx)  // ✅ Use handler's store
	if err != nil {
		log.Printf("❌ Failed to get active monitors: %v", err)
		return
	}

	for _, monitor := range monitors {
		go func(m db.Monitor) {
			result, err := w.handler.PerformMonitorCheck(ctx, m)
			if err != nil {
				log.Printf("❌ Failed to check monitor %d (%s): %v", m.ID, m.Url, err)
				return
			}
			log.Printf("✅ %s: %s (%dms)", result.Url, result.Status, int(result.ResponseTime))
		}(monitor)
	}

	log.Printf("✅ Started checks for %d monitors", len(monitors))
}
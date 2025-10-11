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
}

func NewMonitorWorker(store db.Store, config *config.Config) *MonitorWorker {
	return &MonitorWorker{
		handler: monitor.NewHandler(config, store),
	}
}

func (w *MonitorWorker) Start(ctx context.Context) {

	commonIntervals := []int32{30, 60, 120, 300, 600, 1800, 3600}

	log.Println("🚀 Monitor worker started")

	for _, interval := range commonIntervals {
		go w.runIntervalGroup(ctx, interval)
	}
}

func (w *MonitorWorker) runIntervalGroup(ctx context.Context, interval int32) {
	ticker := time.NewTicker(time.Duration(interval) * time.Second)
	defer ticker.Stop()

	log.Printf("⏰ Interval group %ds started", interval)

	for {
		select {
		case <-ticker.C:
			w.checkMonitorsByInterval(ctx, interval)
		case <-ctx.Done():
			log.Printf("🛑 Interval group %ds stopped", interval)
			return
		}
	}
}

func (w *MonitorWorker) checkMonitorsByInterval(ctx context.Context, interval int32) {
	// Use handler's store to get monitors
	monitors, err := w.handler.GetStore().GetMonitorsByInterval(ctx, interval) // ✅ Use handler's store
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

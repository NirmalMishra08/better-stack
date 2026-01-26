package worker

import (
	"better-uptime/config"
	"better-uptime/internal/api/alert"
	"better-uptime/internal/api/monitor"
	db "better-uptime/internal/db/sqlc"
	"context"
	"log"
	"time"
)

type MonitorWorker struct {
	monitorHandler *monitor.Handler
	alertHandler   *alert.Handler
}

type TestURLResponse = alert.TestURLResponse

func NewMonitorWorker(store db.Store, config *config.Config) *MonitorWorker {
	return &MonitorWorker{
		monitorHandler: monitor.NewHandler(config, store),
		alertHandler:   alert.NewHandler(config, store),
	}
}

func (w *MonitorWorker) Start(ctx context.Context) {

	// commonIntervals := []int32{30, 60, 120, 300, 600, 1800, 3600}
	commonIntervals := []int32{30, 60}

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
	monitors, err := w.monitorHandler.GetStore().GetMonitorsByInterval(ctx, interval) // ✅ Use handler's store
	if err != nil {
		log.Printf("❌ Failed to get active monitors: %v", err)
		return
	}

	for _, monitor := range monitors {
		go func(m db.Monitor) {
			result, err := w.monitorHandler.PerformMonitorCheck(ctx, m)
			if err != nil {
				log.Printf("❌ Failed to check monitor %d (%s): %v", m.ID, m.Url, err)
				return
			}
			if err := w.alertHandler.CheckAndSendAlerts(ctx, m, result); err != nil {
				log.Printf("Error sending alerts for %d: %v", m.ID, err)
			}
			log.Print(result)
			log.Printf("✅ %s: %s (%dms)", result.Url, result.Status, int(result.ResponseTime))
		}(monitor)
	}

	log.Printf("✅ Started checks for %d monitors", len(monitors))
}

package monitor

import (
	"better-uptime/common/screenshot"
	"better-uptime/config"
	db "better-uptime/internal/db/sqlc"
	"context"
	"fmt"
)

func (h *Handler) TakeScreenshot(ctx context.Context, monitor db.Monitor) (string, error) {

	cfg := config.LoadConfig()

	// Validate that cfg is not nil
	if cfg == nil {
		return "", fmt.Errorf("configuration is not loaded")
	}

	folderPath := fmt.Sprintf("monitors/%d/down", monitor.ID)

	url, err := screenshot.ScreenshotAndUpload(monitor.Url, folderPath, *cfg)
	if err != nil {
		return "", fmt.Errorf("failed to take screenshot: %w", err)
	}

	return url, nil
}

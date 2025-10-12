package monitor

import (
	"better-uptime/common/middleware"
	"better-uptime/common/screenshot"
	"better-uptime/common/util"
	"better-uptime/config"
	"fmt"
	"net/http"
)

func (h *Handler) TakeScreenshot(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	_, err := middleware.GetFirebasePayloadFromContext(ctx)
	if err != nil {
		util.ErrorJson(w, util.ErrUnauthorized)
		return
	}

	cfg := config.LoadConfig()
	
	// Validate that cfg is not nil
	if cfg == nil {
		util.ErrorJson(w, fmt.Errorf("configuration failed to load"))
		return
	}

	// Debug logging
	fmt.Printf("Cloudinary config - Key: %s, Cloud: %s\n", 
		cfg.CLOUDINARY_API_KEY, 
		cfg.CLOUDINARY_CLOUD_NAME)

	url, err := screenshot.ScreenshotAndUpload("https://google.com/", "screenshot/down", *cfg)
	if err != nil {
		util.ErrorJson(w, fmt.Errorf("failed to take screenshot: %w", err))
		return
	}

	util.WriteJson(w, http.StatusOK, map[string]string{
		"url": url,
	})
}
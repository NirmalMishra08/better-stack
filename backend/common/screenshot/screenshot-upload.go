package screenshot

import (
	"better-uptime/common/cloudinary"
	"better-uptime/config"
	"bytes"
	"context"
	"fmt"

	screenshots "github.com/screenshotone/gosdk"
)

// ScreenshotAndUpload takes a URL, captures a screenshot, and uploads it to Cloudinary
func ScreenshotAndUpload(url string, publicID string, cfg config.Config) (string, error) {
	// Validate input parameters
	if cfg.SCREENSHOTONE_KEY == "" || cfg.SCREENSHOTONE_SECRET == "" {
		return "", fmt.Errorf("screenshot API credentials are missing")
	}

	ctx := context.Background()

	// Initialize ScreenshotOne client
	client, err := screenshots.NewClient(cfg.SCREENSHOTONE_KEY, cfg.SCREENSHOTONE_SECRET)
	if err != nil {
		return "", fmt.Errorf("failed to create screenshot client: %w", err)
	}

	options := screenshots.NewTakeOptions(url).
		Format("png").
		FullPage(true).
		DeviceScaleFactor(2).
		BlockAds(true).
		BlockTrackers(true)

	// Take screenshot (returns []byte)
	imgBytes, resp, err := client.Take(ctx, options)
	if err != nil {
		return "", fmt.Errorf("failed to take screenshot: %w", err)
	}

	// Check if resp is nil before accessing it
	if resp != nil {
		fmt.Printf("Screenshot taken: status %d, size %d bytes\n", resp.StatusCode, len(imgBytes))
	} else {
		fmt.Printf("Screenshot taken: size %d bytes (no response details)\n", len(imgBytes))
	}

	// Validate Cloudinary credentials
	if cfg.CLOUDINARY_CLOUD_NAME == "" || cfg.CLOUDINARY_API_KEY == "" || cfg.CLOUDINARY_API_SECRET == "" {
		return "", fmt.Errorf("cloudinary credentials are missing")
	}

	// Upload to Cloudinary
	uploader, err := cloudinary.NewImageUploader(
		cfg.CLOUDINARY_CLOUD_NAME,
		cfg.CLOUDINARY_API_KEY,
		cfg.CLOUDINARY_API_SECRET,
	)
	if err != nil {
		return "", fmt.Errorf("failed to create Cloudinary uploader: %w", err)
	}

	// Convert bytes to a reader and upload
	imageReader := bytes.NewReader(imgBytes)
	result, err := uploader.UploadFromReader(imageReader, publicID, "png")
	if err != nil {
		return "", fmt.Errorf("failed to upload to Cloudinary: %w", err)
	}

	return result.URL, nil
}
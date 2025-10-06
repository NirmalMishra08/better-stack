package cloudinary

import (
	"context"
	"fmt"
	"mime/multipart"
	"os"

	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
)

type UploadResult struct {
	URL      string `json:"url"`
	PublicID string `json:"public_id"`
	Format   string `json:"format"`
	Bytes    int    `json:"bytes"`
	Width    int    `json:"width"`
	Height   int    `json:"height"`
}

type ImageUploader struct {
	cld *cloudinary.Cloudinary
	ctx context.Context
}

func NewImageUploader(cloudName, apiKey, apiSecret string) (*ImageUploader, error) {
	if cloudName == "" || apiKey == "" || apiSecret == "" {
		return nil, fmt.Errorf("cloudinary credentials are required")
	}
	cld, err := cloudinary.NewFromParams(cloudName, apiKey, apiSecret)
	if err != nil {
		return nil, fmt.Errorf("failed to create Cloudinary client: %v", err)
	}

	return &ImageUploader{
		cld: cld,
		ctx: context.Background(),
	}, nil
}

// UploadFromFile uploads an image from a file path
func (iu *ImageUploader) UploadFromFile(filePath string, publicID string) (*UploadResult, error) {
	// Validate file exists
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		return nil, fmt.Errorf("file does not exist: %s", filePath)
	}

	// Upload the image
	uploadParams := uploader.UploadParams{
		PublicID: publicID,
	}

	result, err := iu.cld.Upload.Upload(iu.ctx, filePath, uploadParams)
	if err != nil {
		return nil, fmt.Errorf("upload failed: %v", err)
	}

	return &UploadResult{
		URL:      result.SecureURL,
		PublicID: result.PublicID,
		Format:   result.Format,
		Bytes:    result.Bytes,
		Width:    result.Width,
		Height:   result.Height,
	}, nil
}

// UploadFromMultipartFile uploads an image from a multipart form file
func (iu *ImageUploader) UploadFromMultipartFile(fileHeader *multipart.FileHeader, publicID string) (*UploadResult, error) {
	file, err := fileHeader.Open()
	if err != nil {
		return nil, fmt.Errorf("failed to open file: %v", err)
	}
	defer file.Close()

	uploadParams := uploader.UploadParams{
		PublicID: publicID,
	}

	result, err := iu.cld.Upload.Upload(iu.ctx, file, uploadParams)
	if err != nil {
		return nil, fmt.Errorf("upload failed: %v", err)
	}

	return &UploadResult{
		URL:      result.SecureURL,
		PublicID: result.PublicID,
		Format:   result.Format,
		Bytes:    result.Bytes,
		Width:    result.Width,
		Height:   result.Height,
	}, nil
}

// UploadFromBytes uploads an image from byte data
func (iu *ImageUploader) UploadFromBytes(data []byte, publicID, format string) (*UploadResult, error) {
	uploadParams := uploader.UploadParams{
		PublicID: publicID,
	}

	result, err := iu.cld.Upload.Upload(iu.ctx, data, uploadParams)
	if err != nil {
		return nil, fmt.Errorf("upload failed: %v", err)
	}

	return &UploadResult{
		URL:      result.SecureURL,
		PublicID: result.PublicID,
		Format:   result.Format,
		Bytes:    result.Bytes,
		Width:    result.Width,
		Height:   result.Height,
	}, nil
}

package cloudinary

import (
	"github.com/cloudinary/cloudinary-go/v2"
)

type CloudinaryConfig struct {
	CloudName string
	APIKey    string
	APISecret string
}

func NewCloudinaryClient(config CloudinaryConfig) (*cloudinary.Cloudinary, error) {
	cld, err := cloudinary.NewFromParams(config.CloudName, config.APIKey, config.APISecret)
	if err != nil {
		return nil, err
	}
	return cld, nil
}

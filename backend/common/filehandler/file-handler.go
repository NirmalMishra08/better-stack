package filehandler

import (
	"better-uptime/common/util"
	"fmt"
	"net/http"
	"os"

	"github.com/jesses-code-adventures/utapi-go"
	"github.com/sirupsen/logrus"
)

type FileHandler struct {
	utClient *utapi.UtApi
}

func NewFileHandler() (*FileHandler, error) {
	utClient, err := utapi.NewUtApi()
	if err != nil {
		fmt.Println("Error creating uploadthing api handler")
		fmt.Println(fmt.Errorf("%s", err))
		os.Exit(1)
	}
	return &FileHandler{utClient: utClient}, nil
}

// UploadResponse - Response after file operations
type UploadResponse struct {
	Success  bool     `json:"success"`
	FileKeys []string `json:"fileKeys,omitempty"`
	Urls     []string `json:"urls,omitempty"`
	Message  string   `json:"message,omitempty"`
}

// HandleUploadSuccess - Called after frontend successfully uploads files
// Frontend should send the file keys that were uploaded
func (h *FileHandler) HandleUploadSuccess(w http.ResponseWriter, r *http.Request) {
	var req struct {
		FileKeys []string `json:"fileKeys" validate:"required,min=1"`
	}

	if err := util.ReadJsonAndValidate(w, r, &req); err != nil {
		util.ErrorJson(w, err)
		return
	}

	// Get permanent URLs for the uploaded files
	urls, err := h.utClient.GetFileUrls(req.FileKeys)
	if err != nil {
		logrus.Error("Failed to get file URLs: ", err)
		util.ErrorJson(w, err)
		return
	}

	// Extract just the URLs for response
	var urlStrings []string
	for _, url := range urls.Data {
		urlStrings = append(urlStrings, url.Url)
	}

	util.WriteJson(w, http.StatusOK, UploadResponse{
		Success:  true,
		FileKeys: req.FileKeys,
		Urls:     urlStrings,
		Message:  "Files uploaded successfully",
	})
}

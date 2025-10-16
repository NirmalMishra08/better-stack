package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	PORT                  string
	POSTGRES_CONNECTION   string
	CLOUDINARY_CLOUD_NAME string
	CLOUDINARY_API_KEY    string
	CLOUDINARY_API_SECRET string
	SCREENSHOTONE_KEY	  string
	SCREENSHOTONE_SECRET  string
}

func LoadConfig() *Config {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system environment")
	}

	return &Config{
		PORT:                getEnv("PORT", "8080"),
		POSTGRES_CONNECTION: getEnv("POSTGRES_CONNECTION", ""),
		CLOUDINARY_CLOUD_NAME: getEnv("CLOUDINARY_CLOUD_NAME", ""),
		CLOUDINARY_API_KEY:    getEnv("CLOUDINARY_API_KEY", ""),
		CLOUDINARY_API_SECRET: getEnv("CLOUDINARY_API_SECRET", ""),
		SCREENSHOTONE_KEY:     getEnv("SCREENSHOTONE_KEY", ""),
		SCREENSHOTONE_SECRET:  getEnv("SCREENSHOTONE_SECRET", ""),

	}
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}

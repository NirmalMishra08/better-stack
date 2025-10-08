# Build stage
FROM golang:1.24.3-alpine AS builder

# Install dependencies
RUN apk add --no-cache git ca-certificates tzdata

# Set working directory
WORKDIR /app

# Copy go mod files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy source code
COPY . .

# Find and build the main package - more flexible approach
RUN find . -name "main.go" -type f | head -1
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main ./cmd/api

# Final stage
FROM alpine:latest

# Install necessary packages
RUN apk --no-cache add ca-certificates tzdata wget && \
    update-ca-certificates

# Create non-root user
RUN addgroup -S app && adduser -S app -G app

WORKDIR /root/
COPY --from=builder /app/main .
USER app
EXPOSE 8080

CMD ["./main"]
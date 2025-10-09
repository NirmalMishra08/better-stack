-- name: CreateMonitorLog :one
INSERT INTO monitor_logs (
    monitor_id, status_code, response_time, 
    dns_ok, ssl_ok, content_ok, screenshot_url
) VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING *;

-- name: GetMonitorLogs :many
SELECT * FROM monitor_logs 
WHERE monitor_id = $1 
ORDER BY checked_at DESC 
LIMIT $2;

-- name: GetMonitorLogsByTimeRange :many
SELECT * FROM monitor_logs 
WHERE monitor_id = $1 
AND checked_at BETWEEN $2 AND $3 
ORDER BY checked_at DESC;

-- name: GetRecentMonitorStatus :one
SELECT status_code, response_time, checked_at 
FROM monitor_logs 
WHERE monitor_id = $1 
ORDER BY checked_at DESC 
LIMIT 1;
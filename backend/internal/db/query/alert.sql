-- name: CreateAlert :one
INSERT INTO alerts (monitor_id, alert_type, message)
VALUES ($1, $2, $3)
RETURNING *;

-- name: GetMonitorAlerts :many
SELECT * FROM alerts 
WHERE monitor_id = $1 
ORDER BY sent_at DESC 
LIMIT $2;

-- name: GetRecentAlerts :many
SELECT a.*, m.url, m.user_id
FROM alerts a
JOIN monitors m ON a.monitor_id = m.id
WHERE m.user_id = $1
ORDER BY a.sent_at DESC 
LIMIT $2;
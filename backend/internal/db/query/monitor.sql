-- name: CreateMonitor :one
INSERT INTO monitors (user_id, url, method, type, interval, status, is_active, created_at, updated_at)
VALUES ($1, $2, $3, $4, $5, $6, $7, now(), now())
RETURNING *;

-- name: GetUserMonitors :many
SELECT * FROM monitors 
WHERE user_id = $1 
ORDER BY created_at DESC;

-- name: GetMonitorByID :one
SELECT * FROM monitors 
WHERE id = $1 AND user_id = $2;


-- name: UpdateMonitor :one
UPDATE monitors 
SET 
    url = COALESCE($2, url),
    method = COALESCE($3, method),
    type = COALESCE($4, type),
    interval = COALESCE($5, interval),
    status = COALESCE($6, status),
    is_active = COALESCE($7, is_active),
    updated_at = CURRENT_TIMESTAMP
WHERE id = $1 AND user_id = $8
RETURNING *;


-- name: DeleteMonitor :exec
DELETE FROM monitors 
WHERE id = $1 AND user_id = $2;

-- name: ToggleMonitor :one
UPDATE monitors 
SET is_active = $3, 
    consecutive_failures = CASE WHEN $3 = true THEN 0 ELSE consecutive_failures END,
    updated_at = CURRENT_TIMESTAMP
WHERE id = $1 AND user_id = $2
RETURNING *;

-- name: UpdateMonitorStatus :one
UPDATE monitors 
SET status = $2, updated_at = CURRENT_TIMESTAMP
WHERE id = $1
RETURNING *;

-- name: UpdateMonitorAlertState :exec
UPDATE monitors
SET 
    last_status = $2,
    last_alert_sent_at = $3,
    updated_at = NOW()
WHERE id = $1;


-- name: GetActiveMonitors :many
SELECT * FROM monitors 
WHERE is_active = true;

-- name: GetActiveMonitorsForUser :many
SELECT * FROM monitors 
WHERE is_active = true AND user_id = $1;



-- name: GetMonitorByIdandURL :one
SELECT * FROM monitors
where user_id = $1 AND url = $2;

-- name: GetMonitorsByInterval :many
SELECT * FROM monitors WHERE is_active = true AND interval = $1;

-- name: UpdateMonitorStatusAndFailures :one
UPDATE monitors 
SET status = $2, 
    consecutive_failures = $3,
    is_active = $4,
    updated_at = CURRENT_TIMESTAMP
WHERE id = $1
RETURNING *;

-- name: GetUserMonitorsWithStats :many
SELECT 
    m.id, 
    m.user_id,
    m.url, 
    m.type, 
    m.interval,
    m.status, 
    m.is_active, 
    COALESCE(AVG(ml.response_time), 0)::float as avg_response_time,
    COALESCE(SUM(CASE WHEN ml.status_code >= 200 AND ml.status_code < 400 THEN 1 ELSE 0 END), 0)::bigint as successful_checks,
    COUNT(ml.id)::bigint as total_checks,
    MAX(ml.checked_at) as last_check
FROM monitors m
LEFT JOIN monitor_logs ml ON m.id = ml.monitor_id
WHERE m.user_id = $1
GROUP BY m.id
ORDER BY m.created_at DESC;
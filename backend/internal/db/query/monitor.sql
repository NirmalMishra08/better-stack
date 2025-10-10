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
SET is_active = $3, updated_at = CURRENT_TIMESTAMP
WHERE id = $1 AND user_id = $2
RETURNING *;

-- name: UpdateMonitorStatus :one
UPDATE monitors 
SET status = $2, updated_at = CURRENT_TIMESTAMP
WHERE id = $1
RETURNING *;


-- name: GetActiveMonitors :many
SELECT * FROM monitors 
WHERE is_active = true;

-- name: GetActiveMonitorsForUser :many
SELECT * FROM monitors 
WHERE is_active = true AND user_id = $1;



-- name: GetMonitorByIdandURL :one
SELECT * FROM monitors
where user_id = $1 AND url = $2;
-- name: CreateAlertContact :one
INSERT INTO alert_contacts (user_id, name, email)
VALUES ($1, $2, $3)
RETURNING *;

-- name: GetAlertContactsByUserID :many
SELECT * FROM alert_contacts
WHERE user_id = $1
ORDER BY created_at DESC;

-- name: GetAlertContactByID :one
SELECT * FROM alert_contacts
WHERE id = $1;

-- name: GetAlertContactsByMonitor :many
SELECT ac.* FROM alert_contacts ac
JOIN monitor_alert_configs mac ON ac.id = mac.alert_contact_id
WHERE mac.monitor_id = $1 AND mac.is_active = true;

-- name: CreateMonitorAlertConfig :one
INSERT INTO monitor_alert_configs (monitor_id, alert_contact_id, alert_on_up, alert_on_down, alert_on_slow, slow_threshold_ms)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING *;

-- name: GetMonitorAlertConfigs :many
SELECT * FROM monitor_alert_configs 
WHERE monitor_id = $1 AND is_active = true;


-- name: UpdateMonitorAlertConfig :one
UPDATE monitor_alert_configs 
SET alert_on_up = $2, alert_on_down = $3, alert_on_slow = $4, slow_threshold_ms = $5
WHERE id = $1
RETURNING *;


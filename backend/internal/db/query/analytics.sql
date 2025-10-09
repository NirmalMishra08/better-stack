-- name: CreateOrUpdateAnalytics :one
INSERT INTO analytics (
    monitor_id, uptime_percentage, avg_response_time, last_24h_downtime
) VALUES ($1, $2, $3, $4)
ON CONFLICT (monitor_id) 
DO UPDATE SET 
    uptime_percentage = EXCLUDED.uptime_percentage,
    avg_response_time = EXCLUDED.avg_response_time,
    last_24h_downtime = EXCLUDED.last_24h_downtime,
    updated_at = CURRENT_TIMESTAMP
RETURNING *;

-- name: GetAnalytics :one
SELECT * FROM analytics 
WHERE monitor_id = $1;

-- name: CalculateUptimePercentage :one
SELECT 
    COUNT(*) as total_checks,
    SUM(CASE WHEN status_code BETWEEN 200 AND 399 THEN 1 ELSE 0 END) as successful_checks,
    ROUND(
        (SUM(CASE WHEN status_code BETWEEN 200 AND 399 THEN 1 ELSE 0 END) * 100.0 / COUNT(*))::numeric, 
    2) as uptime_percentage
FROM monitor_logs 
WHERE monitor_id = $1 
AND checked_at >= $2;

-- name: GetAverageResponseTime :one
SELECT ROUND(AVG(response_time)::numeric, 2) as avg_response_time
FROM monitor_logs 
WHERE monitor_id = $1 
AND checked_at >= $2 
AND response_time IS NOT NULL;
-- name: CreateSubscription :one
INSERT INTO subscriptions (user_id, stripe_plan, is_active)
VALUES ($1, $2, $3)
RETURNING *;

-- name: GetUserSubscription :one
SELECT * FROM subscriptions 
WHERE user_id = $1 
ORDER BY created_at DESC 
LIMIT 1;

-- name: UpdateSubscription :one
UPDATE subscriptions 
SET 
    stripe_plan = COALESCE($2, stripe_plan),
    is_active = COALESCE($3, is_active)
WHERE user_id = $1
RETURNING *;

-- name: DeactivateSubscription :exec
UPDATE subscriptions 
SET is_active = false 
WHERE user_id = $1;
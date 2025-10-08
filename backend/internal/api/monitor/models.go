package monitor

import "github.com/jackc/pgx/v5/pgtype"

type CreateMonitorRequest struct {
	Url      string      `json:"url"`
	Method   pgtype.Text `json:"method"`
	Type     pgtype.Text `json:"type"`
	Interval int32       `json:"interval"`
	Status   string      `json:"status"`
	IsActive pgtype.Bool `json:"is_active"`
}

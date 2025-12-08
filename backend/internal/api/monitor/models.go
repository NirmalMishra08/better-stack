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



type TestURLResponse struct {
	Url          string  `json:"url"`
	StatusCode   int32   `json:"status_code"`
	ResponseTime float64 `json:"response_time"`
	Status       string  `json:"status"`
	DnsOk        bool    `json:"dns_ok"`
	SslOk        bool    `json:"ssl_ok"`
	Error        string  `json:"error,omitempty"`
}

type MonitorLogParamas struct {
	MonitorID int32
	From pgtype.Timestamp
	To pgtype.Timestamp
	Limit int32
	Offset int32
}
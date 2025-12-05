package models

type TestURLResponse struct {
    Url          string  `json:"url"`
    StatusCode   int32   `json:"status_code"`
    ResponseTime float64 `json:"response_time"`
    Status       string  `json:"status"`
    DnsOk        bool    `json:"dns_ok"`
    SslOk        bool    `json:"ssl_ok"`
    Error        string  `json:"error,omitempty"`
}
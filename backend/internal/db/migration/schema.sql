CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE monitors (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    url TEXT NOT NULL,
    method TEXT DEFAULT 'GET',
    interval_seconds INTEGER NOT NULL,
    status TEXT DEFAULT 'unknown',
    last_checked TIMESTAMP
);

CREATE TABLE check_logs (
    id SERIAL PRIMARY KEY,
    monitor_id INTEGER REFERENCES monitors(id),
    status_code INTEGER,
    success BOOLEAN,
    checked_at TIMESTAMP DEFAULT now()
);

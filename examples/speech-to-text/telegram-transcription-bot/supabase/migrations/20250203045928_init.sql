CREATE TABLE IF NOT EXISTS transcription_logs (
  id BIGSERIAL PRIMARY KEY,
  file_type VARCHAR NOT NULL,
  duration INTEGER NOT NULL,
  chat_id BIGINT NOT NULL,
  message_id BIGINT NOT NULL,
  username VARCHAR,
  transcript TEXT,
  language_code VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  error TEXT
);

ALTER TABLE transcription_logs ENABLE ROW LEVEL SECURITY;
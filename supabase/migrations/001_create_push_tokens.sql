CREATE TABLE IF NOT EXISTS push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE,
  token TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_push_tokens_token ON push_tokens(token);

ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own token"
  ON push_tokens
  FOR INSERT
  WITH CHECK (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "Users can update their own token"
  ON push_tokens
  FOR UPDATE
  USING (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "Users can delete their own token"
  ON push_tokens
  FOR DELETE
  USING (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "Users can read their own token"
  ON push_tokens
  FOR SELECT
  USING (auth.jwt() ->> 'sub' = user_id);

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  plan TEXT DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS resumes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  filename TEXT,
  raw_text TEXT NOT NULL,
  parsed_json JSONB,
  parse_confidence DECIMAL(4,3),
  layout_risk TEXT DEFAULT 'low',
  layout_issues JSONB DEFAULT '[]'::jsonb,
  word_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS job_descriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  raw_text TEXT NOT NULL,
  parsed_json JSONB,
  company_name TEXT,
  job_title TEXT,
  required_skills TEXT[] DEFAULT '{}',
  preferred_skills TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  resume_id UUID REFERENCES resumes(id) ON DELETE SET NULL,
  jd_id UUID REFERENCES job_descriptions(id) ON DELETE SET NULL,
  ats_score DECIMAL(5,2),
  match_score DECIMAL(5,2),
  parse_score DECIMAL(5,2),
  keyword_score DECIMAL(5,2),
  semantic_score DECIMAL(5,2),
  format_score DECIMAL(5,2),
  readability_score DECIMAL(5,2),
  missing_keywords TEXT[] DEFAULT '{}',
  suggestions JSONB DEFAULT '[]'::jsonb,
  heatmap_data JSONB DEFAULT '[]'::jsonb,
  ats_target TEXT,
  ats_simulation JSONB DEFAULT '{}'::jsonb,
  ontology_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS optimizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  analysis_id UUID REFERENCES analyses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  original_text TEXT NOT NULL,
  optimized_text TEXT,
  changes JSONB DEFAULT '[]'::jsonb,
  keywords_added TEXT[] DEFAULT '{}',
  model_used TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS skills (
  id SERIAL PRIMARY KEY,
  canonical_name TEXT UNIQUE NOT NULL,
  category TEXT,
  aliases TEXT[] DEFAULT '{}',
  demand_score DECIMAL(4,3),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resumes_user ON resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_resumes_parsed ON resumes USING GIN(parsed_json);
CREATE INDEX IF NOT EXISTS idx_jd_required_skills ON job_descriptions USING GIN(required_skills);
CREATE INDEX IF NOT EXISTS idx_skills_aliases ON skills USING GIN(aliases);
CREATE INDEX IF NOT EXISTS idx_skills_trgm ON skills USING GIN(canonical_name gin_trgm_ops);

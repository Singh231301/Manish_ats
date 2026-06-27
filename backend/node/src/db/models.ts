import { Sequelize, DataTypes, Model } from "sequelize";
import { env } from "../config/env.js";

// Initialize Sequelize
export const sequelize = env.databaseUrl
  ? new Sequelize(env.databaseUrl, {
      dialect: "postgres",
      logging: false,
      pool: {
        max: 10,
        idle: 30000,
      },
    })
  : new Sequelize("sqlite::memory:"); // Fallback for dev without DB URL

export const User = sequelize.define("User", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  email: {
    type: DataTypes.TEXT,
    allowNull: false,
    unique: true,
  },
  full_name: {
    type: DataTypes.TEXT,
  },
  plan: {
    type: DataTypes.TEXT,
    defaultValue: "free",
  },
}, {
  tableName: "users",
  underscored: true,
});

export const Resume = sequelize.define("Resume", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    references: { model: User, key: "id" },
    onDelete: "SET NULL",
  },
  filename: { type: DataTypes.TEXT },
  raw_text: { type: DataTypes.TEXT, allowNull: false },
  parsed_json: { type: DataTypes.JSONB },
  parse_confidence: { type: DataTypes.DECIMAL(4, 3) },
  layout_risk: { type: DataTypes.TEXT, defaultValue: "low" },
  layout_issues: { type: DataTypes.JSONB, defaultValue: [] },
  word_count: { type: DataTypes.INTEGER, defaultValue: 0 },
}, {
  tableName: "resumes",
  underscored: true,
});

export const JobDescription = sequelize.define("JobDescription", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    references: { model: User, key: "id" },
    onDelete: "SET NULL",
  },
  raw_text: { type: DataTypes.TEXT, allowNull: false },
  parsed_json: { type: DataTypes.JSONB },
  company_name: { type: DataTypes.TEXT },
  job_title: { type: DataTypes.TEXT },
  required_skills: { type: DataTypes.ARRAY(DataTypes.TEXT), defaultValue: [] },
  preferred_skills: { type: DataTypes.ARRAY(DataTypes.TEXT), defaultValue: [] },
}, {
  tableName: "job_descriptions",
  underscored: true,
  updatedAt: false,
});

export const Analysis = sequelize.define("Analysis", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    references: { model: User, key: "id" },
    onDelete: "SET NULL",
  },
  resume_id: {
    type: DataTypes.UUID,
    references: { model: Resume, key: "id" },
    onDelete: "SET NULL",
  },
  jd_id: {
    type: DataTypes.UUID,
    references: { model: JobDescription, key: "id" },
    onDelete: "SET NULL",
  },
  ats_score: { type: DataTypes.DECIMAL(5, 2) },
  match_score: { type: DataTypes.DECIMAL(5, 2) },
  parse_score: { type: DataTypes.DECIMAL(5, 2) },
  keyword_score: { type: DataTypes.DECIMAL(5, 2) },
  semantic_score: { type: DataTypes.DECIMAL(5, 2) },
  format_score: { type: DataTypes.DECIMAL(5, 2) },
  readability_score: { type: DataTypes.DECIMAL(5, 2) },
  missing_keywords: { type: DataTypes.ARRAY(DataTypes.TEXT), defaultValue: [] },
  suggestions: { type: DataTypes.JSONB, defaultValue: [] },
  heatmap_data: { type: DataTypes.JSONB, defaultValue: [] },
  ats_target: { type: DataTypes.TEXT },
  ats_simulation: { type: DataTypes.JSONB, defaultValue: {} },
  ontology_data: { type: DataTypes.JSONB, defaultValue: {} },
}, {
  tableName: "analyses",
  underscored: true,
  updatedAt: false,
});

export const Optimization = sequelize.define("Optimization", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  analysis_id: {
    type: DataTypes.UUID,
    references: { model: Analysis, key: "id" },
    onDelete: "CASCADE",
  },
  user_id: {
    type: DataTypes.UUID,
    references: { model: User, key: "id" },
    onDelete: "SET NULL",
  },
  original_text: { type: DataTypes.TEXT, allowNull: false },
  optimized_text: { type: DataTypes.TEXT },
  changes: { type: DataTypes.JSONB, defaultValue: [] },
  keywords_added: { type: DataTypes.ARRAY(DataTypes.TEXT), defaultValue: [] },
  model_used: { type: DataTypes.TEXT },
}, {
  tableName: "optimizations",
  underscored: true,
  updatedAt: false,
});

export const Skill = sequelize.define("Skill", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  canonical_name: { type: DataTypes.TEXT, allowNull: false, unique: true },
  category: { type: DataTypes.TEXT },
  aliases: { type: DataTypes.ARRAY(DataTypes.TEXT), defaultValue: [] },
  demand_score: { type: DataTypes.DECIMAL(4, 3) },
}, {
  tableName: "skills",
  underscored: true,
  updatedAt: false,
});

// Relationships
User.hasMany(Resume, { foreignKey: "user_id" });
Resume.belongsTo(User, { foreignKey: "user_id" });

User.hasMany(JobDescription, { foreignKey: "user_id" });
JobDescription.belongsTo(User, { foreignKey: "user_id" });

User.hasMany(Analysis, { foreignKey: "user_id" });
Analysis.belongsTo(User, { foreignKey: "user_id" });

Resume.hasMany(Analysis, { foreignKey: "resume_id" });
Analysis.belongsTo(Resume, { foreignKey: "resume_id" });

JobDescription.hasMany(Analysis, { foreignKey: "jd_id" });
Analysis.belongsTo(JobDescription, { foreignKey: "jd_id" });

Analysis.hasMany(Optimization, { foreignKey: "analysis_id" });
Optimization.belongsTo(Analysis, { foreignKey: "analysis_id" });

User.hasMany(Optimization, { foreignKey: "user_id" });
Optimization.belongsTo(User, { foreignKey: "user_id" });

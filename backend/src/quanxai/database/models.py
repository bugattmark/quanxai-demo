"""SQLModel database models."""
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime
from uuid import uuid4


def generate_uuid() -> str:
    return str(uuid4())


class Organization(SQLModel, table=True):
    """Organization model - top level of hierarchy."""
    __tablename__ = "organizations"

    id: str = Field(default_factory=generate_uuid, primary_key=True)
    name: str = Field(index=True, unique=True)
    description: Optional[str] = None
    monthly_budget_usd: float = Field(default=0.0)
    total_budget_usd: float = Field(default=0.0)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = Field(default=True)

    # Relationships
    teams: List["Team"] = Relationship(back_populates="organization")


class Team(SQLModel, table=True):
    """Team model - belongs to an organization."""
    __tablename__ = "teams"

    id: str = Field(default_factory=generate_uuid, primary_key=True)
    organization_id: str = Field(foreign_key="organizations.id", index=True)
    name: str = Field(index=True)
    description: Optional[str] = None
    monthly_budget_usd: float = Field(default=0.0)
    total_budget_usd: float = Field(default=0.0)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = Field(default=True)

    # Relationships
    organization: Organization = Relationship(back_populates="teams")
    users: List["User"] = Relationship(back_populates="team")


class User(SQLModel, table=True):
    """User/Developer model - belongs to a team."""
    __tablename__ = "users"

    id: str = Field(default_factory=generate_uuid, primary_key=True)
    team_id: str = Field(foreign_key="teams.id", index=True)
    email: str = Field(index=True, unique=True)
    name: str
    role: Optional[str] = None
    avatar_url: Optional[str] = None
    monthly_budget_usd: float = Field(default=0.0)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = Field(default=True)

    # Relationships
    team: Team = Relationship(back_populates="users")


class APIKey(SQLModel, table=True):
    """API Key model for authentication (Virtual Keys)."""
    __tablename__ = "api_keys"

    id: str = Field(default_factory=generate_uuid, primary_key=True)
    key_hash: str = Field(index=True, unique=True)
    key_prefix: str = Field(index=True)  # First 8 chars for display (sk-xxxx)
    alias: Optional[str] = None  # Human-readable name

    # Ownership (one of these)
    organization_id: Optional[str] = Field(default=None, foreign_key="organizations.id")
    team_id: Optional[str] = Field(default=None, foreign_key="teams.id")
    user_id: Optional[str] = Field(default=None, foreign_key="users.id")

    # Model access control
    allowed_models: Optional[str] = None  # JSON array of model IDs, null = all

    # Rate limits
    rate_limit_rpm: int = Field(default=60)  # Requests per minute
    rate_limit_tpm: int = Field(default=100000)  # Tokens per minute
    max_parallel_requests: int = Field(default=10)

    # Budget
    max_budget_usd: float = Field(default=0.0)  # 0 = unlimited
    spent_usd: float = Field(default=0.0)  # Track current spend
    budget_reset_at: Optional[datetime] = None  # When budget resets

    # Metadata (note: 'metadata' is reserved by SQLAlchemy, so we use 'key_metadata')
    key_metadata: Optional[str] = None  # JSON for custom data
    tags: Optional[str] = None  # JSON array of tag IDs

    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_used_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    is_active: bool = Field(default=True)
    is_blocked: bool = Field(default=False)


class UsageLog(SQLModel, table=True):
    """Usage log for every LLM API call."""
    __tablename__ = "usage_logs"

    id: str = Field(default_factory=generate_uuid, primary_key=True)
    request_id: str = Field(index=True, unique=True)

    # Hierarchy (denormalized for fast queries)
    api_key_id: str = Field(foreign_key="api_keys.id", index=True)
    organization_id: str = Field(foreign_key="organizations.id", index=True)
    team_id: Optional[str] = Field(default=None, foreign_key="teams.id", index=True)
    user_id: Optional[str] = Field(default=None, foreign_key="users.id", index=True)

    # Model info
    model_requested: str
    model_used: str = Field(index=True)
    provider: str = Field(index=True)

    # Token usage
    prompt_tokens: int = Field(default=0)
    completion_tokens: int = Field(default=0)
    total_tokens: int = Field(default=0)
    cache_read_tokens: int = Field(default=0)
    cache_creation_tokens: int = Field(default=0)

    # Cost (USD)
    prompt_cost_usd: float = Field(default=0.0)
    completion_cost_usd: float = Field(default=0.0)
    total_cost_usd: float = Field(default=0.0)

    # Performance
    latency_ms: int = Field(default=0)
    is_streaming: bool = Field(default=False)
    is_success: bool = Field(default=True, index=True)
    error_type: Optional[str] = None
    error_message: Optional[str] = None
    status_code: Optional[int] = None

    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)

    # Additional fields for log detail
    request_payload: Optional[str] = None  # JSON request body
    response_payload: Optional[str] = None  # JSON response body
    tags: Optional[str] = None  # JSON array of tag IDs for cost allocation


class Tag(SQLModel, table=True):
    """Tag for cost allocation and routing."""
    __tablename__ = "tags"

    id: str = Field(default_factory=generate_uuid, primary_key=True)
    name: str = Field(index=True, unique=True)
    description: Optional[str] = None
    color: str = Field(default="#3B82F6")  # Default blue
    organization_id: str = Field(foreign_key="organizations.id", index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = Field(default=True)


class Guardrail(SQLModel, table=True):
    """Guardrail configuration for content moderation."""
    __tablename__ = "guardrails"

    id: str = Field(default_factory=generate_uuid, primary_key=True)
    name: str = Field(index=True)
    description: Optional[str] = None
    type: str = Field(index=True)  # "openai_moderation" | "presidio" | "prompt_injection" | "bedrock" | "custom"
    config: str  # JSON configuration
    enabled: bool = Field(default=True)
    mode: str = Field(default="pre_call")  # "pre_call" | "post_call" | "during_call"

    # Apply to specific models or all
    apply_to_models: Optional[str] = None  # JSON array, null = all models

    organization_id: str = Field(foreign_key="organizations.id", index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class GuardrailViolation(SQLModel, table=True):
    """Log of guardrail violations/blocks."""
    __tablename__ = "guardrail_violations"

    id: str = Field(default_factory=generate_uuid, primary_key=True)
    guardrail_id: str = Field(foreign_key="guardrails.id", index=True)
    request_id: Optional[str] = None
    api_key_id: Optional[str] = Field(default=None, foreign_key="api_keys.id")

    violation_type: str  # Category of violation
    severity: str = Field(default="medium")  # "low" | "medium" | "high"
    blocked: bool = Field(default=True)
    details: str  # JSON with violation details

    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)


class Budget(SQLModel, table=True):
    """Budget template that can be attached to entities."""
    __tablename__ = "budgets"

    id: str = Field(default_factory=generate_uuid, primary_key=True)
    name: str = Field(index=True)
    description: Optional[str] = None

    max_budget_usd: float
    period: str = Field(default="monthly")  # "daily" | "weekly" | "monthly" | "total"
    alert_threshold: float = Field(default=0.8)  # Alert at 80%

    # Entity this budget is attached to
    entity_type: str  # "organization" | "team" | "user" | "key"
    entity_id: str = Field(index=True)

    # Current tracking
    spent_usd: float = Field(default=0.0)
    period_start: datetime = Field(default_factory=datetime.utcnow)

    organization_id: str = Field(foreign_key="organizations.id", index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = Field(default=True)


class AuditLog(SQLModel, table=True):
    """Audit log for tracking all administrative actions."""
    __tablename__ = "audit_logs"

    id: str = Field(default_factory=generate_uuid, primary_key=True)

    # Who did it
    actor_id: str = Field(index=True)
    actor_type: str  # "user" | "system" | "api"
    actor_email: Optional[str] = None

    # What happened
    action: str = Field(index=True)  # "create" | "update" | "delete" | "block" | "regenerate"
    entity_type: str = Field(index=True)  # "key" | "team" | "user" | "model" | "budget" | "guardrail"
    entity_id: str = Field(index=True)
    entity_name: Optional[str] = None

    # Change details
    old_value: Optional[str] = None  # JSON
    new_value: Optional[str] = None  # JSON
    details: Optional[str] = None  # Additional JSON details

    ip_address: Optional[str] = None
    user_agent: Optional[str] = None

    organization_id: str = Field(foreign_key="organizations.id", index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)


class AWSProduct(SQLModel, table=True):
    """AWS product/model configuration."""
    __tablename__ = "aws_products"

    id: str = Field(default_factory=generate_uuid, primary_key=True)
    service: str = Field(index=True)  # "bedrock" | "sagemaker"
    model_id: str = Field(index=True)  # e.g., "anthropic.claude-3-sonnet-20240229-v1:0"
    display_name: str  # Human-readable name
    provider: str = Field(index=True)  # "anthropic" | "meta" | "amazon" | "mistral" | "cohere"

    # Regional availability
    region: str = Field(index=True)  # AWS region
    regions_available: Optional[str] = None  # JSON array of all regions

    # Pricing
    pricing_tier: str = Field(default="on_demand")  # "on_demand" | "provisioned" | "batch"
    input_cost_per_1k: float = Field(default=0.0)  # Cost per 1K input tokens
    output_cost_per_1k: float = Field(default=0.0)  # Cost per 1K output tokens

    # Capabilities
    max_tokens: int = Field(default=4096)
    supports_streaming: bool = Field(default=True)
    supports_vision: bool = Field(default=False)
    supports_function_calling: bool = Field(default=False)

    # For SageMaker endpoints
    endpoint_name: Optional[str] = None
    instance_type: Optional[str] = None
    instance_count: int = Field(default=1)

    organization_id: str = Field(foreign_key="organizations.id", index=True)
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class AWSUsageLog(SQLModel, table=True):
    """AWS-specific usage tracking (extends UsageLog with AWS details)."""
    __tablename__ = "aws_usage_logs"

    id: str = Field(default_factory=generate_uuid, primary_key=True)
    usage_log_id: str = Field(foreign_key="usage_logs.id", index=True)
    aws_product_id: str = Field(foreign_key="aws_products.id", index=True)

    # AWS-specific fields
    region: str = Field(index=True)
    cross_region: bool = Field(default=False)  # Was this a cross-region call?
    original_region: Optional[str] = None  # If cross-region, what was intended

    # Cost allocation
    cost_allocation_tag: Optional[str] = None  # AWS cost allocation tag
    business_unit: Optional[str] = None
    project_id: Optional[str] = None

    # Bedrock-specific
    guardrail_id: Optional[str] = None  # If Bedrock guardrail was applied
    inference_profile_id: Optional[str] = None

    # SageMaker-specific
    endpoint_name: Optional[str] = None

    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)


class CacheEntry(SQLModel, table=True):
    """Prompt cache entry for tracking cache performance."""
    __tablename__ = "cache_entries"

    id: str = Field(default_factory=generate_uuid, primary_key=True)
    prompt_hash: str = Field(index=True)  # Hash of the cached prompt
    model: str = Field(index=True)

    # Cache stats
    hit_count: int = Field(default=0)
    miss_count: int = Field(default=0)
    tokens_cached: int = Field(default=0)
    tokens_saved: int = Field(default=0)  # Total tokens saved from cache hits
    cost_saved_usd: float = Field(default=0.0)

    # TTL
    expires_at: Optional[datetime] = None

    organization_id: str = Field(foreign_key="organizations.id", index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_hit_at: Optional[datetime] = None


class CacheMetrics(SQLModel, table=True):
    """Aggregated cache metrics for dashboard."""
    __tablename__ = "cache_metrics"

    id: str = Field(default_factory=generate_uuid, primary_key=True)
    date: datetime = Field(index=True)  # Daily aggregation
    model: Optional[str] = None  # null = all models

    total_hits: int = Field(default=0)
    total_misses: int = Field(default=0)
    hit_rate: float = Field(default=0.0)
    tokens_saved: int = Field(default=0)
    cost_saved_usd: float = Field(default=0.0)

    organization_id: str = Field(foreign_key="organizations.id", index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)

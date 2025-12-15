#!/usr/bin/env python3
"""
Seed script for QuanXAI development database.
Generates realistic dummy data matching the mockup designs.

Usage: python scripts/seed_data.py
"""
import sys
import os

# Add the src directory to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from datetime import datetime, timedelta
from uuid import uuid4
import random
import hashlib
import json

from sqlmodel import Session, select
from sqlalchemy import text
from quanxai.database.engine import engine, create_db_and_tables
from quanxai.database.models import (
    Organization, Team, User, APIKey, UsageLog,
    Tag, Guardrail, GuardrailViolation, Budget, AuditLog,
    AWSProduct, AWSUsageLog, CacheEntry, CacheMetrics
)


# =============================================================================
# Configuration - Matching mockup numbers
# =============================================================================

# Target metrics from mockups
TARGET_TOTAL_SPEND = 18745.25  # $18,745.25
TARGET_TOTAL_REQUESTS = 283425  # 283,425
TARGET_TOKENS_PROCESSED = 185_200_000  # 185.2M
TARGET_SUCCESS_RATE = 0.943  # 94.3%

# Model distribution from mockups (Cost by Model pie chart)
MODEL_DISTRIBUTION = {
    "gpt-4": {"percentage": 0.30, "provider": "openai"},
    "gpt-4o": {"percentage": 0.20, "provider": "openai"},
    "claude-3-sonnet": {"percentage": 0.15, "provider": "anthropic"},
    "claude-3-haiku": {"percentage": 0.10, "provider": "anthropic"},
    "bedrock/claude-3-sonnet": {"percentage": 0.10, "provider": "bedrock"},
    "bedrock/claude-3-haiku": {"percentage": 0.08, "provider": "bedrock"},
    "llama-3-70b": {"percentage": 0.05, "provider": "meta"},
    "gemini-pro": {"percentage": 0.02, "provider": "google"},
}

# Model pricing (per 1M tokens) - input, output
MODEL_COSTS = {
    "gpt-4": (30.0, 60.0),
    "gpt-4o": (5.0, 15.0),
    "claude-3-sonnet": (3.0, 15.0),
    "claude-3-haiku": (0.25, 1.25),
    "bedrock/claude-3-sonnet": (3.0, 15.0),
    "bedrock/claude-3-haiku": (0.25, 1.25),
    "llama-3-70b": (0.9, 0.9),
    "gemini-pro": (0.5, 1.5),
}


# =============================================================================
# Teams Data (from mockups)
# =============================================================================

TEAMS_DATA = [
    {
        "name": "Engineering - AI Platform Team",
        "description": "Core AI infrastructure and platform development",
        "budget": 5000.0,
        "spend_percentage": 0.35,
    },
    {
        "name": "Data Science",
        "description": "ML research and model development",
        "budget": 8000.0,
        "spend_percentage": 0.28,
    },
    {
        "name": "Product Engineering",
        "description": "Customer-facing AI features",
        "budget": 3000.0,
        "spend_percentage": 0.18,
    },
    {
        "name": "DevOps & Infrastructure",
        "description": "Platform reliability and automation",
        "budget": 2000.0,
        "spend_percentage": 0.12,
    },
    {
        "name": "Customer Success",
        "description": "Customer support AI tools",
        "budget": 1500.0,
        "spend_percentage": 0.07,
    },
]


# =============================================================================
# Users Data (from mockups)
# =============================================================================

USERS_DATA = [
    {"name": "Sarah Chen", "email": "sarah.chen@company.com", "role": "Senior ML Engineer", "team_idx": 0, "spend_pct": 0.25},
    {"name": "Marcus Johnson", "email": "marcus.j@company.com", "role": "Staff Engineer", "team_idx": 0, "spend_pct": 0.22},
    {"name": "Alex Thompson", "email": "alex.t@company.com", "role": "AI Specialist", "team_idx": 0, "spend_pct": 0.18},
    {"name": "Emily Rodriguez", "email": "emily.r@company.com", "role": "Data Scientist", "team_idx": 1, "spend_pct": 0.35},
    {"name": "David Kim", "email": "david.kim@company.com", "role": "ML Engineer", "team_idx": 1, "spend_pct": 0.30},
    {"name": "Daniel Garcia", "email": "daniel.g@company.com", "role": "Research Scientist", "team_idx": 1, "spend_pct": 0.25},
    {"name": "Lisa Wang", "email": "lisa.w@company.com", "role": "Software Engineer", "team_idx": 2, "spend_pct": 0.40},
    {"name": "James Wilson", "email": "james.w@company.com", "role": "Senior Developer", "team_idx": 2, "spend_pct": 0.35},
    {"name": "Rachel Lee", "email": "rachel.l@company.com", "role": "Junior Developer", "team_idx": 2, "spend_pct": 0.15},
    {"name": "Anna Kowalski", "email": "anna.k@company.com", "role": "DevOps Engineer", "team_idx": 3, "spend_pct": 0.55},
    {"name": "Michael Brown", "email": "michael.b@company.com", "role": "Platform Engineer", "team_idx": 3, "spend_pct": 0.35},
    {"name": "Sophie Martin", "email": "sophie.m@company.com", "role": "Support Engineer", "team_idx": 4, "spend_pct": 0.70},
]


# =============================================================================
# Tags Data
# =============================================================================

TAGS_DATA = [
    {"name": "production", "color": "#10B981", "description": "Production workloads"},
    {"name": "development", "color": "#3B82F6", "description": "Development and testing"},
    {"name": "staging", "color": "#F59E0B", "description": "Staging environment"},
    {"name": "ml-training", "color": "#8B5CF6", "description": "ML model training"},
    {"name": "inference", "color": "#EC4899", "description": "Model inference"},
    {"name": "chatbot", "color": "#06B6D4", "description": "Chatbot applications"},
    {"name": "backend", "color": "#6366F1", "description": "Backend services"},
    {"name": "frontend", "color": "#14B8A6", "description": "Frontend applications"},
    {"name": "mobile", "color": "#F97316", "description": "Mobile applications"},
    {"name": "analytics", "color": "#84CC16", "description": "Analytics workloads"},
    {"name": "batch", "color": "#A855F7", "description": "Batch processing"},
    {"name": "realtime", "color": "#EF4444", "description": "Real-time processing"},
]


# =============================================================================
# Guardrails Data
# =============================================================================

GUARDRAILS_DATA = [
    {
        "name": "OpenAI Moderation",
        "type": "openai_moderation",
        "description": "OpenAI content moderation API",
        "config": {"categories": ["hate", "harassment", "self-harm", "sexual", "violence"]},
        "mode": "pre_call",
        "enabled": True,
    },
    {
        "name": "PII Detection",
        "type": "presidio",
        "description": "Detect and mask PII using Presidio",
        "config": {"entities": ["PERSON", "EMAIL_ADDRESS", "PHONE_NUMBER", "CREDIT_CARD", "SSN"]},
        "mode": "pre_call",
        "enabled": True,
    },
    {
        "name": "Prompt Injection Detection",
        "type": "prompt_injection",
        "description": "Detect prompt injection attacks",
        "config": {"sensitivity": "medium", "patterns": ["ignore previous", "system prompt"]},
        "mode": "pre_call",
        "enabled": True,
    },
    {
        "name": "AWS Bedrock Guardrail",
        "type": "bedrock",
        "description": "AWS Bedrock content filtering",
        "config": {"guardrail_id": "gr-abc123", "version": "1"},
        "mode": "during_call",
        "enabled": True,
    },
    {
        "name": "Toxic Language Filter",
        "type": "custom",
        "description": "Custom regex-based toxic language filter",
        "config": {"regex_patterns": ["profanity_list"]},
        "mode": "post_call",
        "enabled": True,
    },
    {
        "name": "Code Execution Prevention",
        "type": "custom",
        "description": "Prevent code execution in responses",
        "config": {"block_patterns": ["exec(", "eval(", "system("]},
        "mode": "post_call",
        "enabled": False,
    },
]


# =============================================================================
# AWS Products Data
# =============================================================================

AWS_BEDROCK_MODELS = [
    {
        "model_id": "anthropic.claude-3-5-sonnet-20241022-v2:0",
        "display_name": "Claude 3.5 Sonnet v2",
        "provider": "anthropic",
        "region": "us-east-1",
        "input_cost_per_1k": 0.003,
        "output_cost_per_1k": 0.015,
        "max_tokens": 200000,
        "supports_vision": True,
    },
    {
        "model_id": "anthropic.claude-3-haiku-20240307-v1:0",
        "display_name": "Claude 3 Haiku",
        "provider": "anthropic",
        "region": "us-east-1",
        "input_cost_per_1k": 0.00025,
        "output_cost_per_1k": 0.00125,
        "max_tokens": 200000,
        "supports_vision": True,
    },
    {
        "model_id": "meta.llama3-70b-instruct-v1:0",
        "display_name": "Llama 3 70B Instruct",
        "provider": "meta",
        "region": "us-east-1",
        "input_cost_per_1k": 0.00099,
        "output_cost_per_1k": 0.00099,
        "max_tokens": 8192,
        "supports_vision": False,
    },
    {
        "model_id": "amazon.titan-text-premier-v1:0",
        "display_name": "Amazon Titan Text Premier",
        "provider": "amazon",
        "region": "us-east-1",
        "input_cost_per_1k": 0.0005,
        "output_cost_per_1k": 0.0015,
        "max_tokens": 32000,
        "supports_vision": False,
    },
    {
        "model_id": "mistral.mistral-large-2407-v1:0",
        "display_name": "Mistral Large 2",
        "provider": "mistral",
        "region": "us-east-1",
        "input_cost_per_1k": 0.002,
        "output_cost_per_1k": 0.006,
        "max_tokens": 128000,
        "supports_vision": False,
    },
    {
        "model_id": "cohere.command-r-plus-v1:0",
        "display_name": "Cohere Command R+",
        "provider": "cohere",
        "region": "us-east-1",
        "input_cost_per_1k": 0.003,
        "output_cost_per_1k": 0.015,
        "max_tokens": 128000,
        "supports_vision": False,
    },
    {
        "model_id": "anthropic.claude-3-opus-20240229-v1:0",
        "display_name": "Claude 3 Opus",
        "provider": "anthropic",
        "region": "us-west-2",
        "input_cost_per_1k": 0.015,
        "output_cost_per_1k": 0.075,
        "max_tokens": 200000,
        "supports_vision": True,
    },
]

AWS_SAGEMAKER_ENDPOINTS = [
    {
        "model_id": "custom-llama-finetune",
        "display_name": "Custom Llama Fine-tuned",
        "endpoint_name": "llama-finetune-prod-endpoint",
        "instance_type": "ml.g5.12xlarge",
        "instance_count": 2,
        "region": "us-east-1",
    },
    {
        "model_id": "embedding-model-v2",
        "display_name": "Text Embedding Model v2",
        "endpoint_name": "embedding-v2-endpoint",
        "instance_type": "ml.g4dn.xlarge",
        "instance_count": 4,
        "region": "us-east-1",
    },
    {
        "model_id": "classification-model",
        "display_name": "Document Classification",
        "endpoint_name": "doc-classifier-endpoint",
        "instance_type": "ml.m5.xlarge",
        "instance_count": 2,
        "region": "us-west-2",
    },
    {
        "model_id": "ner-model",
        "display_name": "Named Entity Recognition",
        "endpoint_name": "ner-prod-endpoint",
        "instance_type": "ml.g4dn.xlarge",
        "instance_count": 1,
        "region": "us-east-1",
    },
    {
        "model_id": "sentiment-model",
        "display_name": "Sentiment Analysis",
        "endpoint_name": "sentiment-endpoint",
        "instance_type": "ml.m5.large",
        "instance_count": 3,
        "region": "eu-west-1",
    },
]


def generate_api_key() -> tuple[str, str, str]:
    """Generate API key, hash, and prefix."""
    key = f"sk-quanxai-{uuid4().hex}"
    key_hash = hashlib.sha256(key.encode()).hexdigest()
    key_prefix = f"sk-{key[12:16]}-****"
    return key, key_hash, key_prefix


def seed_organization(session: Session) -> Organization:
    """Create the main organization."""
    org = Organization(
        id=str(uuid4()),
        name="Acme Corp",
        description="Enterprise AI solutions powered by QuanXAI",
        monthly_budget_usd=25000.0,
        total_budget_usd=300000.0,
    )
    session.add(org)
    session.commit()
    session.refresh(org)
    print(f"Created organization: {org.name}")
    return org


def seed_teams(session: Session, org: Organization) -> list[Team]:
    """Create teams for the organization."""
    teams = []
    for team_data in TEAMS_DATA:
        team = Team(
            id=str(uuid4()),
            organization_id=org.id,
            name=team_data["name"],
            description=team_data["description"],
            monthly_budget_usd=team_data["budget"],
        )
        teams.append(team)
        session.add(team)

    session.commit()
    for team in teams:
        session.refresh(team)

    print(f"Created {len(teams)} teams")
    return teams


def seed_users(session: Session, teams: list[Team]) -> list[User]:
    """Create users assigned to teams."""
    users = []
    for user_data in USERS_DATA:
        user = User(
            id=str(uuid4()),
            team_id=teams[user_data["team_idx"]].id,
            email=user_data["email"],
            name=user_data["name"],
            role=user_data["role"],
            monthly_budget_usd=500.0,
        )
        users.append(user)
        session.add(user)

    session.commit()
    for user in users:
        session.refresh(user)

    print(f"Created {len(users)} users")
    return users


def seed_tags(session: Session, org: Organization) -> list[Tag]:
    """Create tags for cost allocation."""
    tags = []
    for tag_data in TAGS_DATA:
        tag = Tag(
            id=str(uuid4()),
            name=tag_data["name"],
            description=tag_data["description"],
            color=tag_data["color"],
            organization_id=org.id,
        )
        tags.append(tag)
        session.add(tag)

    session.commit()
    for tag in tags:
        session.refresh(tag)

    print(f"Created {len(tags)} tags")
    return tags


def seed_api_keys(session: Session, org: Organization, teams: list[Team], users: list[User], tags: list[Tag]) -> list[tuple[APIKey, str]]:
    """Create API keys at various levels."""
    keys = []

    # Org-level master key
    raw_key, key_hash, prefix = generate_api_key()
    api_key = APIKey(
        id=str(uuid4()),
        key_hash=key_hash,
        key_prefix=prefix,
        alias="Acme Corp Master Key",
        organization_id=org.id,
        rate_limit_rpm=1000,
        rate_limit_tpm=1000000,
        max_budget_usd=10000,
        tags=json.dumps([tags[0].id]),  # production tag
    )
    keys.append((api_key, raw_key))
    session.add(api_key)

    # Team-level keys
    for i, team in enumerate(teams):
        raw_key, key_hash, prefix = generate_api_key()
        tag_ids = [tags[i % len(tags)].id, tags[(i + 1) % len(tags)].id]
        api_key = APIKey(
            id=str(uuid4()),
            key_hash=key_hash,
            key_prefix=prefix,
            alias=f"{team.name} Key",
            team_id=team.id,
            rate_limit_rpm=500,
            rate_limit_tpm=500000,
            max_budget_usd=team.monthly_budget_usd,
            tags=json.dumps(tag_ids),
        )
        keys.append((api_key, raw_key))
        session.add(api_key)

    # User-level keys
    for i, user in enumerate(users):
        raw_key, key_hash, prefix = generate_api_key()
        expires_at = datetime.utcnow() + timedelta(days=random.choice([30, 60, 90, 180, 365]))
        tag_ids = [tags[i % len(tags)].id]
        api_key = APIKey(
            id=str(uuid4()),
            key_hash=key_hash,
            key_prefix=prefix,
            alias=f"{user.name}'s Key",
            user_id=user.id,
            rate_limit_rpm=100,
            rate_limit_tpm=100000,
            max_budget_usd=user.monthly_budget_usd,
            expires_at=expires_at if random.random() > 0.5 else None,
            tags=json.dumps(tag_ids),
        )
        keys.append((api_key, raw_key))
        session.add(api_key)

    # Additional keys for variety
    for i in range(30):
        raw_key, key_hash, prefix = generate_api_key()
        team = random.choice(teams)
        user = random.choice(users)
        tag_ids = [random.choice(tags).id for _ in range(random.randint(1, 3))]

        api_key = APIKey(
            id=str(uuid4()),
            key_hash=key_hash,
            key_prefix=prefix,
            alias=f"Service Key {i + 1}",
            team_id=team.id,
            user_id=user.id if random.random() > 0.5 else None,
            rate_limit_rpm=random.choice([50, 100, 200, 500]),
            rate_limit_tpm=random.choice([50000, 100000, 200000, 500000]),
            max_budget_usd=random.choice([100, 500, 1000, 2000, 5000]),
            is_blocked=random.random() < 0.05,  # 5% blocked
            tags=json.dumps(tag_ids),
        )
        keys.append((api_key, raw_key))
        session.add(api_key)

    session.commit()
    print(f"Created {len(keys)} API keys")
    return keys


def seed_guardrails(session: Session, org: Organization) -> list[Guardrail]:
    """Create guardrails for content moderation."""
    guardrails = []
    for g_data in GUARDRAILS_DATA:
        guardrail = Guardrail(
            id=str(uuid4()),
            name=g_data["name"],
            type=g_data["type"],
            description=g_data["description"],
            config=json.dumps(g_data["config"]),
            mode=g_data["mode"],
            enabled=g_data["enabled"],
            organization_id=org.id,
        )
        guardrails.append(guardrail)
        session.add(guardrail)

    session.commit()
    for g in guardrails:
        session.refresh(g)

    print(f"Created {len(guardrails)} guardrails")
    return guardrails


def seed_guardrail_violations(session: Session, guardrails: list[Guardrail], api_keys: list[tuple[APIKey, str]]):
    """Create guardrail violations."""
    violation_types = ["hate_speech", "pii_detected", "prompt_injection", "toxic_language", "self_harm", "violence"]
    severities = ["low", "medium", "high"]

    violations = []
    for _ in range(200):
        guardrail = random.choice(guardrails)
        api_key, _ = random.choice(api_keys)

        violation = GuardrailViolation(
            id=str(uuid4()),
            guardrail_id=guardrail.id,
            request_id=str(uuid4()),
            api_key_id=api_key.id,
            violation_type=random.choice(violation_types),
            severity=random.choice(severities),
            blocked=random.random() > 0.3,  # 70% blocked
            details=json.dumps({
                "matched_pattern": "example pattern",
                "confidence": round(random.uniform(0.7, 1.0), 2),
            }),
            created_at=datetime.utcnow() - timedelta(
                days=random.randint(0, 30),
                hours=random.randint(0, 23),
            ),
        )
        violations.append(violation)
        session.add(violation)

    session.commit()
    print(f"Created {len(violations)} guardrail violations")


def seed_budgets(session: Session, org: Organization, teams: list[Team], users: list[User], api_keys: list[tuple[APIKey, str]]) -> list[Budget]:
    """Create budgets for various entities."""
    budgets = []

    # Team budgets
    for team in teams:
        spent = team.monthly_budget_usd * random.uniform(0.3, 0.95)
        budget = Budget(
            id=str(uuid4()),
            name=f"{team.name} Monthly Budget",
            description=f"Monthly budget for {team.name}",
            max_budget_usd=team.monthly_budget_usd,
            period="monthly",
            alert_threshold=0.8,
            entity_type="team",
            entity_id=team.id,
            spent_usd=spent,
            organization_id=org.id,
        )
        budgets.append(budget)
        session.add(budget)

    # User budgets
    for user in users[:5]:  # First 5 users
        spent = user.monthly_budget_usd * random.uniform(0.2, 1.1)
        budget = Budget(
            id=str(uuid4()),
            name=f"{user.name}'s Budget",
            description=f"Monthly budget for {user.name}",
            max_budget_usd=user.monthly_budget_usd,
            period="monthly",
            alert_threshold=0.75,
            entity_type="user",
            entity_id=user.id,
            spent_usd=spent,
            organization_id=org.id,
        )
        budgets.append(budget)
        session.add(budget)

    # Key budgets
    for api_key, _ in api_keys[:3]:
        spent = api_key.max_budget_usd * random.uniform(0.1, 0.8)
        budget = Budget(
            id=str(uuid4()),
            name=f"Key Budget: {api_key.alias}",
            description=f"Budget for API key {api_key.alias}",
            max_budget_usd=api_key.max_budget_usd,
            period="monthly",
            alert_threshold=0.9,
            entity_type="key",
            entity_id=api_key.id,
            spent_usd=spent,
            organization_id=org.id,
        )
        budgets.append(budget)
        session.add(budget)

    session.commit()
    for b in budgets:
        session.refresh(b)

    print(f"Created {len(budgets)} budgets")
    return budgets


def seed_aws_products(session: Session, org: Organization) -> tuple[list[AWSProduct], list[AWSProduct]]:
    """Create AWS Bedrock models and SageMaker endpoints."""
    bedrock_products = []
    sagemaker_products = []

    # Bedrock models
    for model in AWS_BEDROCK_MODELS:
        product = AWSProduct(
            id=str(uuid4()),
            service="bedrock",
            model_id=model["model_id"],
            display_name=model["display_name"],
            provider=model["provider"],
            region=model["region"],
            regions_available=json.dumps(["us-east-1", "us-west-2", "eu-west-1"]),
            pricing_tier="on_demand",
            input_cost_per_1k=model["input_cost_per_1k"],
            output_cost_per_1k=model["output_cost_per_1k"],
            max_tokens=model["max_tokens"],
            supports_vision=model.get("supports_vision", False),
            organization_id=org.id,
        )
        bedrock_products.append(product)
        session.add(product)

    # SageMaker endpoints
    for endpoint in AWS_SAGEMAKER_ENDPOINTS:
        product = AWSProduct(
            id=str(uuid4()),
            service="sagemaker",
            model_id=endpoint["model_id"],
            display_name=endpoint["display_name"],
            provider="custom",
            region=endpoint["region"],
            endpoint_name=endpoint["endpoint_name"],
            instance_type=endpoint["instance_type"],
            instance_count=endpoint["instance_count"],
            input_cost_per_1k=0.001,
            output_cost_per_1k=0.001,
            organization_id=org.id,
        )
        sagemaker_products.append(product)
        session.add(product)

    session.commit()
    print(f"Created {len(bedrock_products)} Bedrock models and {len(sagemaker_products)} SageMaker endpoints")
    return bedrock_products, sagemaker_products


def seed_audit_logs(session: Session, org: Organization, users: list[User], teams: list[Team], api_keys: list[tuple[APIKey, str]]):
    """Create audit log entries."""
    actions = ["create", "update", "delete", "block", "unblock", "regenerate"]
    entity_types = ["key", "team", "user", "model", "budget", "guardrail"]

    audit_logs = []
    for _ in range(500):
        user = random.choice(users)
        action = random.choice(actions)
        entity_type = random.choice(entity_types)

        if entity_type == "key":
            key, _ = random.choice(api_keys)
            entity_id = key.id
            entity_name = key.alias
        elif entity_type == "team":
            team = random.choice(teams)
            entity_id = team.id
            entity_name = team.name
        elif entity_type == "user":
            target_user = random.choice(users)
            entity_id = target_user.id
            entity_name = target_user.name
        else:
            entity_id = str(uuid4())
            entity_name = f"Entity {random.randint(1, 100)}"

        audit_log = AuditLog(
            id=str(uuid4()),
            actor_id=user.id,
            actor_type="user",
            actor_email=user.email,
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            entity_name=entity_name,
            details=json.dumps({"reason": "Routine maintenance"}) if random.random() > 0.5 else None,
            ip_address=f"192.168.1.{random.randint(1, 255)}",
            organization_id=org.id,
            created_at=datetime.utcnow() - timedelta(
                days=random.randint(0, 30),
                hours=random.randint(0, 23),
            ),
        )
        audit_logs.append(audit_log)
        session.add(audit_log)

    session.commit()
    print(f"Created {len(audit_logs)} audit log entries")


def seed_cache_entries(session: Session, org: Organization):
    """Create cache entries and metrics."""
    models = list(MODEL_DISTRIBUTION.keys())

    # Cache entries
    cache_entries = []
    for _ in range(100):
        model = random.choice(models)
        entry = CacheEntry(
            id=str(uuid4()),
            prompt_hash=hashlib.sha256(str(uuid4()).encode()).hexdigest()[:16],
            model=model,
            hit_count=random.randint(1, 500),
            miss_count=random.randint(0, 50),
            tokens_cached=random.randint(100, 5000),
            tokens_saved=random.randint(1000, 50000),
            cost_saved_usd=random.uniform(0.1, 10.0),
            organization_id=org.id,
            created_at=datetime.utcnow() - timedelta(days=random.randint(0, 30)),
            last_hit_at=datetime.utcnow() - timedelta(hours=random.randint(0, 48)),
        )
        cache_entries.append(entry)
        session.add(entry)

    # Cache metrics (daily aggregates)
    cache_metrics = []
    for day_offset in range(30):
        date = datetime.utcnow() - timedelta(days=day_offset)
        metrics = CacheMetrics(
            id=str(uuid4()),
            date=date.replace(hour=0, minute=0, second=0, microsecond=0),
            total_hits=random.randint(5000, 15000),
            total_misses=random.randint(1000, 5000),
            hit_rate=random.uniform(0.65, 0.85),
            tokens_saved=random.randint(500000, 2000000),
            cost_saved_usd=random.uniform(50, 200),
            organization_id=org.id,
        )
        cache_metrics.append(metrics)
        session.add(metrics)

    session.commit()
    print(f"Created {len(cache_entries)} cache entries and {len(cache_metrics)} daily metrics")


def seed_usage_logs(
    session: Session,
    org: Organization,
    teams: list[Team],
    users: list[User],
    api_keys: list[tuple[APIKey, str]],
    tags: list[Tag],
    aws_products: list[AWSProduct],
    days: int = 30
):
    """Generate usage logs that match the mockup metrics."""
    print(f"Generating usage logs for {days} days...")

    requests_per_day = TARGET_TOTAL_REQUESTS // days
    user_api_keys = [(k, raw) for k, raw in api_keys if k.user_id is not None]

    total_spend = 0
    total_requests = 0
    total_tokens = 0
    logs_created = 0
    aws_usage_logs = []

    for day_offset in range(days, 0, -1):
        date = datetime.utcnow() - timedelta(days=day_offset)

        is_weekday = date.weekday() < 5
        day_multiplier = 1.2 if is_weekday else 0.6
        day_requests = int(requests_per_day * day_multiplier * random.uniform(0.8, 1.2))

        for _ in range(day_requests):
            model = random.choices(
                list(MODEL_DISTRIBUTION.keys()),
                weights=[m["percentage"] for m in MODEL_DISTRIBUTION.values()]
            )[0]

            provider = MODEL_DISTRIBUTION[model]["provider"]
            input_cost, output_cost = MODEL_COSTS[model]

            api_key, _ = random.choice(user_api_keys)
            user_id = api_key.user_id

            # Find user's team
            team_id = None
            for u in users:
                if u.id == user_id:
                    team_id = u.team_id
                    break

            prompt_tokens = random.randint(100, 3000)
            completion_tokens = random.randint(50, 1500)
            total_tok = prompt_tokens + completion_tokens

            prompt_cost = (prompt_tokens / 1_000_000) * input_cost
            completion_cost = (completion_tokens / 1_000_000) * output_cost
            total_cost = prompt_cost + completion_cost

            cache_read = random.randint(0, prompt_tokens // 3) if random.random() < 0.2 else 0
            cache_creation = random.randint(0, 300) if random.random() < 0.1 else 0

            is_success = random.random() < TARGET_SUCCESS_RATE

            base_latency = {"gpt-4": 2500, "gpt-4o": 1500, "claude-3-sonnet": 1800, "claude-3-haiku": 800,
                          "bedrock/claude-3-sonnet": 1900, "bedrock/claude-3-haiku": 850, "llama-3-70b": 1200, "gemini-pro": 1500}
            latency = int(base_latency.get(model, 2000) * random.uniform(0.5, 2.0))

            # Assign tags
            log_tags = [random.choice(tags).id for _ in range(random.randint(0, 2))]

            log = UsageLog(
                id=str(uuid4()),
                request_id=str(uuid4()),
                api_key_id=api_key.id,
                organization_id=org.id,
                team_id=team_id,
                user_id=user_id,
                model_requested=model,
                model_used=model,
                provider=provider,
                prompt_tokens=prompt_tokens,
                completion_tokens=completion_tokens,
                total_tokens=total_tok,
                cache_read_tokens=cache_read,
                cache_creation_tokens=cache_creation,
                prompt_cost_usd=prompt_cost,
                completion_cost_usd=completion_cost,
                total_cost_usd=total_cost,
                latency_ms=latency,
                is_streaming=random.random() < 0.3,
                is_success=is_success,
                error_type="rate_limit" if not is_success else None,
                status_code=200 if is_success else 429,
                tags=json.dumps(log_tags) if log_tags else None,
                created_at=date + timedelta(
                    hours=random.randint(8, 20),
                    minutes=random.randint(0, 59),
                    seconds=random.randint(0, 59)
                ),
            )
            session.add(log)
            logs_created += 1
            total_spend += total_cost
            total_requests += 1
            total_tokens += total_tok

            # Create AWS usage log for bedrock models
            if provider == "bedrock" and aws_products:
                aws_product = random.choice([p for p in aws_products if p.service == "bedrock"])
                aws_log = AWSUsageLog(
                    id=str(uuid4()),
                    usage_log_id=log.id,
                    aws_product_id=aws_product.id,
                    region=random.choice(["us-east-1", "us-west-2", "eu-west-1"]),
                    cross_region=random.random() < 0.1,
                    cost_allocation_tag=random.choice(["production", "development", "staging"]),
                    business_unit=random.choice(["Engineering", "Data Science", "Product"]),
                    project_id=f"proj-{random.randint(1000, 9999)}",
                    created_at=log.created_at,
                )
                aws_usage_logs.append(aws_log)
                session.add(aws_log)

        if day_offset % 5 == 0:
            session.commit()
            print(f"  Day {days - day_offset + 1}/{days}: {logs_created} logs, ${total_spend:.2f} spend")

    session.commit()

    print(f"\nUsage logs summary:")
    print(f"  Total logs: {logs_created}")
    print(f"  Total spend: ${total_spend:.2f} (target: ${TARGET_TOTAL_SPEND:.2f})")
    print(f"  AWS usage logs: {len(aws_usage_logs)}")


def main():
    """Run the complete seeding process."""
    print("=" * 60)
    print("QuanXAI Database Seeding")
    print("=" * 60)
    print()

    print("Creating database tables...")
    create_db_and_tables()
    print("Tables created successfully")
    print()

    with Session(engine) as session:
        # Check if data already exists
        existing_orgs = session.exec(select(Organization)).first()
        if existing_orgs:
            print("Database already contains data. Clearing existing data...")
            # Clear in reverse order of dependencies
            session.exec(text("DELETE FROM aws_usage_logs"))
            session.exec(text("DELETE FROM cache_metrics"))
            session.exec(text("DELETE FROM cache_entries"))
            session.exec(text("DELETE FROM audit_logs"))
            session.exec(text("DELETE FROM guardrail_violations"))
            session.exec(text("DELETE FROM budgets"))
            session.exec(text("DELETE FROM guardrails"))
            session.exec(text("DELETE FROM aws_products"))
            session.exec(text("DELETE FROM usage_logs"))
            session.exec(text("DELETE FROM api_keys"))
            session.exec(text("DELETE FROM tags"))
            session.exec(text("DELETE FROM users"))
            session.exec(text("DELETE FROM teams"))
            session.exec(text("DELETE FROM organizations"))
            session.commit()
            print("Existing data cleared")
            print()

        # Seed in order (respecting foreign keys)
        org = seed_organization(session)
        teams = seed_teams(session, org)
        users = seed_users(session, teams)
        tags = seed_tags(session, org)
        api_keys = seed_api_keys(session, org, teams, users, tags)
        guardrails = seed_guardrails(session, org)
        seed_guardrail_violations(session, guardrails, api_keys)
        budgets = seed_budgets(session, org, teams, users, api_keys)
        bedrock_products, sagemaker_products = seed_aws_products(session, org)
        seed_audit_logs(session, org, users, teams, api_keys)
        seed_cache_entries(session, org)
        seed_usage_logs(session, org, teams, users, api_keys, tags, bedrock_products + sagemaker_products, days=30)

    print()
    print("=" * 60)
    print("Seeding complete!")
    print("=" * 60)
    print()
    print("Sample API keys for testing:")
    for api_key, raw_key in api_keys[:3]:
        print(f"  {api_key.alias}: {raw_key}")


if __name__ == "__main__":
    main()

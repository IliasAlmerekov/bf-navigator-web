---
name: api-gateway-architecture
description: Use this skill when designing or integrating frontend applications (React, Vue, mobile, SSR) with an API Gateway. Focus on simplifying client-server interaction, reducing network complexity, improving performance, and ensuring a stable API contract between frontend and backend systems.
---

# API Gateway for Frontend Applications

## Purpose

This skill helps design and integrate an API Gateway specifically from a frontend perspective.

Use it when:

- connecting frontend apps to multiple backend services
- simplifying API consumption in frontend code
- designing BFF (Backend for Frontend)
- optimizing frontend performance (latency, request count)
- handling authentication and session flows via gateway
- designing stable API contracts for UI teams

---

## Core Idea

Frontend should NEVER deal with:

- multiple microservices
- complex routing logic
- inconsistent APIs

Instead:

Frontend → API Gateway → Services

---

## Key Benefits for Frontend

### Single Entry Point

Frontend calls ONE API:
GET /api/user
GET /api/orders

---

### Reduced Complexity

Frontend does NOT need to know:

- service locations
- service boundaries

---

### Stable Contract

Gateway provides:

- consistent response formats
- versioning control
- backward compatibility

---

### Request Aggregation (BFF)

Frontend:
→ /dashboard

Returns:
{
"user": {},
"orders": [],
"notifications": []
}

---

### Performance Optimization

Gateway can:

- reduce number of requests
- cache responses
- compress payloads

---

## Responsibilities

Gateway SHOULD handle:

- routing
- authentication
- aggregation (BFF)
- caching
- CORS

Gateway SHOULD NOT handle:

- business logic
- database access

---

## Architecture

User
↓
CDN
↓
Frontend
↓
API Gateway
↓
Backend Services

---

## Common Mistakes

- frontend calling multiple services directly
- no caching
- overloading gateway with logic
- breaking API contracts

---

## Codex Workflow

1. Detect multiple backend services
2. Suggest API Gateway
3. Design endpoints from UI perspective
4. Reduce request count
5. Add caching
6. Ensure stability

---

## Quick Template

Conclusion:
Use API Gateway (BFF)

Architecture:
Frontend → Gateway → Services

Features:

- routing
- auth
- caching

Risks:

- bottleneck
- tight coupling

MVP:

1. add gateway
2. basic routing
3. auth

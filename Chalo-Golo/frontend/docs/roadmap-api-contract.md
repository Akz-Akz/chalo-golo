# Roadmap Generation API Contract

This is the backend contract used by `generateRoadmapWithBackend()` in `src/lib/roadmapEngine.js`.

- Frontend env key: `VITE_ROADMAP_API_URL`
- Method: `POST`
- Content type: `application/json`

## Endpoint

`POST /api/roadmap/generate`

## Request Body

```json
{
  "goal": "Build a traveler mobile app",
  "thoughtData": {
    "goal": "Build a traveler mobile app",
    "familiarity": 2,
    "why": ["startup", "freelance"],
    "timeline": "6months",
    "blockers": ["time", "complexity"],
    "dedication": "committed"
  },
  "profile": {
    "id": "7f31f9af-7fd9-4c53-b4b8-9b71f9d5b1b9",
    "email": "user@example.com",
    "weeklyHours": "4-8",
    "finance": "moderate",
    "learningStyle": "visual",
    "techLevel": "basic"
  }
}
```

## Response Body (required shape)

```json
{
  "domain": "mobile",
  "domainLabel": "Mobile App Development",
  "domainEmoji": "📱",
  "goal": "Build a traveler mobile app",
  "phases": [
    {
      "name": "Mobile Fundamentals",
      "duration": "4 weeks",
      "adjustedWeeks": 4,
      "totalHours": 17,
      "status": "active",
      "modules": [
        {
          "title": "Intro to Mobile UX",
          "type": "Article",
          "platform": "Google Material",
          "hours": 3,
          "url": "https://m3.material.io/foundations",
          "done": true
        }
      ]
    }
  ],
  "resources": [
    {
      "title": "React Native Docs",
      "platform": "reactnative.dev",
      "type": "Docs",
      "price": "Free",
      "rating": 4.8,
      "url": "https://reactnative.dev/docs/getting-started"
    }
  ],
  "projects": [
    {
      "title": "Travel Planner App",
      "difficulty": "Intermediate",
      "time": "18 hrs",
      "tech": ["Flutter", "Firebase"],
      "desc": "Plan trips, save destinations, offline mode"
    }
  ],
  "totalWeeks": 17,
  "totalHours": 74,
  "weeklyHours": 6,
  "realityCheck": {
    "score": 71,
    "verdict": "Feasible with adjustments",
    "verdictColor": "#d97706",
    "verdictBg": "#fef3c7",
    "timelineGap": {
      "severity": "warning",
      "title": "Timeline Reality Gap",
      "message": "You want results in ~6 months but at 6 hrs/week this path realistically takes ~8 months. We've recalibrated."
    },
    "viableMilestones": [
      { "time": "Month 1", "item": "Complete Mobile Fundamentals phase" },
      { "time": "Month 4+", "item": "Publish app to Play Store / App Store" }
    ],
    "adjustments": [
      "Prioritized free resources over paid ones",
      "Added buffer weeks for missed sessions (auto-recovery)"
    ],
    "userExpectedMonths": 6,
    "estimatedMonths": 8
  },
  "generatedAt": "2026-04-10T01:00:00.000Z"
}
```

## Validation Rules

- Response **must** include: `phases`, `resources`, `projects`, `realityCheck`.
- `realityCheck.score` should be integer `0..100`.
- `phases[].modules[].url` can be `null`, but if present must be a valid absolute URL.
- `status` values should be one of: `active`, `locked`, `done`.

If validation fails, frontend falls back to local generator in `roadmapEngine.js`.

## Recommended Backend Behavior

- Use auth middleware; map user context from JWT if available.
- Cache identical requests for short TTL (30-120 seconds) to reduce AI latency/cost.
- Return deterministic JSON structure even if model output varies.
- Keep roadmaps domain-specific (no defaulting all ideas to AI/ML).
- Emit resource links with full `https://` URLs.
- Use AI generation with strict JSON output and fallback to deterministic local logic.

## Error Contract

- `400`: invalid payload
- `401`: unauthorized (if route is protected)
- `429`: rate limit
- `500`: generation failure

Error body format:

```json
{
  "error": {
    "code": "INVALID_PAYLOAD",
    "message": "thoughtData.goal is required"
  }
}
```

## Minimal cURL Test

```bash
curl -X POST "$VITE_ROADMAP_API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "goal":"Build a traveler app",
    "thoughtData":{"goal":"Build a traveler app","familiarity":1,"timeline":"6months","blockers":["time"],"dedication":"serious"},
    "profile":{"weeklyHours":"4-8","finance":"tight","learningStyle":"visual"}
  }'
```

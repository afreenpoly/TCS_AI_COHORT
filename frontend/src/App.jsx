import { useState, useRef } from "react";
import "./App.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

// ─── Mock data for UI development ────────────────────────────────────────────
const USE_MOCK = true; // set to false to use the real Groq API

function getMockResult(code) {
  const len = code.length;
  // Vary scores based on code length so results feel dynamic
  const seed = len % 100;
  const secScore = 45 + (seed % 40);
  const perfScore = 30 + (seed % 55);
  const qualScore = 60 + (seed % 30);
  const testScore = 20 + (seed % 50);
  const overall = Math.round(
    (secScore + perfScore + qualScore + testScore) / 4,
  );

  return {
    security: {
      agent: "Security Auditor",
      score: secScore,
      issues: [
        "Hardcoded credentials detected in config block",
        "SQL query built with string concatenation (injection risk)",
        "No input sanitization on user-supplied parameters",
      ],
      recommendations: [
        "Use environment variables for all secrets",
        "Switch to parameterized queries or an ORM",
        "Validate and sanitize all external input",
      ],
    },
    performance: {
      agent: "Performance Analyzer",
      score: perfScore,
      issues: [
        "O(n²) nested loop in processItems() — consider a hash map",
        "Redundant DB call inside a loop (N+1 query pattern)",
        "Large object cloned on every render — memoize or move outside",
      ],
      recommendations: [
        "Refactor nested loop to O(n) with a lookup table",
        "Batch DB queries and cache repeated lookups",
        "Memoize expensive computations with useMemo / cache layer",
      ],
    },
    quality: {
      agent: "Code Quality Judge",
      score: qualScore,
      issues: [
        "Function doStuff() lacks a descriptive name and inline docs",
        "Magic numbers (42, 7, 1000) sprinkled throughout — extract as constants",
      ],
      recommendations: [
        "Rename functions to reflect intent; add JSDoc comments",
        "Extract magic numbers into named constants at the top of the file",
        "Split god-functions > 60 lines into focused single-responsibility units",
      ],
    },
    testing: {
      agent: "Test Coverage Advisor",
      score: testScore,
      issues: [
        "No unit tests found for core business logic",
        "Edge cases (empty input, null, overflow) not covered",
        "No integration tests for the API layer",
      ],
      recommendations: [
        "Add unit tests for every public function using Jest / Vitest",
        "Cover null, empty, and boundary-value inputs explicitly",
        "Add at least one end-to-end test for the critical user path",
      ],
    },
    verdict: {
      overall_score: overall,
      deployment_ready: overall >= 65,
      summary:
        overall >= 65
          ? "The code is in reasonable shape but has a few issues worth addressing before a production release. Security and test coverage need the most attention."
          : "Several critical issues need to be resolved before this code is production-ready. Focus on security hardening and adding test coverage first.",
      priority_fixes: [
        "Remove hardcoded secrets and move them to environment variables",
        "Fix the N+1 query pattern — batch or cache DB lookups",
        "Add input validation and sanitize all user-supplied data",
        "Write unit tests for the core business logic before merging",
      ],
      cleaned_code: "// cleaned code would appear here",
    },
  };
}

async function mockFetch(code) {
  // Simulate network delay (1–2 s) so loading states are visible
  await new Promise((r) => setTimeout(r, 1200 + Math.random() * 800));
  return getMockResult(code);
}
// ─────────────────────────────────────────────────────────────────────────────

function scoreColor(s) {
  if (s >= 75) return "var(--cr-green)";
  if (s >= 50) return "var(--cr-amber)";
  if (s >= 25) return "var(--cr-orange)";
  return "var(--cr-red)";
}

function scoreLabel(s) {
  if (s >= 75) return "Good";
  if (s >= 50) return "Average";
  if (s >= 25) return "Poor";
  return "Critical";
}

function ScoreRing({ score }) {
  const r = 22;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(Math.max(score, 0), 100);
  const offset = circ - (pct / 100) * circ;

  return (
    <div className="cr-ring-wrap">
      <svg width="52" height="52" viewBox="0 0 52 52">
        <circle className="cr-ring-bg" cx="26" cy="26" r={r} />
        <circle
          className="cr-ring-val"
          cx="26"
          cy="26"
          r={r}
          stroke={scoreColor(score)}
          strokeDasharray={`${circ}`}
          strokeDashoffset={`${offset}`}
        />
      </svg>
      <div className="cr-ring-num">{pct}</div>
    </div>
  );
}

const AGENTS = [
  { key: "security", label: "Security", icon: "ti-lock" },
  { key: "performance", label: "Performance", icon: "ti-bolt" },
  { key: "quality", label: "Code quality", icon: "ti-sparkles" },
  { key: "testing", label: "Test coverage", icon: "ti-test-pipe" },
];

function AgentRow({ agentKey, data }) {
  const cfg = AGENTS.find((a) => a.key === agentKey);
  const score = typeof data?.score === "number" ? data.score : 0;
  const issues = (data?.issues ?? []).slice(0, 3);

  return (
    <div className="cr-agent-row">
      <ScoreRing score={score} />
      <div className="cr-agent-info">
        <div className="cr-agent-name">
          <i className={`ti ${cfg.icon}`} aria-hidden="true" />
          {cfg.label}
        </div>
        <div className="cr-agent-label" style={{ color: scoreColor(score) }}>
          {scoreLabel(score)}
        </div>
        {issues.length > 0 && (
          <div className="cr-chips">
            {issues.map((iss, i) => (
              <span key={i} className="cr-chip">
                {iss}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Verdict({ data }) {
  if (!data) return null;
  const ready = data.deployment_ready;
  const fixes = (data.priority_fixes ?? []).slice(0, 4);

  return (
    <div className="cr-verdict">
      <div className="cr-verdict-top">
        <div>
          <div className="cr-verdict-sublabel">Overall score</div>
          <div
            className="cr-verdict-score"
            style={{ color: scoreColor(data.overall_score ?? 0) }}
          >
            {data.overall_score ?? 0}
            <span className="cr-verdict-outof">/100</span>
          </div>
        </div>
        <span className={`cr-badge ${ready ? "cr-badge-yes" : "cr-badge-no"}`}>
          <i
            className={`ti ${ready ? "ti-check" : "ti-x"}`}
            aria-hidden="true"
          />
          {ready ? "Deploy ready" : "Not ready"}
        </span>
      </div>

      {data.summary && <p className="cr-verdict-summary">{data.summary}</p>}

      {fixes.length > 0 && (
        <div className="cr-fixes">
          <div className="cr-fixes-label">Priority fixes</div>
          {fixes.map((fix, i) => (
            <div key={i} className="cr-fix">
              <i className="ti ti-alert-triangle" aria-hidden="true" />
              <span>{fix}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="cr-panel-body cr-empty">
      <i className="ti ti-chart-radar" aria-hidden="true" />
      <p>
        Paste your code and click <strong>Run analysis</strong> to see results.
      </p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="cr-panel-body cr-loading">
      <div className="cr-spinner" />
      <p className="cr-loading-msg">
        Running 4 AI agents
        <br />
        <span>Security · Performance · Quality · Tests</span>
      </p>
    </div>
  );
}

function ErrorState({ message }) {
  return (
    <div className="cr-panel-body cr-error-state">
      <i className="ti ti-wifi-off" aria-hidden="true" />
      <p>Could not reach the backend.</p>
      <p className="cr-error-detail">{message}</p>
    </div>
  );
}

function ResultsState({ result }) {
  return (
    <div className="cr-panel-body cr-results">
      <div className="cr-agents">
        {AGENTS.map((a) => (
          <AgentRow key={a.key} agentKey={a.key} data={result[a.key]} />
        ))}
      </div>
      <Verdict data={result.verdict} />
    </div>
  );
}

export default function App() {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState("idle");
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  async function runReview() {
    if (!code.trim()) return;
    setStatus("loading");
    setResult(null);
    setErrorMsg("");

    try {
      let data;

      if (USE_MOCK) {
        // ── Mock mode: no API calls, instant fake results ──
        data = await mockFetch(code);
      } else {
        // ── Real mode: hit the Groq-backed FastAPI backend ──
        const res = await fetch(`${API_BASE}/review`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(
            `${res.status} ${res.statusText} — ${text.slice(0, 120)}`,
          );
        }

        data = await res.json();
      }

      setResult(data);
      setStatus("success");
    } catch (err) {
      setErrorMsg(err.message);
      setStatus("error");
    }
  }

  const isLoading = status === "loading";

  return (
    <div className="cr-root">
      <header className="cr-header">
        <div className="cr-logo" aria-hidden="true">
          <i className="ti ti-shield-check" />
        </div>
        <div>
          <h1 className="cr-header-title">CodeReview AI</h1>
          <p className="cr-header-sub">
            Multi-agent analysis · Security · Performance · Quality · Tests
          </p>
        </div>
      </header>

      {/* Mock mode indicator */}
      {USE_MOCK && (
        <div
          style={{
            background: "rgba(245,158,11,0.12)",
            borderBottom: "1px solid rgba(245,158,11,0.2)",
            padding: "6px 28px",
            fontSize: "11px",
            color: "#f59e0b",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontFamily: "'IBM Plex Mono', monospace",
          }}
        >
          <i
            className="ti ti-flask"
            style={{ fontSize: "13px" }}
            aria-hidden="true"
          />
          Mock mode — using fake responses for UI development. Set USE_MOCK =
          false to use the real API.
        </div>
      )}

      <div className="cr-body">
        {/* Left: editor */}
        <section className="cr-left" aria-label="Code input">
          <div className="cr-editor-meta">
            <span className="cr-section-label">
              <i className="ti ti-code" aria-hidden="true" />
              Source code
            </span>
            <span className="cr-char-count">
              {code.length.toLocaleString()} chars
            </span>
          </div>

          <textarea
            className="cr-textarea"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={"// Paste your code here…"}
            spellCheck={false}
            aria-label="Source code to review"
          />

          {status === "error" && (
            <div className="cr-inline-error" role="alert">
              <i className="ti ti-alert-circle" aria-hidden="true" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            className="cr-btn"
            onClick={runReview}
            disabled={isLoading || !code.trim()}
            aria-busy={isLoading}
          >
            <i
              className={`ti ${
                isLoading
                  ? "ti-loader-2 cr-spin-icon"
                  : status === "success"
                    ? "ti-refresh"
                    : "ti-player-play"
              }`}
              aria-hidden="true"
            />
            {isLoading
              ? "Analyzing…"
              : status === "success"
                ? "Run again"
                : "Run analysis"}
          </button>
        </section>

        {/* Right: results */}
        <section
          className="cr-right"
          aria-label="Analysis results"
          aria-live="polite"
        >
          <div className="cr-panel-header">
            <span className="cr-section-label">Analysis results</span>
            {status === "success" && result?.verdict && (
              <span
                className="cr-panel-score"
                style={{ color: scoreColor(result.verdict.overall_score ?? 0) }}
              >
                {result.verdict.overall_score ?? 0}/100
              </span>
            )}
          </div>

          {status === "idle" && <EmptyState />}
          {status === "loading" && <LoadingState />}
          {status === "error" && <ErrorState message={errorMsg} />}
          {status === "success" && <ResultsState result={result} />}
        </section>
      </div>
    </div>
  );
}
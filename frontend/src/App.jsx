import { useState, useRef } from "react";
import "./App.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

// ─── helpers ────────────────────────────────────────────────────────────────

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

// ─── ScoreRing ───────────────────────────────────────────────────────────────

function ScoreRing({ score }) {
  const r = 18;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = scoreColor(score);

  return (
    <div className="cr-ring-wrap">
      <svg
        width="44"
        height="44"
        viewBox="0 0 44 44"
        style={{ transform: "rotate(-90deg)" }}
      >
        <circle className="cr-ring-bg" cx="22" cy="22" r={r} />
        <circle
          className="cr-ring-val"
          cx="22"
          cy="22"
          r={r}
          stroke={color}
          strokeDasharray={circ}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="cr-ring-num">{score}</div>
    </div>
  );
}

// ─── AgentRow ────────────────────────────────────────────────────────────────

const AGENTS = [
  { key: "security", label: "Security", icon: "ti-lock" },
  { key: "performance", label: "Performance", icon: "ti-bolt" },
  { key: "quality", label: "Code quality", icon: "ti-sparkles" },
  { key: "testing", label: "Test coverage", icon: "ti-test-pipe" },
];

function AgentRow({ agentKey, data }) {
  const cfg = AGENTS.find((a) => a.key === agentKey);
  const score = data?.score ?? 0;
  const issues = (data?.issues ?? []).slice(0, 2);

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

// ─── Verdict ─────────────────────────────────────────────────────────────────

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
            style={{ color: scoreColor(data.overall_score) }}
          >
            {data.overall_score}
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

// ─── Results panel states ────────────────────────────────────────────────────

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

// ─── Main App ────────────────────────────────────────────────────────────────

export default function App() {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const textareaRef = useRef(null);

  async function runReview() {
    if (!code.trim()) return;
    setStatus("loading");
    setResult(null);
    setErrorMsg("");

    try {
      const res = await fetch(`${API_BASE}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      setResult(data);
      setStatus("success");
    } catch (err) {
      setErrorMsg(err.message);
      setStatus("error");
    }
  }

  const isLoading = status === "loading";
  const chars = code.length;

  return (
    <div className="cr-root">
      {/* Header */}
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

      {/* Body */}
      <div className="cr-body">
        {/* Left: editor */}
        <section className="cr-left" aria-label="Code input">
          <div className="cr-editor-meta">
            <span className="cr-section-label">
              <i className="ti ti-code" aria-hidden="true" />
              Source code
            </span>
            <span className="cr-char-count">
              {chars.toLocaleString()} chars
            </span>
          </div>

          <textarea
            ref={textareaRef}
            className="cr-textarea"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={
              "// Paste your code here…\nfunction example() {\n  const data = eval(userInput);\n  return data;\n}"
            }
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
              className={`ti ${isLoading ? "ti-loader-2 cr-spin-icon" : status === "success" ? "ti-refresh" : "ti-player-play"}`}
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
                style={{ color: scoreColor(result.verdict.overall_score) }}
              >
                {result.verdict.overall_score}/100
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

/**
 * Cognitive Observatory page: an asymmetrical editorial AI product story with observatory rails,
 * evidence chips, Observatory Lime actions, and intentionally restrained motion.
 */
import { Button } from "@/components/ui/button";
import {
  ArrowUpRight,
  BookOpen,
  Bot,
  Braces,
  Check,
  ChevronRight,
  CircleDotDashed,
  Code2,
  Database,
  FileText,
  Gauge,
  Layers3,
  LockKeyhole,
  Menu,
  Network,
  Search,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react";
import { FormEvent, useMemo, useState } from "react";

type PromptKey = "architecture" | "research" | "code";

const promptLibrary: Record<PromptKey, { label: string; prompt: string; response: string }> = {
  architecture: {
    label: "Architecture",
    prompt: "Map a secure agent architecture for an enterprise knowledge assistant.",
    response:
      "I’d separate the system into five observable layers: identity and policy, orchestration, retrieval, inference, and audit. Each layer gets its own control boundary—so teams can improve capability without weakening governance.",
  },
  research: {
    label: "Research",
    prompt: "Compare our model options and surface a decision I can defend.",
    response:
      "I’ll score candidates on reasoning quality, multimodal coverage, latency, unit economics, and data controls. The recommendation will include the trade-offs, the evidence used, and the next validation step—not just a leaderboard.",
  },
  code: {
    label: "Code review",
    prompt: "Review this service boundary and flag risks before we ship.",
    response:
      "I’ll trace data ownership, failure paths, and least-privilege assumptions. You’ll get a prioritized review: immediate risks, implementation notes, and a test plan for the release gate.",
  },
};

const capabilities = [
  {
    number: "01",
    icon: Database,
    title: "Memory that earns its place",
    body: "Ground every reply in a retrieval layer that keeps context useful, current, and auditable.",
    note: "RAG / VERIFIED",
  },
  {
    number: "02",
    icon: Workflow,
    title: "Tools with clear boundaries",
    body: "Route search, data, and code execution through explicit actions—not improvised answers.",
    note: "TOOLS / TRACEABLE",
  },
  {
    number: "03",
    icon: ShieldCheck,
    title: "Safety in the system design",
    body: "Operational guardrails, privacy controls, and red-team testing are part of every answer path.",
    note: "POLICY / ACTIVE",
  },
];

const metrics = [
  { value: "< 1s", label: "Target response time", detail: "for typical, grounded questions" },
  { value: "99.9%", label: "Reliability goal", detail: "with observable services and failover" },
  { value: "1M", label: "Context-ready", detail: "through selective memory and retrieval" },
];

const roadmap = [
  { phase: "01", title: "Instrument", copy: "Research, user models, and the first answer loop.", state: "Weeks 01–06" },
  { phase: "02", title: "Ground", copy: "RAG, tool calling, safety gates, and observability.", state: "Weeks 07–16" },
  { phase: "03", title: "Prove", copy: "Multimodal beta, evaluation suites, and customer pilots.", state: "Months 05–08" },
  { phase: "04", title: "Expand", copy: "Enterprise workflows, scale engineering, and a V2 roadmap.", state: "After launch" },
];

function SignalMark({ className = "" }: { className?: string }) {
  return (
    <img
      src="/manus-storage/manus-signal-mark_a1f4b48d.png"
      alt="Manus AI Companion signal mark"
      className={className}
    />
  );
}

export default function Home() {
  const [activePrompt, setActivePrompt] = useState<PromptKey>("architecture");
  const [question, setQuestion] = useState("");
  const [submittedQuestion, setSubmittedQuestion] = useState("");

  const active = useMemo(() => promptLibrary[activePrompt], [activePrompt]);

  function scrollToChat() {
    document.getElementById("try-it")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!question.trim()) return;
    setSubmittedQuestion(question.trim());
    setQuestion("");
  }

  const displayedPrompt = submittedQuestion || active.prompt;
  const displayedResponse = submittedQuestion
    ? "I’ve captured the decision behind your question. In a live workspace, I’d pull the relevant sources, expose the assumptions, and return an answer with a clear next action."
    : active.response;

  return (
    <div className="observatory-page overflow-hidden bg-[#10120f] text-[#f2f1ea]">
      <header className="site-header">
        <a className="brand-lockup" href="#top" aria-label="Manus AI Companion home">
          <SignalMark className="brand-mark" />
          <span>MANUS / COMPANION</span>
        </a>
        <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary navigation">
          <a href="#capabilities">Capabilities</a>
          <a href="#operating-model">Operating model</a>
          <a href="#roadmap">Roadmap</a>
        </nav>
        <Button className="nav-cta" onClick={scrollToChat}>
          Open the workspace <ArrowUpRight size={15} />
        </Button>
        <button className="mobile-menu" aria-label="Open navigation"><Menu size={20} /></button>
      </header>

      <main id="top">
        <section className="hero-section" aria-labelledby="hero-title">
          <div className="measurement-rail hero-rail" aria-hidden="true">
            <span>00</span><i /><span>01</span><i /><span>02</span><i /><span>03</span>
          </div>
          <div className="hero-copy">
            <div className="eyebrow"><span className="live-pulse" /> GENAI / OPERATING SYSTEM</div>
            <h1 id="hero-title">Bring context.<br /><em>Leave</em> with a decision.</h1>
            <p className="hero-summary">
              Manus AI Companion is the evidence-first AI workspace for teams that need answers they can act on—not just outputs they can skim.
            </p>
            <div className="hero-actions">
              <Button className="primary-signal" onClick={scrollToChat}>
                Try the answer loop <ArrowUpRight size={17} />
              </Button>
              <a className="text-link" href="#operating-model">Explore the operating model <ChevronRight size={16} /></a>
            </div>
            <div className="hero-proof">
              <span><Check size={14} /> Persistent context</span>
              <span><Check size={14} /> Live tools</span>
              <span><Check size={14} /> Enterprise controls</span>
            </div>
          </div>

          <div className="hero-visual-wrap" aria-label="An abstract AI signal field and conversation interface">
            <img className="hero-art" src="/manus-storage/manus-hero-observatory_25bca990.png" alt="Abstract Manus AI signal orb in an observatory setting" />
            <div className="hero-visual-wash" />
            <div className="hero-chat-card">
              <div className="chat-card-topline">
                <span>LIVE ANSWER LOOP</span>
                <span className="chat-online"><i /> CONNECTED</span>
              </div>
              <div className="chat-question">How should we ship a secure agent to our support team?</div>
              <div className="chat-response">
                <SignalMark className="chat-signal" />
                <p>Start with a scoped knowledge base, permission-aware retrieval, and one auditable tool at a time. Measure resolution quality before expanding autonomy.</p>
              </div>
              <div className="chat-card-footer"><span>GROUNDING: 6 SOURCES</span><span>↗ 0.8s</span></div>
            </div>
            <div className="orbit-label orbit-a">MEMORY / SELECTIVE</div>
            <div className="orbit-label orbit-b">TOOLS / ON</div>
          </div>
        </section>

        <section className="signal-strip" aria-label="Product highlights">
          <p><CircleDotDashed size={16} /> A deliberate system for high-consequence work</p>
          <div className="signal-strip-divider" />
          <p><span className="signal-dot" /> Evidence-first by design</p>
          <p><span className="signal-dot" /> Built to improve over time</p>
        </section>

        <section id="capabilities" className="section-shell capabilities-section">
          <div className="section-kicker"><span>01 / CAPABILITY</span><span>WHAT MAKES AN ANSWER ACTIONABLE</span></div>
          <div className="capability-intro">
            <h2>More than a model.<br />A <em>working</em> system.</h2>
            <p>Build the behavior around the language model: the context it sees, the sources it can trust, the tools it can call, and the standards it must meet.</p>
          </div>
          <div className="capability-list">
            {capabilities.map((item) => {
              const Icon = item.icon;
              return (
                <article className="capability-row" key={item.number}>
                  <div className="row-index">{item.number}</div>
                  <div className="row-icon"><Icon size={22} /></div>
                  <div className="row-main"><h3>{item.title}</h3><p>{item.body}</p></div>
                  <div className="evidence-chip">{item.note}</div>
                  <ArrowUpRight className="row-arrow" size={21} />
                </article>
              );
            })}
          </div>
        </section>

        <section id="operating-model" className="memory-section">
          <div className="measurement-rail memory-rail" aria-hidden="true"><span>04</span><i /><span>05</span><i /><span>06</span></div>
          <div className="memory-image-wrap">
            <img src="/manus-storage/manus-memory-field_24d2dd85.png" alt="Abstract field representing connected knowledge and AI memory" />
            <div className="image-coordinate">MEMORY FIELD / 001</div>
          </div>
          <div className="memory-content">
            <div className="eyebrow dark-eyebrow"><Database size={14} /> LONG-TERM CONTEXT</div>
            <h2>Answers with<br /><em>continuity.</em></h2>
            <p>From a customer’s first question to an executive decision, the workspace retrieves the few pieces of context that matter and makes the source trail visible.</p>
            <ul className="check-list">
              <li><Check size={16} /><span>Vector search and curated knowledge, working together</span></li>
              <li><Check size={16} /><span>Preferences that stay useful—not merely stored</span></li>
              <li><Check size={16} /><span>Human-readable provenance for consequential responses</span></li>
            </ul>
            <a className="underlined-link" href="#try-it">See an answer in context <ArrowUpRight size={16} /></a>
          </div>
        </section>

        <section id="try-it" className="section-shell workspace-section" aria-labelledby="workspace-title">
          <div className="workspace-head">
            <div><div className="section-kicker compact"><span>02 / INTERACTION</span></div><h2 id="workspace-title">The answer loop,<br /><em>made visible.</em></h2></div>
            <p>Select a working mode or bring your own question. This interactive sample demonstrates how the Companion frames a useful response.</p>
          </div>
          <div className="workspace-grid">
            <div className="prompt-control-panel">
              <div className="control-eyebrow">CHOOSE A WORKING MODE</div>
              {(Object.keys(promptLibrary) as PromptKey[]).map((key) => (
                <button key={key} onClick={() => { setActivePrompt(key); setSubmittedQuestion(""); }} className={`mode-button ${activePrompt === key && !submittedQuestion ? "active" : ""}`}>
                  <span className="mode-icon">{key === "architecture" ? <Network size={17} /> : key === "research" ? <Search size={17} /> : <Code2 size={17} />}</span>
                  <span><strong>{promptLibrary[key].label}</strong><small>{key === "architecture" ? "Design a system" : key === "research" ? "Interrogate a choice" : "Pressure-test a release"}</small></span>
                  <ChevronRight size={17} />
                </button>
              ))}
              <div className="control-note"><LockKeyhole size={14} /> Context stays permission-aware.</div>
            </div>
            <div className="answer-terminal">
              <div className="terminal-top"><span><Bot size={16} /> MANUS COMPANION</span><span className="terminal-status"><i /> READY</span></div>
              <div className="terminal-thread">
                <div className="thread-label">YOUR QUESTION</div>
                <p className="thread-question">{displayedPrompt}</p>
                <div className="thread-rule" />
                <div className="thread-label response-label"><SignalMark className="tiny-signal" /> GROUNDED RESPONSE</div>
                <p className="thread-response">{displayedResponse}</p>
                <div className="source-row"><span><BookOpen size={14} /> Source context prepared</span><span><Gauge size={14} /> Confidence: high</span></div>
              </div>
              <form onSubmit={handleSubmit} className="terminal-input">
                <input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Ask a question worth tracing…" aria-label="Ask a sample question" />
                <button type="submit" aria-label="Send sample question"><ArrowUpRight size={18} /></button>
              </form>
            </div>
          </div>
        </section>

        <section className="metrics-section">
          <div className="metrics-backdrop"><img src="/manus-storage/manus-trust-infrastructure_18d553b3.png" alt="Abstract secure AI infrastructure sculpture" /></div>
          <div className="metrics-copy">
            <div className="eyebrow"><ShieldCheck size={14} /> OPERATIONAL TRUST</div>
            <h2>Useful is not<br />enough. It must<br /><em>hold up.</em></h2>
            <p>Every capability needs an operating standard: latency budgets, safety evaluations, control boundaries, and an observable path through the system.</p>
            <a className="text-link" href="#roadmap">Trace the implementation path <ChevronRight size={16} /></a>
          </div>
          <div className="metric-stack">
            {metrics.map((metric) => <div className="metric" key={metric.label}><strong>{metric.value}</strong><div><span>{metric.label}</span><small>{metric.detail}</small></div></div>)}
          </div>
        </section>

        <section className="section-shell system-prompt-section">
          <div className="prompt-label-block"><span>03 / PERSONA SPEC</span><p>An effective assistant is designed not only for what it can do, but for how it decides.</p></div>
          <div className="prompt-quote">
            <Sparkles size={21} />
            <blockquote>“Act like a senior AI architect with a pragmatic CEO’s eye. Use evidence when it matters. Keep going until the decision is clear.”</blockquote>
            <div className="prompt-quote-footer"><span>MASTER PROMPT / V1.0</span><span><Braces size={15} /> INSPECTABLE BEHAVIOR</span></div>
          </div>
        </section>

        <section id="roadmap" className="section-shell roadmap-section">
          <div className="section-kicker"><span>04 / DELIVERY</span><span>FROM FIRST LOOP TO PRODUCT SYSTEM</span></div>
          <div className="roadmap-head"><h2>Make the promise<br /><em>operational.</em></h2><p>Progress is planned in clear stages: build the answer loop, ground it, prove it under pressure, and expand only with evidence.</p></div>
          <div className="roadmap-track">
            {roadmap.map((item, index) => <article className="roadmap-card" key={item.phase}><div className="roadmap-line"><span>{item.phase}</span>{index < roadmap.length - 1 && <i />}</div><h3>{item.title}</h3><p>{item.copy}</p><small>{item.state}</small></article>)}
          </div>
        </section>

        <section className="closing-section">
          <div className="closing-orb"><SignalMark className="closing-mark" /></div>
          <div className="closing-copy">
            <div className="eyebrow"><span className="live-pulse" /> YOUR NEXT SYSTEM</div>
            <h2>Build an assistant<br />your team can <em>use.</em></h2>
            <p>Start with the workflow where answers need to become decisions—and make the evidence part of the experience.</p>
            <Button className="primary-signal closing-button" onClick={scrollToChat}>Open the workspace <ArrowUpRight size={17} /></Button>
          </div>
          <div className="closing-grid" aria-hidden="true" />
        </section>
      </main>

      <footer className="site-footer">
        <a className="brand-lockup" href="#top"><SignalMark className="brand-mark" /><span>MANUS / COMPANION</span></a>
        <p>Evidence-first intelligence for consequential work.</p>
        <div><a href="#capabilities">Capabilities</a><a href="#roadmap">Roadmap</a><a href="mailto:hello@manuscompanion.ai">Contact <ArrowUpRight size={13} /></a></div>
      </footer>
    </div>
  );
}

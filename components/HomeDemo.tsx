"use client";

import { Fragment, useEffect, useRef } from "react";

const RESUME_TEXT = `# Phil Knight
*MBA Candidate, Stanford GSB · Portland, OR*

## Background
Distance runner from Portland. Ran the mile at Oregon under coach Bill Bowerman before coming down to Stanford for the MBA. My second-year paper argues that Japanese athletic shoes can break the German hold on the US running market.

## Experience
**Founder, Blue Ribbon Sports** · *2024 – Present*
Importing Onitsuka Tiger running shoes from Kobe, Japan. Selling out of the trunk of a Plymouth Valiant at track meets. Working name for the rebrand: "Nike."

**United States Army Reserve** · *2022 – 2023*
Active duty followed by reserve service.

**Price Waterhouse, Audit Intern** · *Summer 2023*
Learned to read a balance sheet. Learned I'd rather sell shoes.`;

const RESPONSE_WORDS: { w: string; d: number; b: boolean }[] = [
  { w: "Phil", d: 10.447, b: true },
  { w: "Knight", d: 10.476, b: true },
  { w: "is", d: 10.505, b: false },
  { w: "a", d: 10.534, b: false },
  { w: "Stanford", d: 10.563, b: false },
  { w: "GSB", d: 10.592, b: false },
  { w: "MBA", d: 10.621, b: false },
  { w: "candidate", d: 10.65, b: false },
  { w: "from", d: 10.679, b: false },
  { w: "Portland", d: 10.708, b: false },
  { w: "and", d: 10.737, b: false },
  { w: "the", d: 10.766, b: false },
  { w: "founder", d: 10.795, b: false },
  { w: "of", d: 10.824, b: false },
  { w: "Blue", d: 10.853, b: false },
  { w: "Ribbon", d: 10.882, b: false },
  { w: "Sports,", d: 10.911, b: false },
  { w: "an", d: 10.94, b: false },
  { w: "early-stage", d: 10.969, b: false },
  { w: "company", d: 10.998, b: false },
  { w: "importing", d: 11.027, b: false },
  { w: "Japanese", d: 11.056, b: false },
  { w: "running", d: 11.085, b: false },
  { w: "shoes", d: 11.114, b: false },
  { w: "into", d: 11.143, b: false },
  { w: "the", d: 11.172, b: false },
  { w: "Pacific", d: 11.201, b: false },
  { w: "Northwest.", d: 11.23, b: false },
  { w: "I", d: 11.259, b: false },
  { w: "know", d: 11.288, b: false },
  { w: "you're", d: 11.317, b: true },
  { w: "hiring", d: 11.346, b: true },
  { w: "for", d: 11.375, b: true },
  { w: "a", d: 11.404, b: true },
  { w: "shoe", d: 11.433, b: true },
  { w: "salesman", d: 11.462, b: true },
  { w: "for", d: 11.491, b: true },
  { w: "your", d: 11.52, b: true },
  { w: "Eugene", d: 11.549, b: true },
  { w: "running", d: 11.578, b: true },
  { w: "store,", d: 11.607, b: true },
  { w: "and", d: 11.636, b: false },
  { w: "he", d: 11.665, b: false },
  { w: "would", d: 11.694, b: false },
  { w: "be", d: 11.723, b: false },
  { w: "an", d: 11.752, b: false },
  { w: "unusually", d: 11.781, b: true },
  { w: "good", d: 11.81, b: true },
  { w: "fit.", d: 11.839, b: true },
  { w: "He's", d: 11.868, b: false },
  { w: "a", d: 11.897, b: false },
  { w: "sub-4:15", d: 11.926, b: false },
  { w: "miler", d: 11.955, b: false },
  { w: "who", d: 11.984, b: false },
  { w: "trained", d: 12.013, b: false },
  { w: "at", d: 12.042, b: false },
  { w: "Oregon", d: 12.071, b: false },
  { w: "under", d: 12.1, b: false },
  { w: "Bill", d: 12.129, b: false },
  { w: "Bowerman,", d: 12.158, b: false },
  { w: "so", d: 12.187, b: false },
  { w: "he'll", d: 12.216, b: false },
  { w: "talk", d: 12.245, b: false },
  { w: "credibly", d: 12.274, b: false },
  { w: "to", d: 12.303, b: false },
  { w: "the", d: 12.332, b: false },
  { w: "runners", d: 12.361, b: false },
  { w: "you", d: 12.39, b: false },
  { w: "mentioned", d: 12.419, b: false },
  { w: "losing", d: 12.448, b: false },
  { w: "to", d: 12.477, b: false },
  { w: "the", d: 12.506, b: false },
  { w: "bigger", d: 12.535, b: false },
  { w: "chains.", d: 12.564, b: false },
  { w: "He's", d: 12.593, b: false },
  { w: "currently", d: 12.622, b: true },
  { w: "selling", d: 12.651, b: true },
  { w: "Onitsuka", d: 12.68, b: true },
  { w: "Tigers", d: 12.709, b: true },
  { w: "out", d: 12.738, b: true },
  { w: "of", d: 12.767, b: true },
  { w: "his", d: 12.796, b: true },
  { w: "car", d: 12.825, b: true },
  { w: "at", d: 12.854, b: false },
  { w: "track", d: 12.883, b: false },
  { w: "meets,", d: 12.912, b: false },
  { w: "which", d: 12.941, b: false },
  { w: "is", d: 12.97, b: false },
  { w: "the", d: 12.999, b: false },
  { w: "same", d: 13.028, b: false },
  { w: "high-touch,", d: 13.057, b: false },
  { w: "athlete-first", d: 13.086, b: false },
  { w: "sales", d: 13.115, b: false },
  { w: "motion", d: 13.144, b: false },
  { w: "you've", d: 13.173, b: false },
  { w: "been", d: 13.202, b: false },
  { w: "trying", d: 13.231, b: false },
  { w: "to", d: 13.26, b: false },
  { w: "teach", d: 13.289, b: false },
  { w: "your", d: 13.318, b: false },
  { w: "hires.", d: 13.347, b: false },
  { w: "His", d: 13.376, b: false },
  { w: "Army", d: 13.405, b: false },
  { w: "Reserve", d: 13.434, b: false },
  { w: "background", d: 13.463, b: false },
  { w: "reads", d: 13.492, b: false },
  { w: "as", d: 13.521, b: false },
  { w: "reliability", d: 13.55, b: true },
  { w: "under", d: 13.579, b: true },
  { w: "pressure,", d: 13.608, b: true },
  { w: "and", d: 13.637, b: false },
  { w: "his", d: 13.666, b: false },
  { w: "GSB", d: 13.695, b: false },
  { w: "training", d: 13.724, b: false },
  { w: "means", d: 13.753, b: false },
  { w: "he'll", d: 13.782, b: false },
  { w: "grasp", d: 13.811, b: false },
  { w: "your", d: 13.84, b: false },
  { w: "inventory", d: 13.869, b: false },
  { w: "turnover", d: 13.898, b: false },
  { w: "problem", d: 13.927, b: false },
  { w: "in", d: 13.956, b: false },
  { w: "one", d: 13.985, b: false },
  { w: "conversation.", d: 14.014, b: false },
  { w: "Two", d: 14.043, b: true },
  { w: "flags", d: 14.072, b: true },
  { w: "worth", d: 14.101, b: true },
  { w: "naming:", d: 14.13, b: true },
  { w: "he's", d: 14.159, b: false },
  { w: "building", d: 14.188, b: false },
  { w: "Blue", d: 14.217, b: false },
  { w: "Ribbon", d: 14.246, b: false },
  { w: "Sports", d: 14.275, b: false },
  { w: "on", d: 14.304, b: false },
  { w: "the", d: 14.333, b: false },
  { w: "side,", d: 14.362, b: false },
  { w: "so", d: 14.391, b: false },
  { w: "this", d: 14.42, b: false },
  { w: "isn't", d: 14.449, b: false },
  { w: "a", d: 14.478, b: false },
  { w: "five-year", d: 14.507, b: false },
  { w: "hire,", d: 14.536, b: false },
  { w: "and", d: 14.565, b: false },
  { w: "if", d: 14.594, b: false },
  { w: "you", d: 14.623, b: false },
  { w: "stock", d: 14.652, b: false },
  { w: "Adidas", d: 14.681, b: false },
  { w: "or", d: 14.71, b: false },
  { w: "Puma", d: 14.739, b: false },
  { w: "he", d: 14.768, b: false },
  { w: "has", d: 14.797, b: false },
  { w: "strong", d: 14.826, b: false },
  { w: "opinions", d: 14.855, b: false },
  { w: "about", d: 14.884, b: false },
  { w: "both\u2026", d: 14.913, b: false },
];

const PROMPT_TEXT =
  "Tell me about Phil Knight using warmpitch.me/r/k7n2 and how he can be useful to me or my business based on what you know about me or my business.";

export default function HomeDemo() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const stage = stageRef.current;
    if (!wrap || !stage) return;
    const fit = () => {
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      if (!w || !h) return;
      stage.style.transform = `scale(${Math.min(w / 1280, h / 720)})`;
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="demo-wrap" ref={wrapRef}>
      <div className="dx-stage-wrap">
        <div className="dx-stage" ref={stageRef}>
          <div className="dx-persistent-header">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="dx-header-logo" src="/logo.svg" alt="warmpitch.me" />
          </div>

          <section className="dx-scene dx-scene-hero">
            <div className="dx-site-header">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="dx-header-logo" src="/logo.svg" alt="warmpitch.me" />
            </div>
            <div className="dx-hero-body">
              <h1 className="dx-hero-h1">Your résumé, pitched by their AI.</h1>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="dx-hero-logo" src="/logo.svg" alt="warmpitch.me" />
            </div>
          </section>

          <section className="dx-scene dx-scene-setup">
            <div className="dx-site-header">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="dx-header-logo" src="/logo.svg" alt="warmpitch.me" />
            </div>
            <div className="dx-auth-stage">
              <div className="dx-auth-card">
                <h1>Set up your page</h1>
                <p className="dx-auth-sub">This is what people will see.</p>

                <label className="dx-field">
                  <span>Name</span>
                  <div className="dx-filled-input">
                    <span className="dx-typed dx-typed-name">Phil Knight</span>
                  </div>
                </label>

                <label className="dx-field">
                  <span>Tagline</span>
                  <div className="dx-filled-input">
                    <span className="dx-typed dx-typed-tag">MBA @ Stanford GSB</span>
                  </div>
                </label>

                <label className="dx-field">
                  <span>LinkedIn</span>
                  <div className="dx-filled-input dx-mono">
                    <span className="dx-typed dx-typed-li">linkedin.com/in/philknight</span>
                  </div>
                </label>

                <label className="dx-field">
                  <span>Résumé</span>
                  <div className="dx-textarea dx-resume-typed-wrap">
                    <div className="dx-resume-lines">{RESUME_TEXT}</div>
                  </div>
                </label>

                <button className="dx-cta dx-cta-pressed">Create my page</button>
              </div>
            </div>
          </section>

          <section className="dx-scene dx-scene-pitch">
            <div className="dx-site-header">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="dx-header-logo" src="/logo.svg" alt="warmpitch.me" />
            </div>
            <div className="dx-pitch">
              <div className="dx-url-bar">
                warmpitch.me/<span className="dx-strong">k7n2</span>
              </div>
              <div className="dx-avatar">PK</div>
              <h1>Phil Knight</h1>
              <p className="dx-tagline">MBA @ Stanford GSB</p>
              <div className="dx-ai-stack">
                <div className="dx-ai-row">
                  <button className="dx-ai-btn dx-ai-btn-claude">
                    <span className="dx-mark">
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path
                          d="M12 2 C12.6 6.4 14.6 8.4 19 9 C14.6 9.6 12.6 11.6 12 16 C11.4 11.6 9.4 9.6 5 9 C9.4 8.4 11.4 6.4 12 2 Z M19 16 C19.3 18 20.3 19 22 19.3 C20.3 19.6 19.3 20.6 19 22.5 C18.7 20.6 17.7 19.6 16 19.3 C17.7 19 18.7 18 19 16 Z"
                          fill="#d67000"
                        />
                      </svg>
                    </span>
                    <span className="dx-label">Ask AI</span>
                    <span className="dx-click-ripple"></span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="dx-scene dx-scene-ai">
            <div className="dx-ai-window">
              <div className="dx-aiw-bar">
                <span className="dx-aiw-dot"></span>
                <span className="dx-aiw-dot"></span>
                <span className="dx-aiw-dot"></span>
                <span className="dx-aiw-title">Ask AI · New chat</span>
              </div>
              <div className="dx-aiw-body">
                <div className="dx-user-msg">{PROMPT_TEXT}</div>
                <span className="dx-thinking">
                  <span className="dx-d"></span>
                  <span className="dx-d"></span>
                  <span className="dx-d"></span>
                </span>
                <div className="dx-aiw-response">
                  {RESPONSE_WORDS.map((item, i) => {
                    const span = (
                      <span
                        className="dx-w"
                        style={{ animationDelay: `${item.d}s` }}
                      >
                        {item.w}
                      </span>
                    );
                    return (
                      <Fragment key={i}>
                        {item.b ? <strong>{span}</strong> : span}{" "}
                      </Fragment>
                    );
                  })}
                </div>
              </div>
              <div className="dx-aiw-composer">
                <div className="dx-aiw-input">
                  <span className="dx-reveal-prompt">{PROMPT_TEXT}</span>
                </div>
                <button className="dx-aiw-send" aria-label="Send">
                  <svg viewBox="0 0 16 16" aria-hidden="true">
                    <path
                      d="M8 13 V3 M3 8 L8 3 L13 8"
                      fill="none"
                      stroke="#fff"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

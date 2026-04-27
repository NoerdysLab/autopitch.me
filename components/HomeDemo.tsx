"use client";

import { Fragment } from "react";

const RESUME_TEXT = `# Phil Knight
*MBA Candidate, Stanford GSB · Portland, OR*

## Background
Distance runner from Portland. Ran the mile at Oregon under coach Bill Bowerman before coming down to Stanford for the MBA.

## Experience
**Founder, Blue Ribbon Sports** · *2024 – Present*
Importing Onitsuka Tiger running shoes from Kobe, Japan. Selling out of the trunk of a Plymouth Valiant at track meets. Working name for the rebrand: "Nike."

**United States Army Reserve** · *2022 – 2023*
Active duty followed by reserve service.`;

type Word = { w: string; d: number; b: boolean };

// Stream timing: starts 10.447s into the 20s loop, ~29ms per word.
// 115 words across two paragraphs. Last word lands at 13.753s, well
// within the AI scene's display window.
const RESPONSE: Word[][] = [
  [
    { w: "Phil", d: 10.447, b: true },
    { w: "Knight", d: 10.476, b: true },
    { w: "is", d: 10.505, b: false },
    { w: "a", d: 10.534, b: false },
    { w: "Stanford", d: 10.563, b: false },
    { w: "MBA", d: 10.592, b: false },
    { w: "candidate", d: 10.621, b: false },
    { w: "from", d: 10.650, b: false },
    { w: "Portland.", d: 10.679, b: false },
    { w: "As", d: 10.708, b: false },
    { w: "you're", d: 10.737, b: true },
    { w: "hiring", d: 10.766, b: true },
    { w: "for", d: 10.795, b: true },
    { w: "a", d: 10.824, b: true },
    { w: "shoe", d: 10.853, b: true },
    { w: "salesman", d: 10.882, b: true },
    { w: "for", d: 10.911, b: true },
    { w: "your", d: 10.940, b: true },
    { w: "Eugene", d: 10.969, b: true },
    { w: "running", d: 10.998, b: true },
    { w: "store,", d: 11.027, b: true },
    { w: "he", d: 11.056, b: false },
    { w: "would", d: 11.085, b: false },
    { w: "be", d: 11.114, b: false },
    { w: "an", d: 11.143, b: false },
    { w: "unusually", d: 11.172, b: true },
    { w: "good", d: 11.201, b: true },
    { w: "fit.", d: 11.230, b: true },
    { w: "He's", d: 11.259, b: false },
    { w: "a", d: 11.288, b: false },
    { w: "sub-4:15", d: 11.317, b: false },
    { w: "miler", d: 11.346, b: false },
    { w: "so", d: 11.375, b: false },
    { w: "he'll", d: 11.404, b: false },
    { w: "talk", d: 11.433, b: false },
    { w: "credibly", d: 11.462, b: false },
    { w: "to", d: 11.491, b: false },
    { w: "the", d: 11.520, b: false },
    { w: "runners", d: 11.549, b: false },
    { w: "you", d: 11.578, b: false },
    { w: "mentioned", d: 11.607, b: false },
    { w: "losing", d: 11.636, b: false },
    { w: "to", d: 11.665, b: false },
    { w: "the", d: 11.694, b: false },
    { w: "bigger", d: 11.723, b: false },
    { w: "stores.", d: 11.752, b: false },
    { w: "He's", d: 11.781, b: false },
    { w: "currently", d: 11.810, b: true },
    { w: "selling", d: 11.839, b: true },
    { w: "Onitsuka", d: 11.868, b: true },
    { w: "Tigers", d: 11.897, b: true },
    { w: "out", d: 11.926, b: true },
    { w: "of", d: 11.955, b: true },
    { w: "his", d: 11.984, b: true },
    { w: "car", d: 12.013, b: true },
    { w: "at", d: 12.042, b: false },
    { w: "track", d: 12.071, b: false },
    { w: "meets.", d: 12.100, b: false },
    { w: "His", d: 12.129, b: false },
    { w: "Army", d: 12.158, b: false },
    { w: "background", d: 12.187, b: false },
    { w: "reads", d: 12.216, b: false },
    { w: "as", d: 12.245, b: false },
    { w: "reliability", d: 12.274, b: true },
    { w: "under", d: 12.303, b: true },
    { w: "pressure,", d: 12.332, b: true },
    { w: "and", d: 12.361, b: false },
    { w: "his", d: 12.390, b: false },
    { w: "GSB", d: 12.419, b: false },
    { w: "training", d: 12.448, b: false },
    { w: "means", d: 12.477, b: false },
    { w: "he'll", d: 12.506, b: false },
    { w: "grasp", d: 12.535, b: false },
    { w: "your", d: 12.564, b: false },
    { w: "inventory", d: 12.593, b: false },
    { w: "problem", d: 12.622, b: false },
    { w: "in", d: 12.651, b: false },
    { w: "one", d: 12.680, b: false },
    { w: "conversation.", d: 12.709, b: false },
    { w: "Two", d: 12.738, b: true },
    { w: "flags", d: 12.767, b: true },
    { w: "worth", d: 12.796, b: true },
    { w: "naming:", d: 12.825, b: true },
    { w: "he's", d: 12.854, b: false },
    { w: "building", d: 12.883, b: false },
    { w: "Blue", d: 12.912, b: false },
    { w: "Ribbon", d: 12.941, b: false },
    { w: "Sports", d: 12.970, b: false },
    { w: "on", d: 12.999, b: false },
    { w: "the", d: 13.028, b: false },
    { w: "side,", d: 13.057, b: false },
    { w: "and", d: 13.086, b: false },
    { w: "if", d: 13.115, b: false },
    { w: "you", d: 13.144, b: false },
    { w: "stock", d: 13.173, b: false },
    { w: "Adidas", d: 13.202, b: false },
    { w: "or", d: 13.231, b: false },
    { w: "Puma", d: 13.260, b: false },
    { w: "he", d: 13.289, b: false },
    { w: "has", d: 13.318, b: false },
    { w: "strong", d: 13.347, b: false },
    { w: "opinions", d: 13.376, b: false },
    { w: "about", d: 13.405, b: false },
    { w: "both…", d: 13.434, b: false },
  ],
  [
    { w: "I", d: 13.463, b: true },
    { w: "recommend", d: 13.492, b: true },
    { w: "you", d: 13.521, b: true },
    { w: "hire", d: 13.550, b: true },
    { w: "this", d: 13.579, b: true },
    { w: "man", d: 13.608, b: true },
    { w: "if", d: 13.637, b: true },
    { w: "you", d: 13.666, b: true },
    { w: "have", d: 13.695, b: true },
    { w: "a", d: 13.724, b: true },
    { w: "chance", d: 13.753, b: true },
  ],
];

const PROMPT_TEXT =
  "Tell me about Phil Knight using warmpitch.me/r/k7n2 and how he can be useful to me or my business.";

export default function HomeDemo() {
  return (
    <div className="demo-wrap">
      <div className="dx-persistent-header">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="dx-header-logo" src="/logo.svg" alt="warmpitch.me" />
      </div>

      <section className="dx-scene dx-scene-hero">
        <h1 className="dx-hero-h1">Your résumé, pitched by their AI.</h1>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="dx-hero-logo" src="/logo.svg" alt="warmpitch.me" />
      </section>

      <section className="dx-scene dx-scene-setup">
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
      </section>

      <section className="dx-scene dx-scene-pitch">
        <div className="dx-url-bar">
          warmpitch.me/<span className="dx-strong">k7n2</span>
        </div>
        <div className="dx-avatar">PK</div>
        <h1 className="dx-pitch-name">Phil Knight</h1>
        <p className="dx-tagline">MBA @ Stanford GSB</p>
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
      </section>

      <section className="dx-scene dx-scene-ai">
        <div className="dx-ai-window">
          <div className="dx-aiw-bar">
            <span className="dx-aiw-dot"></span>
            <span className="dx-aiw-dot"></span>
            <span className="dx-aiw-dot"></span>
            <span className="dx-aiw-title">Ask AI · New chat</span>
            <span className="dx-aiw-context">
              Recruiter&apos;s / Investor&apos;s computer
            </span>
          </div>
          <div className="dx-aiw-body">
            <div className="dx-user-msg">{PROMPT_TEXT}</div>
            <span className="dx-thinking">
              <span className="dx-d"></span>
              <span className="dx-d"></span>
              <span className="dx-d"></span>
            </span>
            <div className="dx-aiw-response">
              {RESPONSE.map((para, pi) => (
                <p key={pi} className="dx-aiw-p">
                  {para.map((item, i) => {
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
                </p>
              ))}
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
  );
}

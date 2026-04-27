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

// Stream timing: starts 13.200s into the 20s loop, ~29ms per word.
// 115 words across two paragraphs. Last word lands at 16.506s, leaving
// ~2.5s of dwell on the closing recommendation before the loop restarts.
const RESPONSE: Word[][] = [
  [
    { w: "Phil", d: 13.200, b: true },
    { w: "Knight", d: 13.229, b: true },
    { w: "is", d: 13.258, b: false },
    { w: "a", d: 13.287, b: false },
    { w: "Stanford", d: 13.316, b: false },
    { w: "MBA", d: 13.345, b: false },
    { w: "candidate", d: 13.374, b: false },
    { w: "from", d: 13.403, b: false },
    { w: "Portland.", d: 13.432, b: false },
    { w: "As", d: 13.461, b: false },
    { w: "you're", d: 13.490, b: true },
    { w: "hiring", d: 13.519, b: true },
    { w: "for", d: 13.548, b: true },
    { w: "a", d: 13.577, b: true },
    { w: "shoe", d: 13.606, b: true },
    { w: "salesman", d: 13.635, b: true },
    { w: "for", d: 13.664, b: true },
    { w: "your", d: 13.693, b: true },
    { w: "Eugene", d: 13.722, b: true },
    { w: "running", d: 13.751, b: true },
    { w: "store,", d: 13.780, b: true },
    { w: "he", d: 13.809, b: false },
    { w: "would", d: 13.838, b: false },
    { w: "be", d: 13.867, b: false },
    { w: "an", d: 13.896, b: false },
    { w: "unusually", d: 13.925, b: true },
    { w: "good", d: 13.954, b: true },
    { w: "fit.", d: 13.983, b: true },
    { w: "He's", d: 14.012, b: false },
    { w: "a", d: 14.041, b: false },
    { w: "sub-4:15", d: 14.070, b: false },
    { w: "miler", d: 14.099, b: false },
    { w: "so", d: 14.128, b: false },
    { w: "he'll", d: 14.157, b: false },
    { w: "talk", d: 14.186, b: false },
    { w: "credibly", d: 14.215, b: false },
    { w: "to", d: 14.244, b: false },
    { w: "the", d: 14.273, b: false },
    { w: "runners", d: 14.302, b: false },
    { w: "you", d: 14.331, b: false },
    { w: "mentioned", d: 14.360, b: false },
    { w: "losing", d: 14.389, b: false },
    { w: "to", d: 14.418, b: false },
    { w: "the", d: 14.447, b: false },
    { w: "bigger", d: 14.476, b: false },
    { w: "stores.", d: 14.505, b: false },
    { w: "He's", d: 14.534, b: false },
    { w: "currently", d: 14.563, b: true },
    { w: "selling", d: 14.592, b: true },
    { w: "Onitsuka", d: 14.621, b: true },
    { w: "Tigers", d: 14.650, b: true },
    { w: "out", d: 14.679, b: true },
    { w: "of", d: 14.708, b: true },
    { w: "his", d: 14.737, b: true },
    { w: "car", d: 14.766, b: true },
    { w: "at", d: 14.795, b: false },
    { w: "track", d: 14.824, b: false },
    { w: "meets.", d: 14.853, b: false },
    { w: "His", d: 14.882, b: false },
    { w: "Army", d: 14.911, b: false },
    { w: "background", d: 14.940, b: false },
    { w: "reads", d: 14.969, b: false },
    { w: "as", d: 14.998, b: false },
    { w: "reliability", d: 15.027, b: true },
    { w: "under", d: 15.056, b: true },
    { w: "pressure,", d: 15.085, b: true },
    { w: "and", d: 15.114, b: false },
    { w: "his", d: 15.143, b: false },
    { w: "GSB", d: 15.172, b: false },
    { w: "training", d: 15.201, b: false },
    { w: "means", d: 15.230, b: false },
    { w: "he'll", d: 15.259, b: false },
    { w: "grasp", d: 15.288, b: false },
    { w: "your", d: 15.317, b: false },
    { w: "inventory", d: 15.346, b: false },
    { w: "problem", d: 15.375, b: false },
    { w: "in", d: 15.404, b: false },
    { w: "one", d: 15.433, b: false },
    { w: "conversation.", d: 15.462, b: false },
    { w: "Two", d: 15.491, b: true },
    { w: "flags", d: 15.520, b: true },
    { w: "worth", d: 15.549, b: true },
    { w: "naming:", d: 15.578, b: true },
    { w: "he's", d: 15.607, b: false },
    { w: "building", d: 15.636, b: false },
    { w: "Blue", d: 15.665, b: false },
    { w: "Ribbon", d: 15.694, b: false },
    { w: "Sports", d: 15.723, b: false },
    { w: "on", d: 15.752, b: false },
    { w: "the", d: 15.781, b: false },
    { w: "side,", d: 15.810, b: false },
    { w: "and", d: 15.839, b: false },
    { w: "if", d: 15.868, b: false },
    { w: "you", d: 15.897, b: false },
    { w: "stock", d: 15.926, b: false },
    { w: "Adidas", d: 15.955, b: false },
    { w: "or", d: 15.984, b: false },
    { w: "Puma", d: 16.013, b: false },
    { w: "he", d: 16.042, b: false },
    { w: "has", d: 16.071, b: false },
    { w: "strong", d: 16.100, b: false },
    { w: "opinions", d: 16.129, b: false },
    { w: "about", d: 16.158, b: false },
    { w: "both…", d: 16.187, b: false },
  ],
  [
    { w: "I", d: 16.216, b: true },
    { w: "recommend", d: 16.245, b: true },
    { w: "you", d: 16.274, b: true },
    { w: "hire", d: 16.303, b: true },
    { w: "this", d: 16.332, b: true },
    { w: "man", d: 16.361, b: true },
    { w: "if", d: 16.390, b: true },
    { w: "you", d: 16.419, b: true },
    { w: "have", d: 16.448, b: true },
    { w: "a", d: 16.477, b: true },
    { w: "chance", d: 16.506, b: true },
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

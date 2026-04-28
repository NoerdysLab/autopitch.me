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

// Stream timing: starts 13.400s into the 20s loop, ~29ms per word.
// 115 words across two paragraphs. Last word lands at 16.706s, leaving
// ~2.3s of dwell on the closing recommendation before the AI scene
// fades out at 19s.
const RESPONSE: Word[][] = [
  [
    { w: "Phil", d: 13.400, b: true },
    { w: "Knight", d: 13.429, b: true },
    { w: "is", d: 13.458, b: false },
    { w: "a", d: 13.487, b: false },
    { w: "Stanford", d: 13.516, b: false },
    { w: "MBA", d: 13.545, b: false },
    { w: "candidate", d: 13.574, b: false },
    { w: "from", d: 13.603, b: false },
    { w: "Portland.", d: 13.632, b: false },
    { w: "As", d: 13.661, b: false },
    { w: "you're", d: 13.690, b: true },
    { w: "hiring", d: 13.719, b: true },
    { w: "for", d: 13.748, b: true },
    { w: "a", d: 13.777, b: true },
    { w: "shoe", d: 13.806, b: true },
    { w: "salesman", d: 13.835, b: true },
    { w: "for", d: 13.864, b: true },
    { w: "your", d: 13.893, b: true },
    { w: "Eugene", d: 13.922, b: true },
    { w: "running", d: 13.951, b: true },
    { w: "store,", d: 13.980, b: true },
    { w: "he", d: 14.009, b: false },
    { w: "would", d: 14.038, b: false },
    { w: "be", d: 14.067, b: false },
    { w: "an", d: 14.096, b: false },
    { w: "unusually", d: 14.125, b: true },
    { w: "good", d: 14.154, b: true },
    { w: "fit.", d: 14.183, b: true },
    { w: "He's", d: 14.212, b: false },
    { w: "a", d: 14.241, b: false },
    { w: "sub-4:15", d: 14.270, b: false },
    { w: "miler", d: 14.299, b: false },
    { w: "so", d: 14.328, b: false },
    { w: "he'll", d: 14.357, b: false },
    { w: "talk", d: 14.386, b: false },
    { w: "credibly", d: 14.415, b: false },
    { w: "to", d: 14.444, b: false },
    { w: "the", d: 14.473, b: false },
    { w: "runners", d: 14.502, b: false },
    { w: "you", d: 14.531, b: false },
    { w: "mentioned", d: 14.560, b: false },
    { w: "losing", d: 14.589, b: false },
    { w: "to", d: 14.618, b: false },
    { w: "the", d: 14.647, b: false },
    { w: "bigger", d: 14.676, b: false },
    { w: "stores.", d: 14.705, b: false },
    { w: "He's", d: 14.734, b: false },
    { w: "currently", d: 14.763, b: true },
    { w: "selling", d: 14.792, b: true },
    { w: "Onitsuka", d: 14.821, b: true },
    { w: "Tigers", d: 14.850, b: true },
    { w: "out", d: 14.879, b: true },
    { w: "of", d: 14.908, b: true },
    { w: "his", d: 14.937, b: true },
    { w: "car", d: 14.966, b: true },
    { w: "at", d: 14.995, b: false },
    { w: "track", d: 15.024, b: false },
    { w: "meets.", d: 15.053, b: false },
    { w: "His", d: 15.082, b: false },
    { w: "Army", d: 15.111, b: false },
    { w: "background", d: 15.140, b: false },
    { w: "reads", d: 15.169, b: false },
    { w: "as", d: 15.198, b: false },
    { w: "reliability", d: 15.227, b: true },
    { w: "under", d: 15.256, b: true },
    { w: "pressure,", d: 15.285, b: true },
    { w: "and", d: 15.314, b: false },
    { w: "his", d: 15.343, b: false },
    { w: "GSB", d: 15.372, b: false },
    { w: "training", d: 15.401, b: false },
    { w: "means", d: 15.430, b: false },
    { w: "he'll", d: 15.459, b: false },
    { w: "grasp", d: 15.488, b: false },
    { w: "your", d: 15.517, b: false },
    { w: "inventory", d: 15.546, b: false },
    { w: "problem", d: 15.575, b: false },
    { w: "in", d: 15.604, b: false },
    { w: "one", d: 15.633, b: false },
    { w: "conversation.", d: 15.662, b: false },
    { w: "Two", d: 15.691, b: true },
    { w: "flags", d: 15.720, b: true },
    { w: "worth", d: 15.749, b: true },
    { w: "naming:", d: 15.778, b: true },
    { w: "he's", d: 15.807, b: false },
    { w: "building", d: 15.836, b: false },
    { w: "Blue", d: 15.865, b: false },
    { w: "Ribbon", d: 15.894, b: false },
    { w: "Sports", d: 15.923, b: false },
    { w: "on", d: 15.952, b: false },
    { w: "the", d: 15.981, b: false },
    { w: "side,", d: 16.010, b: false },
    { w: "and", d: 16.039, b: false },
    { w: "if", d: 16.068, b: false },
    { w: "you", d: 16.097, b: false },
    { w: "stock", d: 16.126, b: false },
    { w: "Adidas", d: 16.155, b: false },
    { w: "or", d: 16.184, b: false },
    { w: "Puma", d: 16.213, b: false },
    { w: "he", d: 16.242, b: false },
    { w: "has", d: 16.271, b: false },
    { w: "strong", d: 16.300, b: false },
    { w: "opinions", d: 16.329, b: false },
    { w: "about", d: 16.358, b: false },
    { w: "both…", d: 16.387, b: false },
  ],
  [
    { w: "I", d: 16.416, b: true },
    { w: "recommend", d: 16.445, b: true },
    { w: "you", d: 16.474, b: true },
    { w: "hire", d: 16.503, b: true },
    { w: "this", d: 16.532, b: true },
    { w: "man", d: 16.561, b: true },
    { w: "if", d: 16.590, b: true },
    { w: "you", d: 16.619, b: true },
    { w: "have", d: 16.648, b: true },
    { w: "a", d: 16.677, b: true },
    { w: "chance", d: 16.706, b: true },
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

      <section className="dx-scene dx-scene-pitch">
        <div className="dx-url-bar">
          warmpitch.me/<span className="dx-strong">k7n2</span>
        </div>
        <div className="dx-pitch-label dx-pitch-label-self">Your page</div>
        <div className="dx-pitch-label dx-pitch-label-recipient">
          Recruiter&apos;s screen
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

      <section className="dx-scene dx-scene-text dx-scene-text-self">
        <div className="dx-text-frame">
          <div className="dx-text-header">
            <span className="dx-text-back">‹</span>
            <span className="dx-text-contact">Recruiter</span>
          </div>
          <div className="dx-text-body">
            <div className="dx-text-bubble dx-text-bubble-out">
              Here, use this — warmpitch.me/k7n2
            </div>
            <div className="dx-text-status">Delivered</div>
          </div>
          <div className="dx-text-input">iMessage</div>
        </div>
      </section>

      <section className="dx-scene dx-scene-text dx-scene-text-recipient">
        <div className="dx-text-frame">
          <div className="dx-text-header">
            <span className="dx-text-back">‹</span>
            <span className="dx-text-contact">Phil Knight</span>
          </div>
          <div className="dx-text-body">
            <div className="dx-text-bubble dx-text-bubble-in">
              Here, use this — warmpitch.me/k7n2
            </div>
          </div>
          <div className="dx-text-input">iMessage</div>
        </div>
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

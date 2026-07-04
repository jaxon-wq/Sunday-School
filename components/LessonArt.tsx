"use client";

import { useId } from "react";
import type { ReactNode } from "react";

// Original poster-style artwork for each Come, Follow Me lesson week.
// Each theme is an abstract SVG scene; weeks map onto ~30 shared motifs.

const SIL = "#050b1c"; // silhouette color

const STARS: [number, number, number][] = [
  [20, 18, 1.4], [55, 40, 1], [90, 14, 1.2], [130, 32, 0.9], [170, 12, 1.3],
  [205, 38, 1], [240, 20, 1.5], [275, 44, 1], [300, 16, 1.1], [35, 70, 0.8],
  [260, 66, 0.9], [305, 80, 1.2], [150, 55, 0.8], [110, 62, 1],
];

type Theme = {
  top: string;
  bottom: string;
  accent: string;
  night?: boolean;
  draw: (g: string, a: string) => ReactNode;
};

const drawMount = (g: string, a: string): ReactNode => (
  <>
    <polygon points="120,28 70,180 250,180" fill={a} opacity="0.18" />
    <circle cx="120" cy="34" r="55" fill={g} />
    <path d="M-10 180 L70 96 L120 150 L170 84 L240 180 Z" fill="#0c1530" />
    <path d="M60 180 L120 28 L200 180 Z" fill={SIL} />
    <path d="M120 28 L138 62 L120 58 L106 66 Z" fill={a} opacity="0.9" />
  </>
);

const THEMES: Record<string, Theme> = {
  scroll: {
    top: "#131a3a", bottom: "#3a2c14", accent: "#ffd27a",
    draw: (g) => (
      <>
        <circle cx="160" cy="100" r="85" fill={g} />
        <path d="M160 68 C132 58 96 60 80 68 L80 128 C96 120 132 118 160 128 C188 118 224 120 240 128 L240 68 C224 60 188 58 160 68" fill="#efe3c2" />
        <path d="M160 68 L160 128" stroke="#c9b88e" strokeWidth="3" />
        <path d="M92 82 h52 M92 94 h52 M92 106 h52 M176 82 h52 M176 94 h52 M176 106 h52" stroke="#b3a276" strokeWidth="2.5" />
      </>
    ),
  },
  cosmos: {
    top: "#050b26", bottom: "#14204a", accent: "#7aa2ff", night: true,
    draw: (g, a) => (
      <>
        <circle cx="235" cy="55" r="60" fill={g} />
        <circle cx="235" cy="55" r="26" fill="#3b64d8" />
        <ellipse cx="235" cy="55" rx="44" ry="10" fill="none" stroke={a} strokeWidth="2.5" opacity="0.8" transform="rotate(-18 235 55)" />
        <circle cx="70" cy="130" r="52" fill="#0a1638" />
        <circle cx="70" cy="130" r="52" fill={g} opacity="0.35" />
        <circle cx="132" cy="92" r="6" fill="#ffd27a" />
      </>
    ),
  },
  creation: {
    top: "#070f2a", bottom: "#1a2f6e", accent: "#ffe9a8", night: true,
    draw: (g, a) => (
      <>
        <circle cx="228" cy="70" r="80" fill={g} />
        <circle cx="160" cy="96" r="46" fill="#2f6fdd" />
        <path d="M160 50 A46 46 0 0 0 160 142 Z" fill="#0a1330" opacity="0.75" />
        <path d="M138 84 q14 -10 28 0 q-6 12 -20 10 Z M170 108 q12 -6 22 2 q-8 10 -22 6 Z" fill="#7fd490" />
        <circle cx="278" cy="34" r="12" fill={a} />
      </>
    ),
  },
  eden: {
    top: "#0b2740", bottom: "#0e3b2e", accent: "#9fe08a",
    draw: (g, a) => (
      <>
        <circle cx="160" cy="80" r="75" fill={g} opacity="0.5" />
        <ellipse cx="160" cy="168" rx="150" ry="22" fill="#08251c" />
        <path d="M154 168 C154 130 150 110 140 92 M166 168 C166 130 170 110 182 96" stroke={SIL} strokeWidth="10" fill="none" />
        <circle cx="132" cy="74" r="30" fill="#0d3326" />
        <circle cx="176" cy="58" r="34" fill="#114031" />
        <circle cx="204" cy="86" r="26" fill="#0d3326" />
        <circle cx="150" cy="70" r="4" fill="#ffd166" /><circle cx="186" cy="52" r="4" fill="#ffd166" /><circle cx="204" cy="80" r="4" fill="#ffd166" />
        <path d="M60 162 q18 -10 36 0 q18 10 36 0" stroke={a} strokeWidth="4" fill="none" strokeLinecap="round" />
      </>
    ),
  },
  city: {
    top: "#0d1440", bottom: "#2a1f4e", accent: "#b389ff", night: true,
    draw: (g, a) => (
      <>
        <circle cx="160" cy="120" r="90" fill={g} opacity="0.55" />
        <ellipse cx="160" cy="180" rx="180" ry="34" fill="#120b2e" />
        <path d="M70 168 v-42 h20 v42 M110 168 v-60 h24 v60 M154 168 v-50 h22 v50 M196 168 v-66 h24 v66 M240 168 v-44 h18 v44" fill={SIL} />
        <circle cx="122" cy="102" r="12" fill={SIL} /><circle cx="208" cy="96" r="14" fill={SIL} />
        <path d="M78 138 h6 M96 150 h6 M118 128 h8 M160 132 h8 M204 120 h8 M246 138 h6" stroke={a} strokeWidth="4" opacity="0.9" />
      </>
    ),
  },
  flood: {
    top: "#16324f", bottom: "#0c1f38", accent: "#8fd0ff",
    draw: (g) => (
      <>
        <path d="M40 60 A105 105 0 0 1 250 60" fill="none" stroke="#e05656" strokeWidth="7" opacity="0.65" />
        <path d="M52 68 A93 93 0 0 1 238 68" fill="none" stroke="#ffd166" strokeWidth="7" opacity="0.65" />
        <path d="M64 76 A81 81 0 0 1 226 76" fill="none" stroke="#6fc2ff" strokeWidth="7" opacity="0.65" />
        <circle cx="160" cy="110" r="60" fill={g} opacity="0.5" />
        <path d="M104 112 h112 l-14 26 h-84 Z" fill={SIL} />
        <rect x="132" y="92" width="56" height="22" rx="4" fill="#123152" />
        <path d="M0 148 q40 -14 80 0 t80 0 t80 0 t80 0 V180 H0 Z" fill="#081a30" />
        <path d="M0 162 q40 -12 80 0 t80 0 t80 0 t80 0 V180 H0 Z" fill="#0b2440" />
      </>
    ),
  },
  nightstars: {
    top: "#050a24", bottom: "#101c44", accent: "#cfe0ff", night: true,
    draw: (g, a) => (
      <>
        <circle cx="230" cy="42" r="55" fill={g} opacity="0.8" />
        <circle cx="230" cy="42" r="4" fill={a} />
        <path d="M230 22 v40 M210 42 h40 M216 28 l28 28 M244 28 l-28 28" stroke={a} strokeWidth="2" opacity="0.8" />
        <ellipse cx="160" cy="176" rx="170" ry="20" fill="#0a1330" />
        <path d="M60 164 L110 108 L160 164 Z" fill={SIL} />
        <path d="M104 164 L110 132 L118 164 Z" fill="#1b2c58" />
      </>
    ),
  },
  ladder: {
    top: "#070f2e", bottom: "#1b2a5c", accent: "#9db8ff", night: true,
    draw: (g, a) => (
      <>
        <circle cx="248" cy="36" r="66" fill={g} />
        <path d="M60 180 L212 30 M96 180 L248 30" stroke="#243a75" strokeWidth="7" />
        <path d="M84 156 l38 0 M104 136 l38 0 M124 116 l38 0 M144 96 l38 0 M164 76 l38 0 M184 56 l38 0" stroke={a} strokeWidth="5" opacity="0.9" transform="rotate(-0 0 0)" />
        <ellipse cx="120" cy="178" rx="160" ry="14" fill="#0a1330" />
      </>
    ),
  },
  mount: { top: "#241634", bottom: "#4a2a17", accent: "#ffb45c", draw: drawMount },
  isaiah: { top: "#140f38", bottom: "#31205e", accent: "#b9a4ff", draw: drawMount },
  coat: {
    top: "#171030", bottom: "#241a44", accent: "#ffd166",
    draw: (g) => (
      <>
        {["#e05656", "#f0a13c", "#ecd44f", "#4fae6f", "#5470e0", "#9a5ce0"].map((c, i) => (
          <polygon key={c} points={`160,180 ${-40 + i * 62},-30 ${22 + i * 62},-30`} fill={c} opacity="0.5" />
        ))}
        <circle cx="160" cy="120" r="80" fill={g} opacity="0.4" />
        <path d="M160 74 q-30 10 -34 44 l-14 62 h96 l-14 -62 q-4 -34 -34 -44" fill={SIL} />
        <circle cx="160" cy="62" r="16" fill={SIL} />
      </>
    ),
  },
  egypt: {
    top: "#2a1836", bottom: "#5c2f1a", accent: "#ffb35c",
    draw: (g, a) => (
      <>
        <circle cx="236" cy="58" r="50" fill={g} />
        <circle cx="236" cy="58" r="22" fill={a} />
        <polygon points="96,170 176,58 256,170" fill={SIL} />
        <polygon points="10,170 64,96 118,170" fill="#12203e" />
        <ellipse cx="160" cy="176" rx="180" ry="12" fill="#0d1830" />
      </>
    ),
  },
  flame: {
    top: "#150d2b", bottom: "#331414", accent: "#ffb347",
    draw: (g) => (
      <>
        <circle cx="160" cy="104" r="75" fill={g} />
        <path d="M160 42 C192 80 200 116 160 148 C120 116 128 80 160 42" fill="#ff9d2e" />
        <path d="M160 72 C178 94 180 116 160 136 C140 116 142 94 160 72" fill="#ffd35c" />
        <path d="M160 96 C169 108 169 120 160 130 C151 120 151 108 160 96" fill="#fff3c4" />
        <path d="M112 150 q24 14 48 6 q24 8 48 -6" stroke={SIL} strokeWidth="8" fill="none" strokeLinecap="round" />
      </>
    ),
  },
  easter: {
    top: "#1c1440", bottom: "#54351c", accent: "#ffd98a",
    draw: (g, a) => (
      <>
        <circle cx="160" cy="118" r="95" fill={g} />
        <path d="M110 118 A50 50 0 0 1 210 118 Z" fill={a} />
        <path d="M160 40 v18 M104 60 l12 12 M216 60 l-12 12 M84 100 h16 M220 100 h16" stroke={a} strokeWidth="5" strokeLinecap="round" />
        <path d="M0 180 Q70 128 160 140 Q250 128 320 180 Z" fill="#0d1226" />
        <path d="M36 158 a26 26 0 0 1 52 0 Z" fill={SIL} />
        <circle cx="62" cy="150" r="7" fill="#0d1226" />
        <circle cx="98" cy="156" r="14" fill={SIL} />
      </>
    ),
  },
  sea: {
    top: "#06183a", bottom: "#0b2f5e", accent: "#7fd4ff",
    draw: (g, a) => (
      <>
        <circle cx="160" cy="52" r="55" fill={g} />
        <path d="M0 180 V60 Q60 66 108 46 Q132 84 124 180 Z" fill="#0a2a52" />
        <path d="M320 180 V60 Q260 66 212 46 Q188 84 196 180 Z" fill="#0a2a52" />
        <path d="M0 180 V78 Q56 84 104 62 Q122 96 118 180 Z" fill="#123a6e" />
        <path d="M320 180 V78 Q264 84 216 62 Q198 96 202 180 Z" fill="#123a6e" />
        <polygon points="124,180 196,180 176,64 144,64" fill={a} opacity="0.22" />
        <ellipse cx="160" cy="172" rx="34" ry="6" fill="#d9c9a3" opacity="0.7" />
      </>
    ),
  },
  menorah: {
    top: "#170f30", bottom: "#2c1a3e", accent: "#ffcf6e",
    draw: (g, a) => (
      <>
        <circle cx="160" cy="90" r="75" fill={g} opacity="0.7" />
        <path d="M160 66 V150 M160 150 h0 M136 158 h48 M148 166 h24" stroke={SIL} strokeWidth="7" strokeLinecap="round" />
        <path d="M112 70 v26 a48 30 0 0 0 96 0 v-26 M128 70 v22 a32 22 0 0 0 64 0 v-22 M144 70 v18 a16 14 0 0 0 32 0 v-18" stroke={SIL} strokeWidth="7" fill="none" />
        {[112, 128, 144, 160, 176, 192, 208].map((x) => (
          <ellipse key={x} cx={x} cy={60} rx="4.5" ry="7" fill={a} />
        ))}
      </>
    ),
  },
  serpent: {
    top: "#1b1234", bottom: "#3e2a17", accent: "#e0a75c",
    draw: (g, a) => (
      <>
        <circle cx="160" cy="84" r="65" fill={g} />
        <path d="M160 36 V168 M128 56 h64" stroke={SIL} strokeWidth="8" strokeLinecap="round" />
        <path d="M160 64 q26 12 0 26 q-26 14 0 28 q26 14 0 28" stroke={a} strokeWidth="7" fill="none" strokeLinecap="round" />
        <ellipse cx="160" cy="174" rx="150" ry="12" fill="#12203e" />
      </>
    ),
  },
  walls: {
    top: "#201636", bottom: "#4a3218", accent: "#ffcf7a",
    draw: (g, a) => (
      <>
        <circle cx="60" cy="60" r="55" fill={g} />
        <path d="M20 64 q60 -18 120 0 M20 84 q60 -18 120 0 M20 104 q60 -18 120 0" stroke={a} strokeWidth="4" fill="none" opacity="0.75" />
        <path d="M170 180 v-72 h-12 v-12 h12 v-8 h12 v8 h12 v12 h-12 v72 Z" fill={SIL} transform="translate(-14 0)" />
        <path d="M210 180 v-96 h-14 v-14 h14 v-10 h14 v10 h14 v14 h-14 v96 Z" fill={SIL} />
        <path d="M262 180 v-66 h-12 v-12 h12 v-8 h12 v8 h12 v12 h-12 v66 Z" fill={SIL} />
        <path d="M222 120 l10 14 l-8 12 l10 14" stroke="#4a3218" strokeWidth="3" fill="none" />
      </>
    ),
  },
  wheat: {
    top: "#2a1a3c", bottom: "#6e4517", accent: "#ffd97a",
    draw: (g, a) => (
      <>
        <circle cx="160" cy="120" r="80" fill={g} />
        <circle cx="160" cy="112" r="34" fill={a} opacity="0.9" />
        <path d="M0 180 Q80 150 160 158 Q240 150 320 180 Z" fill="#1d1230" />
        {[70, 100, 130, 190, 220, 250].map((x, i) => (
          <g key={x} stroke="#2d1c10" strokeWidth="4" fill="#c9992e">
            <path d={`M${x} 172 q${i % 2 ? 6 : -6} -30 0 -54`} fill="none" />
            {[0, 1, 2, 3].map((j) => (
              <ellipse key={j} cx={x + (i % 2 ? 4 - j : j - 4)} cy={124 + j * 10} rx="5" ry="8" stroke="none" />
            ))}
          </g>
        ))}
      </>
    ),
  },
  crown: {
    top: "#160f34", bottom: "#33204e", accent: "#ffd166",
    draw: (g, a) => (
      <>
        <circle cx="160" cy="96" r="70" fill={g} />
        <path d="M110 122 L110 84 L134 104 L160 68 L186 104 L210 84 L210 122 Z" fill={a} />
        <rect x="106" y="122" width="108" height="16" rx="6" fill="#c9992e" />
        <circle cx="160" cy="60" r="6" fill="#fff3c4" />
        <circle cx="132" cy="130" r="4" fill="#e05656" /><circle cx="160" cy="130" r="4" fill="#4fae6f" /><circle cx="188" cy="130" r="4" fill="#5470e0" />
      </>
    ),
  },
  sling: {
    top: "#101736", bottom: "#28324e", accent: "#9fc0ff",
    draw: (g, a) => (
      <>
        <circle cx="80" cy="90" r="55" fill={g} opacity="0.7" />
        <path d="M210 180 v-40 q0 -44 40 -50 q44 -4 56 30 l14 60 Z" fill={SIL} />
        <circle cx="258" cy="66" r="26" fill={SIL} />
        <circle cx="82" cy="118" r="9" fill={SIL} />
        <path d="M82 127 v26 M82 136 l-12 10 M82 136 l12 10 M74 170 l8 -16 l8 16" stroke={SIL} strokeWidth="5" strokeLinecap="round" fill="none" />
        <path d="M96 106 Q170 40 246 60" stroke={a} strokeWidth="3" strokeDasharray="2 7" fill="none" />
        <circle cx="120" cy="166" r="4" fill={a} /><circle cx="134" cy="172" r="4" fill={a} /><circle cx="110" cy="174" r="4" fill={a} />
      </>
    ),
  },
  temple: {
    top: "#130f36", bottom: "#2c2050", accent: "#cdb3ff",
    draw: (g) => (
      <>
        <circle cx="160" cy="86" r="80" fill={g} opacity="0.7" />
        <rect x="86" y="150" width="148" height="12" fill={SIL} />
        <rect x="96" y="140" width="128" height="10" fill="#141d3e" />
        {[106, 136, 166, 196].map((x) => (
          <rect key={x} x={x} y="86" width="18" height="54" fill={SIL} />
        ))}
        <polygon points="92,86 160,50 228,86" fill={SIL} />
        <rect x="150" y="106" width="20" height="34" fill="#2c2050" />
      </>
    ),
  },
  watch: {
    top: "#060b26", bottom: "#182246", accent: "#aebfff", night: true,
    draw: (g, a) => (
      <>
        <circle cx="242" cy="44" r="46" fill={g} />
        <path d="M258 24 a22 22 0 1 0 2 40 a26 26 0 0 1 -2 -40" fill="#e8ecff" />
        <path d="M120 180 L128 78 h32 L168 180 Z" fill={SIL} />
        <path d="M116 78 h56 l-6 -16 h-44 Z" fill={SIL} />
        <path d="M120 62 v-10 h8 v6 h8 v-6 h8 v6 h8 v-6 h8 v6 h8 v-6 h8 v10 Z" fill={SIL} />
        <rect x="138" y="96" width="12" height="16" rx="2" fill={a} />
        <ellipse cx="160" cy="180" rx="170" ry="14" fill="#0a1330" />
      </>
    ),
  },
  harp: {
    top: "#120f38", bottom: "#282054", accent: "#d3b8ff",
    draw: (g, a) => (
      <>
        <circle cx="160" cy="94" r="75" fill={g} opacity="0.8" />
        <path d="M112 60 q-18 60 22 96 M208 60 q18 60 -22 96 M112 60 q48 -26 96 0" stroke={SIL} strokeWidth="9" fill="none" strokeLinecap="round" />
        {[128, 144, 160, 176, 192].map((x, i) => (
          <path key={x} d={`M${x} ${58 - (i === 2 ? 6 : 0)} V${146 - Math.abs(i - 2) * 8}`} stroke={a} strokeWidth="2.5" opacity="0.9" />
        ))}
      </>
    ),
  },
  lamp: {
    top: "#150f30", bottom: "#342414", accent: "#ffd27a",
    draw: (g, a) => (
      <>
        <circle cx="204" cy="86" r="60" fill={g} />
        <ellipse cx="204" cy="96" rx="5" ry="9" fill={a} />
        <path d="M150 118 q-24 2 -30 -10 q10 -10 30 -6 q10 -14 34 -14 q30 0 38 22 q4 16 -14 24 q-30 10 -52 -4 q-6 -6 -6 -12" fill={SIL} />
        <path d="M186 138 h32 M178 148 h48" stroke={SIL} strokeWidth="6" strokeLinecap="round" />
      </>
    ),
  },
  potter: {
    top: "#1c1330", bottom: "#472b17", accent: "#ffab6e",
    draw: (g) => (
      <>
        <circle cx="160" cy="92" r="70" fill={g} opacity="0.8" />
        <path d="M138 58 h44 q-8 10 -6 22 q22 10 20 34 q-2 22 -36 24 q-34 -2 -36 -24 q-2 -24 20 -34 q2 -12 -6 -22" fill={SIL} />
        <ellipse cx="160" cy="146" rx="58" ry="10" fill="#241634" />
        <ellipse cx="160" cy="152" rx="34" ry="6" fill="#12203e" />
      </>
    ),
  },
  wheel: {
    top: "#060c2a", bottom: "#1a1f4e", accent: "#9fd2ff", night: true,
    draw: (g, a) => (
      <>
        <circle cx="160" cy="92" r="80" fill={g} opacity="0.7" />
        <ellipse cx="160" cy="92" rx="62" ry="62" fill="none" stroke={a} strokeWidth="4" />
        <ellipse cx="160" cy="92" rx="62" ry="22" fill="none" stroke={a} strokeWidth="3" opacity="0.85" />
        <ellipse cx="160" cy="92" rx="22" ry="62" fill="none" stroke={a} strokeWidth="3" opacity="0.85" />
        <circle cx="160" cy="92" r="9" fill="#fff3c4" />
        <circle cx="222" cy="92" r="3.5" fill="#fff3c4" /><circle cx="98" cy="92" r="3.5" fill="#fff3c4" /><circle cx="160" cy="30" r="3.5" fill="#fff3c4" /><circle cx="160" cy="154" r="3.5" fill="#fff3c4" />
      </>
    ),
  },
  lion: {
    top: "#1e1330", bottom: "#503018", accent: "#ffb45c",
    draw: (g, a) => (
      <>
        <path d="M20 180 Q30 60 160 52 Q290 60 300 180 Z" fill="#160e26" />
        <circle cx="160" cy="112" r="62" fill={g} />
        <circle cx="160" cy="110" r="42" fill="#7a4a1c" />
        <circle cx="160" cy="114" r="27" fill="#c9903e" />
        <circle cx="149" cy="108" r="4" fill={SIL} /><circle cx="171" cy="108" r="4" fill={SIL} />
        <path d="M160 116 l-6 8 h12 Z" fill={SIL} />
        <path d="M154 124 q6 8 12 0" stroke={SIL} strokeWidth="3" fill="none" />
        <circle cx="134" cy="86" r="8" fill="#7a4a1c" /><circle cx="186" cy="86" r="8" fill="#7a4a1c" />
        <ellipse cx="160" cy="176" rx="120" ry="12" fill={a} opacity="0.25" />
      </>
    ),
  },
  dove: {
    top: "#14204a", bottom: "#2c3f6e", accent: "#eaf2ff",
    draw: (g, a) => (
      <>
        <circle cx="160" cy="86" r="75" fill={g} opacity="0.6" />
        <path d="M120 96 q30 -18 62 -6 q26 8 44 -6 q-8 26 -38 30 q10 8 6 18 q-16 -4 -26 -14 q-40 6 -48 -22" fill={a} />
        <path d="M150 84 q14 -26 44 -22 q-10 20 -26 26" fill="#c9d6f0" />
        <circle cx="216" cy="88" r="2.5" fill={SIL} />
        <path d="M118 100 l-26 14 M92 114 l14 2 M92 114 l4 12" stroke="#7fae6f" strokeWidth="4" strokeLinecap="round" />
      </>
    ),
  },
  whale: {
    top: "#071c38", bottom: "#0c3350", accent: "#86e0d0",
    draw: (g, a) => (
      <>
        <circle cx="120" cy="70" r="55" fill={g} opacity="0.6" />
        <circle cx="104" cy="52" r="3" fill={a} /><circle cx="112" cy="40" r="4" fill={a} /><circle cx="124" cy="30" r="5" fill={a} />
        <path d="M40 118 Q104 66 190 106 Q200 84 226 76 Q220 96 226 112 Q180 148 100 138 Q60 132 40 118" fill={SIL} />
        <circle cx="80" cy="112" r="4" fill={a} />
        <path d="M0 150 q40 -12 80 0 t80 0 t80 0 t80 0 V180 H0 Z" fill="#0a2a44" />
        <path d="M0 164 q40 -10 80 0 t80 0 t80 0 t80 0 V180 H0 Z" fill="#0d3350" />
      </>
    ),
  },
  storm: {
    top: "#131a36", bottom: "#2c3350", accent: "#bfd0ff",
    draw: (g, a) => (
      <>
        <circle cx="160" cy="84" r="75" fill={g} opacity="0.5" />
        <path d="M220 40 q-70 -20 -110 24 q-30 36 8 58 q34 18 58 -6 q18 -20 -2 -36 q-18 -12 -32 2" stroke={a} strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.85" />
        <path d="M60 150 q60 12 200 0" stroke="#0d1226" strokeWidth="20" fill="none" />
        <circle cx="86" cy="136" r="7" fill={SIL} />
        <path d="M86 143 v18 M86 148 l-9 8 M86 148 l9 8" stroke={SIL} strokeWidth="4" strokeLinecap="round" />
      </>
    ),
  },
  sun: {
    top: "#1a1240", bottom: "#6e3d14", accent: "#ffdf7a",
    draw: (g, a) => (
      <>
        <circle cx="160" cy="96" r="95" fill={g} />
        <circle cx="160" cy="96" r="34" fill={a} />
        {Array.from({ length: 12 }, (_, i) => {
          const r = (i * Math.PI) / 6;
          return (
            <polygon
              key={i}
              points={`${160 + Math.cos(r) * 44},${96 + Math.sin(r) * 44} ${160 + Math.cos(r + 0.12) * 66},${96 + Math.sin(r + 0.12) * 66} ${160 + Math.cos(r - 0.12) * 66},${96 + Math.sin(r - 0.12) * 66}`}
              fill={a}
              opacity="0.8"
            />
          );
        })}
        <path d="M0 180 Q80 156 160 160 Q240 156 320 180 Z" fill="#140d26" />
      </>
    ),
  },
  star: {
    top: "#050a2a", bottom: "#141c48", accent: "#fff1b0", night: true,
    draw: (g, a) => (
      <>
        <circle cx="160" cy="52" r="55" fill={g} />
        <path d="M160 20 L166 46 L190 52 L166 58 L160 86 L154 58 L130 52 L154 46 Z" fill={a} />
        <polygon points="156,60 164,60 172,150 148,150" fill={a} opacity="0.25" />
        <path d="M40 168 v-16 h14 v16 M66 168 v-24 h16 l4 -8 l4 8 v24 M104 168 v-14 h12 v14 M196 168 v-18 h14 v18 M222 168 v-26 h18 v26 M254 168 v-14 h12 v14" fill={SIL} />
        <ellipse cx="160" cy="176" rx="180" ry="12" fill="#0a1330" />
      </>
    ),
  },
};

const WEEK_THEME: Record<number, string> = {
  1: "scroll", 2: "cosmos", 3: "creation", 4: "eden", 5: "city", 6: "city",
  7: "flood", 8: "nightstars", 9: "mount", 10: "ladder", 11: "coat",
  12: "egypt", 13: "flame", 14: "easter", 15: "egypt", 16: "sea",
  17: "mount", 18: "menorah", 19: "serpent", 20: "mount", 21: "walls",
  22: "flame", 23: "wheat", 24: "crown", 25: "sling", 26: "temple",
  27: "flame", 28: "flame", 29: "watch", 30: "harp", 31: "city",
  32: "crown", 33: "storm", 34: "harp", 35: "harp", 36: "harp",
  37: "lamp", 38: "isaiah", 39: "isaiah", 40: "isaiah", 41: "isaiah",
  42: "isaiah", 43: "potter", 44: "potter", 45: "wheel", 46: "lion",
  47: "dove", 48: "whale", 49: "watch", 50: "menorah", 51: "sun", 52: "star",
};

export default function LessonArt({
  week,
  className,
}: {
  week: number;
  className?: string;
}) {
  const id = useId().replace(/:/g, "");
  const theme = THEMES[WEEK_THEME[week] ?? "scroll"];
  const glow = `url(#${id}g)`;
  return (
    <svg
      viewBox="0 0 320 180"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      aria-hidden
      style={{ display: "block" }}
    >
      <defs>
        <linearGradient id={`${id}s`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={theme.top} />
          <stop offset="1" stopColor={theme.bottom} />
        </linearGradient>
        <radialGradient id={`${id}g`}>
          <stop offset="0" stopColor={theme.accent} stopOpacity="0.85" />
          <stop offset="1" stopColor={theme.accent} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="320" height="180" fill={`url(#${id}s)`} />
      {theme.night &&
        STARS.map(([x, y, r], i) => (
          <circle key={i} cx={x} cy={y} r={r} fill="#cfe0ff" opacity={0.85 - (i % 3) * 0.22} />
        ))}
      {theme.draw(glow, theme.accent)}
    </svg>
  );
}

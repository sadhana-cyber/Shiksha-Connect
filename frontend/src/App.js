import { useState, useEffect, useRef, useCallback } from "react";
import { Html5Qrcode,Html5QrcodeSupportedFormats } from "html5-qrcode";
import QRCode from "qrcode";

const API = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

// ---------- helpers ----------
const ROMAN = ["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII"];
const romanFromInt = (n) => ROMAN[n - 1] || String(n);
const intFromRoman = (r) => {
  const i = ROMAN.indexOf(String(r).toUpperCase());
  return i === -1 ? null : i + 1;
};
const formatClassLabel = (cls, section) => `${romanFromInt(cls)}-${section}`;
const parseClassLabel = (label) => {
  const [r, s] = String(label).split("-");
  return { class: intFromRoman(r), section: s, roman: r };
};

// All classes supported by seed: 1..10, sections A and B
const CLASSES = (() => {
  const out = [];
  for (let c = 1; c <= 10; c++) {
    for (const s of ["A", "B"]) out.push(formatClassLabel(c, s));
  }
  return out;
})();

async function api(path, opts = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...opts,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || data.error || `Request failed: ${res.status}`);
  return data;
}

// ---------- presentational components (UI unchanged) ----------
function SchoolIllustration() {
  return (
    <svg viewBox="0 0 320 260" className="w-full max-w-xs mx-auto" fill="none">
      <rect width="320" height="260" fill="#EFF6FF" rx="16"/>
      <circle cx="270" cy="40" r="22" fill="#FCD34D"/>
      <ellipse cx="60" cy="45" rx="30" ry="14" fill="white"/>
      <ellipse cx="85" cy="38" rx="22" ry="13" fill="white"/>
      <ellipse cx="180" cy="55" rx="25" ry="12" fill="white"/>
      <ellipse cx="200" cy="48" rx="18" ry="11" fill="white"/>
      <rect y="200" width="320" height="60" fill="#BFDBFE"/>
      <rect x="60" y="110" width="200" height="100" fill="#1D4ED8"/>
      <polygon points="50,110 160,60 270,110" fill="#1E40AF"/>
      <line x1="160" y1="60" x2="160" y2="35" stroke="#1E3A8A" strokeWidth="2"/>
      <polygon points="160,35 178,42 160,49" fill="#EF4444"/>
      <rect x="135" y="155" width="50" height="55" rx="4" fill="#BFDBFE"/>
      <circle cx="155" cy="182" r="3" fill="#1D4ED8"/>
      <rect x="75" y="130" width="40" height="35" rx="4" fill="#BFDBFE"/>
      <line x1="95" y1="130" x2="95" y2="165" stroke="#93C5FD" strokeWidth="1.5"/>
      <line x1="75" y1="147" x2="115" y2="147" stroke="#93C5FD" strokeWidth="1.5"/>
      <rect x="205" y="130" width="40" height="35" rx="4" fill="#BFDBFE"/>
      <line x1="225" y1="130" x2="225" y2="165" stroke="#93C5FD" strokeWidth="1.5"/>
      <line x1="205" y1="147" x2="245" y2="147" stroke="#93C5FD" strokeWidth="1.5"/>
      <rect x="125" y="207" width="70" height="8" rx="2" fill="#1E40AF"/>
      <rect x="115" y="213" width="90" height="8" rx="2" fill="#1E40AF"/>
      <rect x="20" y="175" width="8" height="35" fill="#92400E"/>
      <ellipse cx="24" cy="165" rx="18" ry="22" fill="#16A34A"/>
      <rect x="290" y="175" width="8" height="35" fill="#92400E"/>
      <ellipse cx="294" cy="165" rx="18" ry="22" fill="#16A34A"/>
      <rect x="110" y="90" width="100" height="18" rx="3" fill="#FCD34D"/>
      <text x="160" y="103" textAnchor="middle" fontSize="9" fill="#1E3A8A" fontWeight="bold">SHIKSHA CONNECT</text>
      <circle cx="30" cy="198" r="8" fill="#FDE68A"/>
      <rect x="24" y="205" width="12" height="18" rx="3" fill="#EF4444"/>
      <circle cx="290" cy="198" r="8" fill="#FDE68A"/>
      <rect x="284" y="205" width="12" height="18" rx="3" fill="#3B82F6"/>
    </svg>
  );
}
//Modal Function

function Modal({ message, onConfirm, onCancel, confirmLabel = "Save", cancelLabel = "Cancel" }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm text-center">
        <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z"/>
          </svg>
        </div>
        <p className="text-blue-800 font-semibold text-lg mb-6">{message}</p>
        <div className="flex gap-3 justify-center">
          <button onClick={onConfirm} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors">{confirmLabel}</button>
          <button onClick={onCancel} className="px-6 py-2.5 bg-blue-100 hover:bg-blue-200 text-blue-800 font-semibold rounded-xl transition-colors">{cancelLabel}</button>
        </div>
      </div>
    </div>
  );
}

function Toast({ message }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-blue-700 text-white px-6 py-3 rounded-xl shadow-lg font-medium text-sm z-50 flex items-center gap-2">
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
      </svg>
      {message}
    </div>
  );
}

function NavBar({ title }) {
  return (
    <nav className="bg-white border-b border-blue-100 px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4h4v4H4V4zm8 0h4v4h-4V4zM4 12h4v4H4v-4z"/>
          </svg>
        </div>
        <span className="font-bold text-blue-800 text-sm">Shiksha Connect</span>
      </div>
      {title && <span className="text-xs text-blue-500 font-medium bg-blue-50 px-3 py-1 rounded-full">{title}</span>}
    </nav>
  );
}

function Field({ label, type = "text", value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-sm font-medium text-blue-700 mb-1">{label}</label>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder}
        className="w-full border border-blue-200 rounded-xl px-4 py-3 text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400"/>
    </div>
  );
}

// ---------- pages ----------
// ---------- Welcome / Onboarding Page ----------
function PageWelcome({ go }) {
  return (
    <main className="min-h-screen w-full bg-blue-50 relative overflow-hidden flex items-center justify-center px-4 py-10">
      <style>{`
        @keyframes floatA { 0%,100%{transform:translate(0,0) rotate(0)} 50%{transform:translate(20px,-30px) rotate(15deg)} }
        @keyframes floatB { 0%,100%{transform:translate(0,0) rotate(0)} 50%{transform:translate(-25px,20px) rotate(-10deg)} }
        @keyframes floatC { 0%,100%{transform:translate(0,0) rotate(0)} 50%{transform:translate(15px,25px) rotate(8deg)} }
        @keyframes pulseRing { 0%{transform:scale(1);opacity:.5} 70%{transform:scale(1.6);opacity:0} 100%{opacity:0} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeDown { from{opacity:0;transform:translateY(-12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes shine { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes bookOpen { 0%,100%{transform:rotateY(0deg)} 50%{transform:rotateY(-12deg)} }
        @keyframes bounceArrow { 0%,100%{transform:translateX(0)} 50%{transform:translateX(6px)} }
        .float-a{animation:floatA 7s ease-in-out infinite}
        .float-b{animation:floatB 9s ease-in-out infinite}
        .float-c{animation:floatC 8s ease-in-out infinite}
        .pulse-ring{animation:pulseRing 2.5s cubic-bezier(0,0,.2,1) infinite}
        .fade-up{animation:fadeUp .8s ease-out both}
        .fade-down{animation:fadeDown .7s ease-out both}
        .fade-in{animation:fadeIn 1s ease-out both}
        .delay-1{animation-delay:.15s} .delay-2{animation-delay:.3s} .delay-3{animation-delay:.45s} .delay-4{animation-delay:.6s} .delay-5{animation-delay:.75s}
        .book-anim{animation:bookOpen 4s ease-in-out infinite;transform-origin:center}
        .arrow-bounce{animation:bounceArrow 1.2s ease-in-out infinite}
        .shine-text{background:linear-gradient(90deg,#1e40af 0%,#3b82f6 25%,#93c5fd 50%,#3b82f6 75%,#1e40af 100%);background-size:200% auto;-webkit-background-clip:text;background-clip:text;color:transparent;animation:shine 3.5s linear infinite}
      `}</style>

      {/* Top-right Help / About buttons */}
      <div className="absolute top-5 right-5 z-20 flex gap-3 fade-down">
        <button
          onClick={() => go("help")}
          className="group flex items-center gap-2 bg-white/90 backdrop-blur hover:bg-white text-blue-700 hover:text-blue-900 font-semibold text-sm px-4 py-2.5 rounded-full shadow-md hover:shadow-lg border border-blue-100 transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-12 transition-transform duration-300">
            <circle cx="12" cy="12" r="10"/>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <span>Help</span>
        </button>
        <button
          onClick={() => go("about")}
          className="group flex items-center gap-2 bg-white/90 backdrop-blur hover:bg-white text-blue-700 hover:text-blue-900 font-semibold text-sm px-4 py-2.5 rounded-full shadow-md hover:shadow-lg border border-blue-100 transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform duration-300">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="16" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
          <span>About</span>
        </button>
      </div>

      <div className="absolute top-10 left-10 w-24 h-24 bg-blue-200/50 rounded-3xl float-a" />
      <div className="absolute top-1/3 right-16 w-16 h-16 bg-blue-300/40 rounded-full float-b" />
      <div className="absolute bottom-20 left-1/4 w-20 h-20 bg-blue-400/30 rounded-2xl float-c" />
      <div className="absolute top-1/2 left-10 w-12 h-12 bg-blue-300/40 rounded-full float-b" />
      <div className="absolute bottom-32 right-24 w-28 h-28 bg-blue-200/40 rounded-full float-a" />
      <div className="absolute top-20 right-1/3 w-10 h-10 bg-blue-400/30 rounded-xl float-c" />

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[400px] h-[400px] rounded-full bg-blue-200/20 blur-3xl" />
      </div>

      <div className="relative bg-white rounded-3xl shadow-2xl px-8 sm:px-12 py-12 max-w-lg w-full text-center">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-100 text-blue-700 text-xs font-semibold px-4 py-1.5 rounded-full fade-in">
          v1.0 · Smart Attendance
        </div>

        <div className="relative w-24 h-24 mx-auto mb-6 fade-up">
          <span className="absolute inset-0 rounded-2xl bg-blue-400 pulse-ring" />
          <span className="absolute inset-0 rounded-2xl bg-blue-400 pulse-ring" style={{ animationDelay: "1.25s" }} />
          <div className="relative w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg book-anim">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
          </div>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight fade-up delay-1 shine-text">
          Shiksha Connect
        </h1>

        <p className="mt-3 text-blue-500 font-medium text-sm tracking-wide fade-up delay-2">
          SMART · SIMPLE · SECURE
        </p>

        <p className="mt-5 text-blue-800/80 text-base leading-relaxed fade-up delay-2">
          QR-powered attendance management for modern classrooms.
          Mark, track and report — all in seconds.
        </p>

        <div className="mt-7 grid grid-cols-3 gap-3 fade-up delay-3">
          <WelcomeFeature label="Scan QR" icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h-3zM21 14h-4M14 21h3M21 17v4"/>
            </svg>
          }/>
          <WelcomeFeature label="Track" icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3v18h18"/><path d="M7 14l4-4 4 4 5-7"/>
            </svg>
          }/>
          <WelcomeFeature label="Report" icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <path d="M14 2v6h6M9 13h6M9 17h4"/>
            </svg>
          }/>
        </div>

        <button
          onClick={() => go("role")}
          className="mt-8 w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold text-lg rounded-2xl shadow-lg shadow-blue-600/40 hover:shadow-xl hover:shadow-blue-600/50 transition-all duration-300 hover:scale-[1.02] active:scale-[0.97] flex items-center justify-center gap-2 fade-up delay-4"
        >
          <span>Get Started</span>
          <span className="arrow-bounce">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </span>
        </button>

        <p className="mt-5 text-xs text-blue-400 fade-up delay-5">
          Built for teachers, students &amp; school admins
        </p>
      </div>
    </main>
  );
}

function WelcomeFeature({ label, icon }) {
  return (
    <div className="flex flex-col items-center gap-1.5 bg-blue-50 hover:bg-blue-100 rounded-xl py-3 transition-colors">
      <span className="text-blue-600">{icon}</span>
      <span className="text-blue-800 text-xs font-semibold">{label}</span>
    </div>
  );
}

function PageRoleSelect({ go }) {
  return (
    <main className="min-h-screen bg-blue-50 flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <style>{`
        @keyframes rsFloat1 { 0%,100%{transform:translate(0,0) rotate(0)} 50%{transform:translate(18px,-22px) rotate(8deg)} }
        @keyframes rsFloat2 { 0%,100%{transform:translate(0,0) rotate(0)} 50%{transform:translate(-22px,18px) rotate(-10deg)} }
        @keyframes rsFloat3 { 0%,100%{transform:translate(0,0) rotate(0)} 50%{transform:translate(14px,20px) rotate(6deg)} }
        @keyframes rsCardIn { from{opacity:0;transform:translateY(28px) scale(.96)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes rsFadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes rsIconPop { from{opacity:0;transform:scale(.4) rotate(-25deg)} to{opacity:1;transform:scale(1) rotate(0)} }
        @keyframes rsPulseRing { 0%{transform:scale(1);opacity:.45} 70%{transform:scale(1.55);opacity:0} 100%{opacity:0} }
        @keyframes rsShimmer { 0%{transform:translateX(-120%) skewX(-20deg)} 100%{transform:translateX(220%) skewX(-20deg)} }
        @keyframes rsBadge { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-3px)} }
        .rs-float-1{animation:rsFloat1 8s ease-in-out infinite}
        .rs-float-2{animation:rsFloat2 10s ease-in-out infinite}
        .rs-float-3{animation:rsFloat3 9s ease-in-out infinite}
        .rs-card{animation:rsCardIn .7s cubic-bezier(.2,.9,.3,1.2) both}
        .rs-fade-up{animation:rsFadeUp .6s ease-out both}
        .rs-icon-pop{animation:rsIconPop .8s cubic-bezier(.2,.9,.3,1.4) both}
        .rs-pulse{animation:rsPulseRing 2.4s cubic-bezier(0,0,.2,1) infinite}
        .rs-d1{animation-delay:.1s} .rs-d2{animation-delay:.22s} .rs-d3{animation-delay:.34s} .rs-d4{animation-delay:.46s}
        .rs-badge{animation:rsBadge 2.4s ease-in-out infinite}
        .rs-shimmer-wrap{position:relative;overflow:hidden}
        .rs-shimmer-wrap::after{content:"";position:absolute;top:0;left:0;width:60%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.35),transparent);animation:rsShimmer 2.6s ease-in-out infinite}
      `}</style>

      {/* Decorative floating shapes */}
      <div className="absolute top-12 left-10 w-20 h-20 bg-blue-200/50 rounded-3xl rs-float-1" />
      <div className="absolute top-24 right-16 w-14 h-14 bg-blue-300/40 rounded-full rs-float-2" />
      <div className="absolute bottom-16 left-1/4 w-16 h-16 bg-blue-400/30 rounded-2xl rs-float-3" />
      <div className="absolute bottom-24 right-20 w-24 h-24 bg-blue-200/40 rounded-full rs-float-1" />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[420px] h-[420px] rounded-full bg-blue-200/20 blur-3xl" />
      </div>

      <div className="relative bg-white rounded-2xl shadow-xl p-10 w-full max-w-md flex flex-col items-center gap-6 rs-card">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-3">
            <span className="absolute inset-0 rounded-2xl bg-blue-400 rs-pulse" />
            <span className="absolute inset-0 rounded-2xl bg-blue-400 rs-pulse" style={{ animationDelay: "1.2s" }} />
            <div className="relative w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg rs-icon-pop">
              <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-blue-800 tracking-tight rs-fade-up rs-d1">Shiksha Connect</h1>
          <p className="mt-2 text-sm text-blue-500 font-medium rs-fade-up rs-d2">Choose how you want to continue</p>
        </div>

        <div className="w-full h-px bg-blue-100 rs-fade-up rs-d2"/>

        <div className="w-full flex flex-col gap-4">
          <button
            onClick={() => go("teacher-login")}
            className="rs-shimmer-wrap group relative w-full py-4 px-5 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl shadow-md hover:shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 transition-all duration-300 hover:-translate-y-0.5 active:scale-[.97] rs-fade-up rs-d3"
          >
            <span className="relative z-10 flex items-center justify-center gap-3">
              <span className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center group-hover:rotate-6 group-hover:scale-110 transition-transform duration-300">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                  <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                </svg>
              </span>
              <span>Teacher</span>
              <svg className="ml-1 w-5 h-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </span>
          </button>

          <button
            onClick={() => go("admin-login")}
            className="rs-shimmer-wrap group relative w-full py-4 px-5 text-lg font-semibold text-white bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 rounded-xl shadow-md hover:shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all duration-300 hover:-translate-y-0.5 active:scale-[.97] rs-fade-up rs-d4"
          >
            <span className="relative z-10 flex items-center justify-center gap-3">
              <span className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center group-hover:rotate-6 group-hover:scale-110 transition-transform duration-300">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </span>
              <span>Admin</span>
              <svg className="ml-1 w-5 h-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </span>
          </button>
        </div>

        <div className="rs-fade-up rs-d4">
          <span className="inline-block bg-blue-50 text-blue-600 text-xs font-semibold px-3 py-1 rounded-full rs-badge">Secure · Role-based access</span>
        </div>
      </div>
    </main>
  );
}

// ---------- Help Page ----------
function PageHelp({ go }) {
  const steps = [
    {
      title: "Allow camera access",
      body: "When you tap Scan QR, your browser will ask permission to use the webcam. Tap Allow — without it the scanner cannot see the QR codes.",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
          <circle cx="12" cy="13" r="4"/>
        </svg>
      ),
    },
    {
      title: "Sit in good light",
      body: "Hold the student ID card 15–20 cm from the camera in a well-lit area. Avoid glare on the card surface so the QR pattern stays sharp.",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4"/>
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
        </svg>
      ),
    },
    {
      title: "Center the QR code",
      body: "Place the QR inside the square frame on screen. The blue corner brackets help you line it up. Keep the card flat and steady.",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
          <rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h-3zM21 14h-4M14 21h3M21 17v4"/>
        </svg>
      ),
    },
    {
      title: "Wait for the blue flash",
      body: "When a QR is read, the screen briefly flashes blue and the student's name appears in the scanned list. There is no need to press a button — just present the next card.",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      ),
    },
    {
      title: "If a student forgot the card",
      body: "Switch to the Hard Copy mode and scan the printed backup QR sheet kept in class. Attendance is marked the same way.",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <path d="M14 2v6h6"/>
        </svg>
      ),
    },
    {
      title: "Review the absentees",
      body: "Anyone whose QR was not scanned is automatically listed as absent. Check the absentee list before saving so you can correct mistakes.",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 11H4l5-9v6h5l-5 9z"/>
        </svg>
      ),
    },
    {
      title: "Save attendance",
      body: "Tap Save Attendance and confirm. The records are stored in the school database. You will see a confirmation toast and return to the dashboard.",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
          <polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
        </svg>
      ),
    },
  ];

  return (
    <main className="min-h-screen bg-blue-50 relative overflow-hidden px-4 py-10">
      <style>{`
        @keyframes hpFadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes hpFadeRight { from{opacity:0;transform:translateX(-18px)} to{opacity:1;transform:translateX(0)} }
        @keyframes hpFloat { 0%,100%{transform:translate(0,0)} 50%{transform:translate(15px,-18px)} }
        @keyframes hpRingDraw { from{stroke-dashoffset:160} to{stroke-dashoffset:0} }
        .hp-fade-up{animation:hpFadeUp .65s ease-out both}
        .hp-fade-right{animation:hpFadeRight .55s ease-out both}
        .hp-float{animation:hpFloat 9s ease-in-out infinite}
        .hp-step{opacity:0;animation:hpFadeRight .6s ease-out forwards}
        .hp-ring{stroke-dasharray:160;animation:hpRingDraw 1.2s ease-out forwards}
      `}</style>

      <div className="absolute top-10 right-10 w-24 h-24 bg-blue-200/50 rounded-3xl hp-float" />
      <div className="absolute bottom-20 left-12 w-16 h-16 bg-blue-300/40 rounded-full hp-float" style={{ animationDelay: "2s" }}/>

      <div className="relative max-w-3xl mx-auto">
        <div className="text-center mb-8 hp-fade-up">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <svg className="absolute inset-0" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="28" fill="none" stroke="#3B82F6" strokeWidth="3" className="hp-ring" />
            </svg>
            <div className="absolute inset-2 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center shadow-lg">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
          </div>
          <h1 className="text-4xl font-extrabold text-blue-800 tracking-tight">How it works</h1>
          <p className="mt-2 text-blue-600 max-w-xl mx-auto">A quick first-time guide for marking attendance with the webcam QR scanner.</p>
        </div>

        <ol className="flex flex-col gap-4 mb-8">
          {steps.map((s, i) => (
            <li
              key={i}
              className="hp-step bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow p-5 flex gap-4 items-start border border-blue-100"
              style={{ animationDelay: `${0.1 + i * 0.1}s` }}
            >
              <div className="flex-shrink-0 relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-md">
                  {i + 1}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white border border-blue-200 text-blue-600 rounded-full flex items-center justify-center shadow-sm">
                  {s.icon}
                </div>
              </div>
              <div className="flex-1 pt-1">
                <h3 className="text-lg font-semibold text-blue-800">{s.title}</h3>
                <p className="mt-1 text-sm text-blue-700/80 leading-relaxed">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="bg-white rounded-2xl shadow-md p-5 mb-6 border-l-4 border-blue-500 hp-fade-up" style={{ animationDelay: "1s" }}>
          <h4 className="text-sm font-bold text-blue-800 flex items-center gap-2 mb-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            Tip
          </h4>
          <p className="text-sm text-blue-700/80">
            If the camera does not start, refresh the page and tap Allow when the browser asks again. On a phone, use the back camera for clearer scans.
          </p>
        </div>

        <button
          onClick={() => go("welcome")}
          className="group flex items-center gap-2 mx-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 transition-all duration-300 hover:-translate-y-0.5 active:scale-95 hp-fade-up"
          style={{ animationDelay: "1.1s" }}
        >
          <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          <span>Back to Home</span>
        </button>
      </div>
    </main>
  );
}

// ---------- About Page ----------
function PageAbout({ go }) {
  const team = [
    { name: "Poovitha S",         id: "24Z248" },
    { name: "Priya K",            id: "24Z258" },
    { name: "Sadhana S",          id: "24Z265" },
    { name: "Sakthi Gowshika M",  id: "24Z267" },
    { name: "Sneha P",            id: "24Z273" },
    { name: "Swethi J",           id: "24Z278" },
  ];

  const beneficiaries = [
    { who: "Teachers", desc: "Save classroom time — no more manual roll calls or paper registers. Scan, confirm, save." },
    { who: "Students", desc: "Accurate attendance, fair tracking, and no missed records due to register errors." },
    { who: "School Admins", desc: "One-tap weekly and monthly reports, easy QR generation, and centralized records." },
    { who: "Government", desc: "Reliable, timely attendance data to plan welfare schemes such as mid-day meals and scholarships." },
  ];

  return (
    <main className="min-h-screen bg-blue-50 relative overflow-hidden px-4 py-10">
      <style>{`
        @keyframes apFadeUp { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
        @keyframes apFloat { 0%,100%{transform:translate(0,0) rotate(0)} 50%{transform:translate(-18px,20px) rotate(-8deg)} }
        @keyframes apPop { from{opacity:0;transform:scale(.85)} to{opacity:1;transform:scale(1)} }
        @keyframes apShine { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        .ap-fade-up{opacity:0;animation:apFadeUp .65s ease-out forwards}
        .ap-float{animation:apFloat 9s ease-in-out infinite}
        .ap-pop{opacity:0;animation:apPop .55s cubic-bezier(.2,.9,.3,1.4) forwards}
        .ap-shine{background:linear-gradient(90deg,#1e40af,#3b82f6,#93c5fd,#3b82f6,#1e40af);background-size:200% auto;-webkit-background-clip:text;background-clip:text;color:transparent;animation:apShine 4s linear infinite}
      `}</style>

      <div className="absolute top-10 left-12 w-24 h-24 bg-blue-200/50 rounded-3xl ap-float" />
      <div className="absolute bottom-24 right-16 w-20 h-20 bg-blue-300/40 rounded-full ap-float" style={{ animationDelay: "2s" }}/>
      <div className="absolute top-1/2 right-10 w-12 h-12 bg-blue-400/30 rounded-2xl ap-float" style={{ animationDelay: "4s" }}/>

      <div className="relative max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10 ap-fade-up">
          <div className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-4">SIH-25012 · Project</div>
          <h1 className="text-5xl font-extrabold tracking-tight ap-shine">About Shiksha Connect</h1>
          <p className="mt-3 text-blue-700/80 max-w-2xl mx-auto">
            A simple, low-cost QR-based attendance system built for rural schools — designed to replace paper registers
            with a fast, reliable digital workflow that runs on a basic smartphone.
          </p>
        </div>

        {/* Why we chose this */}
        <section className="bg-white rounded-2xl shadow-md p-7 mb-8 ap-fade-up" style={{ animationDelay: "0.15s" }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-md">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z"/>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-blue-800">Why we chose this project</h2>
          </div>
          <p className="text-blue-700/85 leading-relaxed">
            Rural schools across India still rely on manual paper attendance, which is slow, error-prone, and pulls
            teachers away from teaching. Inaccurate records also disrupt welfare programs like mid-day meals and
            scholarships. With basic smartphones now widely available, we wanted to build a low-cost, low-training
            digital tool that fits the way these schools actually work — fast to learn, accurate, and offline-friendly.
          </p>
          <p className="mt-3 text-blue-700/85 leading-relaxed">
            Our goal is simple: give a teacher a phone, a class, and a stack of student ID cards — and let them mark
            an entire class in under a minute, with reports ready for the school office and the government at the end
            of every week.
          </p>
        </section>

        {/* Who benefits */}
        <section className="bg-white rounded-2xl shadow-md p-7 mb-8 ap-fade-up" style={{ animationDelay: "0.3s" }}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-md">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-blue-800">Who benefits</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {beneficiaries.map((b, i) => (
              <div
                key={b.who}
                className="ap-pop bg-blue-50 hover:bg-blue-100 transition-colors rounded-xl p-4 border border-blue-100"
                style={{ animationDelay: `${0.45 + i * 0.1}s` }}
              >
                <h3 className="font-bold text-blue-800 mb-1">{b.who}</h3>
                <p className="text-sm text-blue-700/80 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Team */}
        <section className="bg-white rounded-2xl shadow-md p-7 mb-8 ap-fade-up" style={{ animationDelay: "0.5s" }}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-md">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="8.5" cy="7" r="4"/>
                <path d="M20 8v6M23 11h-6"/>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-blue-800">Our team</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {team.map((m, i) => {
              const initials = m.name.split(" ").map(p => p[0]).slice(0, 2).join("");
              return (
                <div
                  key={m.id}
                  className="ap-pop group bg-gradient-to-br from-blue-50 to-white border border-blue-100 hover:border-blue-300 rounded-2xl p-5 flex items-center gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                  style={{ animationDelay: `${0.6 + i * 0.08}s` }}
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-lg flex items-center justify-center shadow-md group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                    {initials}
                  </div>
                  <div>
                    <p className="font-semibold text-blue-800">{m.name}</p>
                    <p className="text-xs text-blue-500 font-mono">{m.id}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <button
          onClick={() => go("welcome")}
          className="group flex items-center gap-2 mx-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 transition-all duration-300 hover:-translate-y-0.5 active:scale-95 ap-fade-up"
          style={{ animationDelay: "0.9s" }}
        >
          <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          <span>Back to Home</span>
        </button>
      </div>
    </main>
  );
}

function PageTeacherLogin({ go, setTeacher }) {
  const [classId, setClassId] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async () => {
    if (!classId.trim() || !pass.trim()) { setErr("Please fill in all fields."); return; }
    setErr(""); setLoading(true);
    try {
      const res = await api("/api/auth/teacher-login", {
        method: "POST",
        body: { user_id: classId.trim().toUpperCase(), password: pass },
      });
      setTeacher(res.teacher);
      go("teacher-dashboard");
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <main className="min-h-screen bg-blue-50 flex items-center justify-center px-4 py-8 relative overflow-hidden">
      <div className="absolute top-12 left-10 w-20 h-20 bg-blue-200/50 rounded-3xl sc-float-a"/>
      <div className="absolute bottom-16 right-16 w-24 h-24 bg-blue-300/40 rounded-full sc-float-b"/>
      <div className="absolute top-1/2 right-12 w-12 h-12 bg-blue-400/30 rounded-2xl sc-float-c"/>
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-3xl flex flex-col md:flex-row overflow-hidden sc-card-pop">
        <div className="md:w-1/2 sc-fade-left sc-d2"><AnimatedLoginHero title="Welcome, Teacher" subtitle="Mark attendance with a single scan" icon="🧑‍🏫"/></div>
        <div className="flex flex-col justify-center p-8 md:w-1/2 gap-5">
          <div className="sc-fade-up sc-d2">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">Teacher Login</h2>
            <p className="text-sm text-blue-400 mt-1">Shiksha Connect</p>
          </div>
          {err && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2 sc-fade-up">{err}</div>}
          <div className="sc-fade-up sc-d3"><Field label="Class ID" value={classId} onChange={e => setClassId(e.target.value)} placeholder="e.g. VIIIA"/></div>
          <div className="sc-fade-up sc-d4"><Field label="Academic Year Password" type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••••"/></div>
          <button onClick={submit} disabled={loading} className="sc-btn sc-shimmer-wrap sc-fade-up sc-d5 w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-blue-300 disabled:to-blue-300 text-white font-semibold rounded-xl shadow-md hover:shadow-lg shadow-blue-600/30">{loading ? "Logging in..." : "Login"}</button>
          <button onClick={() => go("role")} className="sc-fade-up sc-d6 text-sm text-blue-400 hover:text-blue-600 text-center transition-colors">← Back to Home</button>
        </div>
      </div>
    </main>
  );
}

function PageTeacherDashboard({ go, teacher }) {
  const label = teacher ? formatClassLabel(teacher.class, teacher.section) : "—";
  return (
    <>
      <NavBar title="Teacher Dashboard"/>
      <main className="min-h-screen bg-blue-50 flex flex-col items-center justify-center px-4 py-10 relative overflow-hidden">
        <div className="absolute top-12 left-12 w-20 h-20 bg-blue-200/50 rounded-3xl sc-float-a"/>
        <div className="absolute bottom-20 right-16 w-24 h-24 bg-blue-300/40 rounded-full sc-float-b"/>
        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-8 flex flex-col gap-6 sc-card-pop">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-blue-800 sc-fade-up sc-d1">Teacher Dashboard</h2>
            <span className="inline-block mt-2 bg-blue-100 text-blue-700 text-sm font-semibold px-4 py-1 rounded-full sc-pop sc-d2">Class: {label}</span>
          </div>
          <div className="flex flex-col gap-3">
            <button onClick={() => go("teacher-attendance")} className="sc-btn sc-shimmer-wrap sc-fade-up sc-d3 w-full py-4 text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl shadow-md hover:shadow-lg shadow-blue-600/30 focus:outline-none focus:ring-2 focus:ring-blue-400">📷 Scan QR Code</button>
            <button onClick={() => go("teacher-view")} className="sc-btn sc-shimmer-wrap sc-fade-up sc-d4 w-full py-4 text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl shadow-md hover:shadow-lg shadow-blue-600/30 focus:outline-none focus:ring-2 focus:ring-blue-400">📋 View Student Attendance</button>
            <button onClick={() => go("teacher-leave")} className="sc-btn sc-shimmer-wrap sc-fade-up sc-d5 w-full py-4 text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl shadow-md hover:shadow-lg shadow-blue-600/30 focus:outline-none focus:ring-2 focus:ring-blue-400">📝 Leave Entry</button>
            <button onClick={() => go("role")} className="sc-btn sc-fade-up sc-d6 w-full py-4 text-base font-semibold text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-xl">🚪 Logout</button>
          </div>
        </div>
      </main>
    </>
  );
}

function PageTeacherAttendance({ go, teacher }) {
  const [mode, setMode] = useState("camera");
  const [students, setStudents] = useState([]);
  const [scanned, setScanned] = useState([]);
  const [lastScanned, setLastScanned] = useState(null);
  const [scanFlash, setScanFlash] = useState(false);
  const [modal, setModal] = useState(false);
  const [toast, setToast] = useState(false);
  const [scannerActive, setScannerActive] = useState(false);
  const [error, setError] = useState("");
  const scannerRef = useRef(null);
  const lockRef = useRef(false);
  const label = teacher ? formatClassLabel(teacher.class, teacher.section) : "—";

  // Fetch students of teacher's class
  useEffect(() => {
    if (!teacher) return;
    api(`/api/students?class=${teacher.class}&section=${teacher.section}`)
      .then(r => setStudents(r.students || []))
      .catch(e => setError(e.message));
  }, [teacher]);

  const unscanned = students.filter(s => !scanned.find(x => x.id === s.id));
  const absentees = students.filter(s => !scanned.find(x => x.id === s.id));

  // Start / stop the laptop webcam scanner
  const startScanner = useCallback(async () => {
    setError("");
    try {
      if (scannerRef.current) {
        try { await scannerRef.current.stop(); } catch (_) {}
        try { await scannerRef.current.clear(); } catch (_) {}
        scannerRef.current = null;
      }
            const html5 = new Html5Qrcode("qr-reader", {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        verbose: false,
      });
      scannerRef.current = html5;
      const qrboxFn = (vw, vh) => {
        const m = Math.floor(Math.min(vw, vh) * 0.85);
        return { width: m, height: m };
      };
      await html5.start(
        { facingMode: "user" },
        {
          fps: 25,
          qrbox: qrboxFn,
          aspectRatio: 1.0,
          disableFlip: false,
          experimentalFeatures: { useBarCodeDetectorIfSupported: true },
        },
        async (decodedText) => {
          if (lockRef.current) return;
          lockRef.current = true;
          try {
            const res = await api("/api/teacher/scan", {
              method: "POST",
              body: { qr_value: decodedText, marked_by: "teacher" },
            });
            const stu = res.student;
            setScanFlash(true);
            setLastScanned({ id: stu.id, roll: String(stu.roll_no).padStart(2, "0"), name: stu.name });
            setScanned(prev => prev.find(x => x.id === stu.id)
              ? prev
              : [...prev, { id: stu.id, roll: String(stu.roll_no).padStart(2, "0"), name: stu.name }]);
            setTimeout(() => setScanFlash(false), 600);
          } catch (e) {
            setError(e.message);
          } finally {
            setTimeout(() => { lockRef.current = false; }, 1500);
          }
        },
        () => { /* per-frame failures ignored */ }
      );
      setScannerActive(true);
    } catch (e) {
      setError("Could not start camera: " + e.message);
      setScannerActive(false);
    }
  }, []);

  const stopScanner = useCallback(async () => {
    try {
      if (scannerRef.current) {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
        scannerRef.current = null;
      }
    } catch (_) {}
    setScannerActive(false);
  }, []);

  // Stop scanner when leaving camera mode or unmounting
  useEffect(() => {
    if (mode !== "camera") stopScanner();
    return () => { stopScanner(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const handleSave = () => {
    setModal(false); setToast(true);
    setTimeout(() => { setToast(false); go("teacher-dashboard"); }, 2000);
  };

  if (mode === "camera") {
    return (
      <>
        <NavBar title="QR Attendance"/>
        <main className="min-h-screen bg-blue-50 px-4 py-8">
          <div className="max-w-lg mx-auto flex flex-col gap-5">
            <div className="bg-white rounded-2xl shadow-md p-5 flex items-center justify-between sc-card-pop">
              <div className="sc-fade-up sc-d1">
                <h2 className="text-xl font-bold text-blue-800">Scan QR Code</h2>
                <p className="text-sm text-blue-500">Class: {label}</p>
              </div>
              <span className="bg-blue-100 text-blue-700 text-sm font-semibold px-3 py-1 rounded-full sc-pop sc-d2">{scanned.length}/{students.length} Scanned</span>
            </div>

            {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2 sc-fade-up">{error}</div>}

            <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center gap-4 sc-card-pop sc-d2">
              <div className={`relative w-full max-w-sm rounded-2xl overflow-hidden flex items-center justify-center transition-all duration-300 ${scanFlash ? "bg-blue-100" : "bg-gray-900"}`} style={{aspectRatio:"1"}}>
              <div id="qr-reader" className="absolute inset-0 w-full h-full [&>div]:!w-full [&>div]:!h-full [&_video]:!w-full [&_video]:!h-full [&_video]:!object-cover [&_#qr-shaded-region]:!hidden"/>
                <div className="absolute top-[7.5%] left-[7.5%] w-10 h-10 border-t-4 border-l-4 border-blue-400 rounded-tl-lg z-10 pointer-events-none sc-pulse-soft"/>
                <div className="absolute top-[7.5%] right-[7.5%] w-10 h-10 border-t-4 border-r-4 border-blue-400 rounded-tr-lg z-10 pointer-events-none sc-pulse-soft" style={{animationDelay:".2s"}}/>
                <div className="absolute bottom-[7.5%] left-[7.5%] w-10 h-10 border-b-4 border-l-4 border-blue-400 rounded-bl-lg z-10 pointer-events-none sc-pulse-soft" style={{animationDelay:".4s"}}/>
                <div className="absolute bottom-[7.5%] right-[7.5%] w-10 h-10 border-b-4 border-r-4 border-blue-400 rounded-br-lg z-10 pointer-events-none sc-pulse-soft" style={{animationDelay:".6s"}}/>

                {scanFlash && <div className="absolute inset-0 flex items-center justify-center z-20 sc-fade-in"><div className="w-full h-0.5 bg-blue-400 opacity-80"/></div>}
                {!scannerActive && (
                  <div className="flex flex-col items-center gap-3 z-10 sc-fade-in">
                    <div className="relative w-20 h-20 border-4 border-white border-opacity-30 rounded-xl flex items-center justify-center sc-pulse-soft">
                      <span className="absolute inset-0 rounded-xl border-4 border-white/40 sc-pulse-ring"/>
                      <svg className="w-10 h-10 text-white opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4h4v4H4V4zm8 0h4v4h-4V4zM4 12h4v4H4v-4zm8 4h4m-4-4h.01M20 16h.01M16 12h.01M20 12h.01"/>
                      </svg>
                    </div>
                    <p className="text-white text-opacity-70 text-sm font-medium">
                      {students.length > 0 && unscanned.length === 0 ? "All students scanned ✓" : "Tap Start Camera to scan"}
                    </p>
                  </div>
                )}
              </div>
              {lastScanned && (
                <div key={lastScanned.id || lastScanned.roll} className="w-full bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-3 sc-pop">
                  <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center justify-center">{lastScanned.roll}</div>
                  <div>
                    <p className="text-green-700 font-semibold text-sm">{lastScanned.name}</p>
                    <p className="text-green-500 text-xs">Marked Present</p>
                  </div>
                  <svg className="w-5 h-5 text-green-500 ml-auto sc-wiggle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
              )}
              {students.length === 0
                ? <p className="text-sm text-blue-500 font-medium sc-fade-in">Loading students...</p>
                : unscanned.length > 0
                  ? <p className="text-sm text-blue-500 font-medium sc-fade-in">{unscanned.length} student{unscanned.length > 1 ? "s" : ""} remaining</p>
                  : <p className="text-sm text-green-600 font-semibold sc-pop">✓ All students have been scanned</p>
              }
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={scannerActive ? stopScanner : startScanner}
                className={`sc-btn sc-shimmer-wrap sc-fade-up sc-d3 w-full py-4 text-base font-semibold rounded-xl shadow-md hover:shadow-lg ${scannerActive ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-red-500/30" : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-blue-600/30"}`}>
                {scannerActive ? "⏹ Stop Camera" : "📷 Start Camera"}
              </button>
               <button onClick={() => setMode("summary")} className="sc-btn sc-fade-up sc-d4 w-full py-4 text-base font-semibold text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-xl">
                Back → View Summary
              </button>
              <button onClick={async () => { try { if (scannerRef.current) { await scannerRef.current.stop(); await scannerRef.current.clear(); scannerRef.current = null; } } catch(_) {} go("teacher-dashboard"); }} className="sc-btn sc-fade-up sc-d5 w-full py-4 text-base font-semibold text-blue-700 bg-white border-2 border-blue-200 hover:bg-blue-50 rounded-xl">
                ← Back to Dashboard
              </button>
            </div>
              
          </div>
        </main>
      </>
    );
  }
  return (
    <>
      <NavBar title="Attendance Summary"/>
      {modal && <Modal message="Attendance will be saved?" onConfirm={handleSave} onCancel={() => setModal(false)} confirmLabel="Save"/>}
      {toast && <Toast message="Attendance saved successfully!"/>}
      <main className="min-h-screen bg-blue-50 px-4 py-8">
        <div className="max-w-lg mx-auto flex flex-col gap-5">
          <div className="bg-white rounded-2xl shadow-md p-6 sc-card-pop">
            <h2 className="text-xl font-bold text-blue-800 mb-1 sc-fade-up sc-d1">Attendance Summary</h2>
            <p className="text-sm text-blue-500 mb-4 sc-fade-up sc-d2">Class: {label}</p>
            <div className="flex gap-3">
              <div className="flex-1 bg-green-50 rounded-xl p-4 text-center sc-pop sc-d2 sc-card-hover">
                <div className="text-3xl font-bold text-green-600">{scanned.length}</div>
                <div className="text-xs text-green-600 font-semibold mt-1">Present</div>
              </div>
              <div className="flex-1 bg-red-50 rounded-xl p-4 text-center sc-pop sc-d3 sc-card-hover">
                <div className="text-3xl font-bold text-red-500">{absentees.length}</div>
                <div className="text-xs text-red-500 font-semibold mt-1">Absent</div>
              </div>
              <div className="flex-1 bg-blue-50 rounded-xl p-4 text-center sc-pop sc-d4 sc-card-hover">
                <div className="text-3xl font-bold text-blue-700">{students.length}</div>
                <div className="text-xs text-blue-600 font-semibold mt-1">Total</div>
              </div>
            </div>
          </div>
          {scanned.length > 0 && (
            <div className="bg-white rounded-2xl shadow-md p-6 sc-card-pop sc-d2">
              <h3 className="font-bold text-blue-800 mb-3">✅ Present ({scanned.length})</h3>
              <div className="flex flex-col gap-2">
                {scanned.map(s => (
                  <div key={s.id} className="sc-row flex items-center gap-3 bg-green-50 rounded-xl px-4 py-2.5 hover:bg-green-100 transition-colors">
                    <span className="w-8 h-8 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center justify-center">{s.roll}</span>
                    <span className="text-blue-900 font-medium text-sm">{s.name}</span>
                    <span className="ml-auto text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">Present</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {absentees.length > 0 && (
            <div className="bg-white rounded-2xl shadow-md p-6 sc-card-pop sc-d3">
              <h3 className="font-bold text-blue-800 mb-3">❌ Absent ({absentees.length})</h3>
              <div className="flex flex-col gap-2">
                {absentees.map(s => (
                  <div key={s.id} className="sc-row flex items-center gap-3 bg-red-50 rounded-xl px-4 py-2.5 hover:bg-red-100 transition-colors">
                    <span className="w-8 h-8 rounded-full bg-red-100 text-red-700 text-xs font-bold flex items-center justify-center">{String(s.roll_no).padStart(2, "0")}</span>
                    <span className="text-blue-900 font-medium text-sm">{s.name}</span>
                    <span className="ml-auto text-xs bg-red-100 text-red-500 font-semibold px-2 py-0.5 rounded-full">Absent</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-3 sc-fade-up sc-d4">
            <button onClick={() => setMode("camera")} className="sc-btn flex-1 py-3 bg-blue-100 hover:bg-blue-200 text-blue-800 font-semibold rounded-xl">← Back to Scanner</button>
            <button onClick={() => setModal(true)} className="sc-btn sc-shimmer-wrap flex-1 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-md hover:shadow-lg shadow-blue-600/30">Confirm & Save</button>
          </div>
        </div>
      </main>
    </>
  );
}

function PageTeacherLeave({ go, teacher }) {
  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState("");
  const [reason, setReason] = useState("Medical");
  const [halfDay, setHalfDay] = useState(false);
  const [toast, setToast] = useState(false);
  const [err, setErr] = useState("");
  const label = teacher ? formatClassLabel(teacher.class, teacher.section) : "—";

  useEffect(() => {
    if (!teacher) return;
    api(`/api/students?class=${teacher.class}&section=${teacher.section}`)
      .then(r => setStudents(r.students || []))
      .catch(e => setErr(e.message));
  }, [teacher]);

  const apply = async () => {
    if (!selected) { setErr("Please select a student."); return; }
    setErr("");
    try {
      const date = new Date().toISOString().slice(0, 10);
      await api("/api/attendance/update", {
        method: "PUT",
        body: {
          updates: [{
            student_id: parseInt(selected, 10),
            date,
            status: halfDay ? "HALF_DAY" : "ABSENT",
            reason,
            marked_by: "teacher",
          }],
        },
      });
      setToast(true);
      setTimeout(() => setToast(false), 2500);
    } catch (e) {
      setErr(e.message);
    }
  };
  const student = students.find(s => s.id === parseInt(selected, 10));
  return (
    <>
      <NavBar title="Leave Entry"/>
      {toast && <Toast message="Leave applied successfully!"/>}
      <main className="min-h-screen bg-blue-50 px-4 py-8 relative overflow-hidden">
        <div className="absolute top-10 right-10 w-20 h-20 bg-blue-200/50 rounded-3xl sc-float-a pointer-events-none"/>
        <div className="absolute bottom-16 left-12 w-24 h-24 bg-blue-300/40 rounded-full sc-float-b pointer-events-none"/>
        <div className="relative max-w-lg mx-auto bg-white rounded-2xl shadow-xl p-8 flex flex-col gap-5 sc-card-pop">
          <div className="sc-fade-up sc-d1">
            <h2 className="text-xl font-bold text-blue-800">Leave Entry</h2>
            <p className="text-sm text-blue-500">Class: {label}</p>
          </div>
          {err && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2 sc-fade-up">{err}</div>}
          <div className="sc-fade-up sc-d2">
            <label className="block text-sm font-medium text-blue-700 mb-2">Select Student</label>
            <select value={selected} onChange={e => setSelected(e.target.value)} className="w-full border border-blue-200 rounded-xl px-4 py-3 text-blue-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition-shadow hover:shadow-md">
              <option value="">-- Select Student --</option>
              {students.map(s => <option key={s.id} value={s.id}>{String(s.roll_no).padStart(2, "0")} - {s.name}</option>)}
            </select>
          </div>
          <div className="sc-fade-up sc-d3">
            <label className="block text-sm font-medium text-blue-700 mb-2">Leave Reason</label>
            <select value={reason} onChange={e => setReason(e.target.value)} className="w-full border border-blue-200 rounded-xl px-4 py-3 text-blue-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition-shadow hover:shadow-md">
              <option>Medical</option>
              <option>Emergency</option>
            </select>
          </div>
          <label className="sc-fade-up sc-d4 flex items-center gap-3 bg-blue-50 rounded-xl px-4 py-3 cursor-pointer select-none hover:bg-blue-100 transition-colors">
            <input type="checkbox" checked={halfDay} onChange={e => setHalfDay(e.target.checked)} className="w-5 h-5 accent-blue-600"/>
            <span className="text-blue-800 font-medium">Mark as Half Day</span>
          </label>
          {student && (
            <div className="bg-blue-50 rounded-xl px-4 py-3 text-sm text-blue-700 sc-pop">
              <span className="font-semibold">{student.name}</span> · {reason} · {halfDay ? "Half Day" : "Full Day"}
            </div>
          )}
          <div className="flex gap-3 sc-fade-up sc-d5">
            <button onClick={() => go("teacher-dashboard")} className="sc-btn flex-1 py-3 bg-blue-100 hover:bg-blue-200 text-blue-800 font-semibold rounded-xl">← Back</button>
            <button onClick={apply} className="sc-btn sc-shimmer-wrap flex-1 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-md hover:shadow-lg shadow-blue-600/30">Apply Leave</button>
          </div>
        </div>
      </main>
    </>
  );
}

function PageAdminLogin({ go, setAdmin }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async () => {
    if (!user.trim() || !pass.trim()) { setErr("Please fill in all fields."); return; }
    setErr(""); setLoading(true);
    try {
      const res = await api("/api/auth/admin-login", {
        method: "POST",
        body: { username: user.trim(), password: pass },
      });
      setAdmin(res.admin);
      go("admin-dashboard");
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <main className="min-h-screen bg-blue-50 flex items-center justify-center px-4 py-8 relative overflow-hidden">
      <div className="absolute top-12 left-10 w-20 h-20 bg-blue-200/50 rounded-3xl sc-float-a"/>
      <div className="absolute bottom-16 right-16 w-24 h-24 bg-blue-300/40 rounded-full sc-float-b"/>
      <div className="absolute top-1/2 left-12 w-12 h-12 bg-blue-400/30 rounded-2xl sc-float-c"/>
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-3xl flex flex-col md:flex-row overflow-hidden sc-card-pop">
        <div className="md:w-1/2 sc-fade-left sc-d2"><AnimatedLoginHero title="Admin Console" subtitle="Manage students, attendance & reports" icon="🛡️"/></div>
        <div className="flex flex-col justify-center p-8 md:w-1/2 gap-5">
          <div className="sc-fade-up sc-d2">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">Admin Login</h2>
            <p className="text-sm text-blue-400 mt-1">Shiksha Connect</p>
          </div>
          {err && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2 sc-fade-up">{err}</div>}
          <div className="sc-fade-up sc-d3"><Field label="Username" value={user} onChange={e => setUser(e.target.value)} placeholder="admin"/></div>
          <div className="sc-fade-up sc-d4"><Field label="Password" type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••••"/></div>
          <button onClick={submit} disabled={loading} className="sc-btn sc-shimmer-wrap sc-fade-up sc-d5 w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-blue-300 disabled:to-blue-300 text-white font-semibold rounded-xl shadow-md hover:shadow-lg shadow-blue-600/30">{loading ? "Logging in..." : "Login"}</button>
          <button onClick={() => go("role")} className="sc-fade-up sc-d6 text-sm text-blue-400 hover:text-blue-600 text-center transition-colors">← Back to Home</button>
        </div>
      </div>
    </main>
  );
}

function PageAdminDashboard({ go }) {
  return (
    <>
      <NavBar title="Admin Dashboard"/>
      <main className="min-h-screen bg-blue-50 flex flex-col items-center justify-center px-4 py-10 relative overflow-hidden">
        <div className="absolute top-12 left-12 w-20 h-20 bg-blue-200/50 rounded-3xl sc-float-a"/>
        <div className="absolute bottom-20 right-16 w-24 h-24 bg-blue-300/40 rounded-full sc-float-b"/>
        <div className="absolute top-1/3 right-10 w-12 h-12 bg-blue-400/30 rounded-2xl sc-float-c"/>
        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-8 flex flex-col gap-6 sc-card-pop">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-blue-800 sc-fade-up sc-d1">Admin Dashboard</h2>
            <p className="text-sm text-blue-400 mt-1 sc-fade-up sc-d2">Shiksha Connect</p>
          </div>
          <div className="flex flex-col gap-3">
            <button onClick={() => go("admin-add")} className="sc-btn sc-shimmer-wrap sc-fade-up sc-d3 w-full py-4 text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl shadow-md hover:shadow-lg shadow-blue-600/30 focus:outline-none focus:ring-2 focus:ring-blue-400">➕ Add New Student</button>
            <button onClick={() => go("admin-remove")} className="sc-btn sc-shimmer-wrap sc-fade-up sc-d4 w-full py-4 text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl shadow-md hover:shadow-lg shadow-blue-600/30 focus:outline-none focus:ring-2 focus:ring-blue-400">🗑️ Remove Student</button>
            <button onClick={() => go("admin-modify")} className="sc-btn sc-shimmer-wrap sc-fade-up sc-d5 w-full py-4 text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl shadow-md hover:shadow-lg shadow-blue-600/30 focus:outline-none focus:ring-2 focus:ring-blue-400">✏️ Modify Attendance</button>
            <button onClick={() => go("admin-reports")} className="sc-btn sc-shimmer-wrap sc-fade-up sc-d6 w-full py-4 text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl shadow-md hover:shadow-lg shadow-blue-600/30 focus:outline-none focus:ring-2 focus:ring-blue-400">📊 Generate Reports</button>
            <button onClick={() => go("role")} className="sc-btn sc-fade-up sc-d7 w-full py-4 text-base font-semibold text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-xl">🚪 Logout</button>
          </div>
        </div>
      </main>
    </>
  );
}
function PageAdminAdd({ go }) {
  const [form, setForm] = useState({ name: "", roll: "", cls: "", section: "" });
  const [toast, setToast] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [minRoll, setMinRoll] = useState(1);
  const set = (k, v) => setForm(f => ({...f, [k]: v}));

  useEffect(() => {
    const cls = form.cls.trim();
    const section = form.section.trim().toUpperCase();
    if (!cls || !section) return;
    const classNum = isNaN(parseInt(cls, 10)) ? intFromRoman(cls) : parseInt(cls, 10);
    if (!classNum || !["A", "B"].includes(section)) return;
    let cancelled = false;
    api(`/api/students/next-roll?class=${classNum}&section=${section}`)
      .then(r => {
        if (cancelled) return;
        setMinRoll(r.next_roll);
        setForm(f => ({ ...f, roll: String(r.next_roll) }));
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [form.cls, form.section]);

  const generate = async () => {
    setErr(""); setQrDataUrl("");
    if (!form.name.trim() || !form.roll.trim() || !form.cls.trim() || !form.section.trim()) {
      setErr("Please fill in all fields."); return;
    }
    const rollNum = parseInt(form.roll, 10);
    if (rollNum < minRoll) {
      setErr(`Roll No must be ${minRoll} or higher (next available roll for this class).`);
      return;
    }
    setLoading(true);
    try {
      const res = await api("/api/admin/students/add", {
        method: "POST",
        body: {
          name: form.name.trim(),
          roll_no: rollNum,
          class: form.cls.trim(),
          section: form.section.trim().toUpperCase(),
        },
      });
      const dataUrl = await QRCode.toDataURL(res.student.qr_value, { width: 240, margin: 1 });
      setQrDataUrl(dataUrl);
      setToast("QR Code generated successfully!");
      setTimeout(() => setToast(""), 2500);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <NavBar title="Add New Student"/>
      {toast && <Toast message={toast}/>}
      <main className="min-h-screen bg-blue-50 px-4 py-8 relative overflow-hidden">
        <div className="absolute top-10 right-10 w-20 h-20 bg-blue-200/50 rounded-3xl sc-float-a pointer-events-none"/>
        <div className="absolute bottom-16 left-12 w-24 h-24 bg-blue-300/40 rounded-full sc-float-b pointer-events-none"/>
        <div className="relative max-w-lg mx-auto bg-white rounded-2xl shadow-xl p-8 flex flex-col gap-5 sc-card-pop">
          <h2 className="text-xl font-bold text-blue-800 sc-fade-up sc-d1">Add New Student</h2>
          {err && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2 sc-fade-up">{err}</div>}
          <div className="sc-fade-up sc-d2">
            <label className="block text-sm font-medium text-blue-700 mb-1">Name</label>
            <input value={form.name} onChange={e => set("name", e.target.value)} placeholder="Full Name" className="w-full border border-blue-200 rounded-xl px-4 py-3 text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-shadow hover:shadow-md"/>
          </div>
          <div className="sc-fade-up sc-d3">
            <label className="block text-sm font-medium text-blue-700 mb-1">Class</label>
            <input value={form.cls} onChange={e => set("cls", e.target.value)} placeholder="e.g. 8 or VIII" className="w-full border border-blue-200 rounded-xl px-4 py-3 text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-shadow hover:shadow-md"/>
          </div>
          <div className="sc-fade-up sc-d4">
            <label className="block text-sm font-medium text-blue-700 mb-1">Section</label>
            <input value={form.section} onChange={e => set("section", e.target.value)} placeholder="e.g. A" className="w-full border border-blue-200 rounded-xl px-4 py-3 text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-shadow hover:shadow-md"/>
          </div>
          <div className="sc-fade-up sc-d5">
            <label className="block text-sm font-medium text-blue-700 mb-1">Roll No</label>
            <input
              type="number"
              min={minRoll}
              value={form.roll}
              onChange={e => set("roll", e.target.value)}
              placeholder={`Next available: ${minRoll}`}
              className="w-full border border-blue-200 rounded-xl px-4 py-3 text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-shadow hover:shadow-md"
            />
            <p className="text-xs text-blue-500 mt-1">
              {form.cls && form.section
                ? `Auto-suggested: ${minRoll} (cannot be lower; reused rolls are not allowed)`
                : "Fill Class and Section first to auto-suggest a roll number."}
            </p>
          </div>
          <div className="sc-fade-up sc-d6 bg-blue-50 border-2 border-dashed border-blue-200 rounded-xl min-h-28 p-3 flex flex-col items-center justify-center transition-all hover:border-blue-400 hover:bg-blue-100/50">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="Student QR" className="w-40 h-40 sc-pop"/>
            ) : (
              <>
                <svg className="w-10 h-10 text-blue-300 mb-1 sc-pulse-soft" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4h4v4H4V4zm8 0h4v4h-4V4zM4 12h4v4H4v-4zm8 4h4m-4-4h.01M20 16h.01"/>
                </svg>
                <p className="text-blue-300 text-xs">QR Code will appear here</p>
              </>
            )}
          </div>
           <div className="flex gap-3 sc-fade-up sc-d7">
            <button onClick={() => go("admin-dashboard")} className="sc-btn flex-1 py-3 bg-blue-100 hover:bg-blue-200 text-blue-800 font-semibold rounded-xl">← Back</button>
            <button onClick={generate} disabled={loading} className="sc-btn sc-shimmer-wrap flex-1 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-blue-300 disabled:to-blue-300 text-white font-semibold rounded-xl shadow-md hover:shadow-lg shadow-blue-600/30">{loading ? "Saving..." : "Generate QR"}</button>
          </div>
          {qrDataUrl && (
            <button
              onClick={() => {
                setForm({ name: "", roll: "", cls: form.cls, section: form.section });
                setQrDataUrl("");
                setErr("");
              }}
              className="sc-btn sc-shimmer-wrap sc-pop w-full py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-xl shadow-md hover:shadow-lg shadow-green-600/30 flex items-center justify-center gap-2"
            >
              <span>➕</span><span>Add Another Student</span>
            </button>
          )}
        </div>
      </main>
    </>
  );
}

function PageAdminRemove({ go }) {
  const [form, setForm] = useState({ name: "", roll: "", cls: "", section: "" });
  const [toast, setToast] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({...f, [k]: v}));

  const remove = async () => {
    setErr("");
    if (!form.roll.trim() || !form.cls.trim() || !form.section.trim()) {
      setErr("Class, Section and Roll No are required."); return;
    }
    setLoading(true);
    try {
      const cls = isNaN(parseInt(form.cls, 10)) ? intFromRoman(form.cls.trim()) : parseInt(form.cls, 10);
      await api("/api/admin/students/remove", {
        method: "PUT",
        body: {
          name: form.name.trim() || undefined,
          roll_no: parseInt(form.roll, 10),
          class: cls,
          section: form.section.trim().toUpperCase(),
        },
      });
      setToast("Student removed successfully!");
      setTimeout(() => setToast(""), 2500);
      setForm({ name: "", roll: "", cls: "", section: "" });
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <NavBar title="Remove Student"/>
      {toast && <Toast message={toast}/>}
      <main className="min-h-screen bg-blue-50 px-4 py-8 relative overflow-hidden">
        <div className="absolute top-10 right-10 w-20 h-20 bg-red-200/50 rounded-3xl sc-float-a pointer-events-none"/>
        <div className="absolute bottom-16 left-12 w-24 h-24 bg-blue-300/40 rounded-full sc-float-b pointer-events-none"/>
        <div className="relative max-w-lg mx-auto bg-white rounded-2xl shadow-xl p-8 flex flex-col gap-5 sc-card-pop">
          <h2 className="text-xl font-bold text-blue-800 sc-fade-up sc-d1">Remove Student</h2>
          {err && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2 sc-fade-up">{err}</div>}
          {[["Name","name","Full Name"],["Roll No","roll","e.g. 7"],["Class","cls","e.g. 8 or VIII"],["Section","section","e.g. A"]].map(([l,k,p], i) => (
            <div key={k} className={`sc-fade-up sc-d${i+2}`}>
              <label className="block text-sm font-medium text-blue-700 mb-1">{l}</label>
              <input value={form[k]} onChange={e => set(k, e.target.value)} placeholder={p} className="w-full border border-blue-200 rounded-xl px-4 py-3 text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-shadow hover:shadow-md"/>
            </div>
          ))}
          <div className="flex gap-3 sc-fade-up sc-d6">
            <button onClick={() => go("admin-dashboard")} className="sc-btn flex-1 py-3 bg-blue-100 hover:bg-blue-200 text-blue-800 font-semibold rounded-xl">← Back</button>
            <button onClick={remove} disabled={loading} className="sc-btn sc-shimmer-wrap flex-1 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-red-300 disabled:to-red-300 text-white font-semibold rounded-xl shadow-md hover:shadow-lg shadow-red-500/30">{loading ? "Removing..." : "Remove QR"}</button>
          </div>
        </div>
      </main>
    </>
  );
}

function PageAdminReports({ go, setReport }) {
  const [cls, setCls] = useState("VIII-A");
  const [type, setType] = useState("Weekly");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const generate = async () => {
    setErr(""); setLoading(true);
    try {
      const { class: c, section } = parseClassLabel(cls);
      const res = await api(`/api/reports/generate?class=${c}&section=${section}&type=${type}`);
      setReport({ ...res, class_label: cls });
      go("admin-report-preview");
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <NavBar title="Generate Reports"/>
      <main className="min-h-screen bg-blue-50 px-4 py-8 relative overflow-hidden">
        <div className="absolute top-10 right-10 w-20 h-20 bg-blue-200/50 rounded-3xl sc-float-a pointer-events-none"/>
        <div className="absolute bottom-16 left-12 w-24 h-24 bg-blue-300/40 rounded-full sc-float-b pointer-events-none"/>
        <div className="relative max-w-lg mx-auto bg-white rounded-2xl shadow-xl p-8 flex flex-col gap-5 sc-card-pop">
          <h2 className="text-xl font-bold text-blue-800 sc-fade-up sc-d1">Generate Reports</h2>
          {err && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2 sc-fade-up">{err}</div>}
          <div className="sc-fade-up sc-d2">
            <label className="block text-sm font-medium text-blue-700 mb-1">Select Class</label>
            <select value={cls} onChange={e => setCls(e.target.value)} className="w-full border border-blue-200 rounded-xl px-4 py-3 text-blue-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition-shadow hover:shadow-md">
              {CLASSES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="sc-fade-up sc-d3">
            <label className="block text-sm font-medium text-blue-700 mb-2">Report Type</label>
            <div className="flex gap-3">
              {["Weekly","Monthly"].map(t => (
                <button key={t} onClick={() => setType(t)}
                  className={`sc-btn flex-1 py-3 rounded-xl font-semibold text-sm border-2 ${type===t ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/30" : "bg-white text-blue-600 border-blue-200 hover:border-blue-400 hover:bg-blue-50"}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="bg-blue-50 rounded-xl px-4 py-3 text-sm text-blue-700 sc-fade-up sc-d4">
            <span className="font-semibold">Selected:</span> {cls} · {type} Report
          </div>
          <div className="flex gap-3 sc-fade-up sc-d5">
            <button onClick={() => go("admin-dashboard")} className="sc-btn flex-1 py-3 bg-blue-100 hover:bg-blue-200 text-blue-800 font-semibold rounded-xl">← Back</button>
            <button onClick={generate} disabled={loading} className="sc-btn sc-shimmer-wrap flex-1 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-blue-300 disabled:to-blue-300 text-white font-semibold rounded-xl shadow-md hover:shadow-lg shadow-blue-600/30">{loading ? "Generating..." : "Generate & Preview"}</button>
          </div>
        </div>
      </main>
    </>
  );
}

function PageAdminReportPreview({ go, report }) {
  const [modal, setModal] = useState(false);
  const [toast, setToast] = useState(false);
  const [err, setErr] = useState("");
  const submit = async () => {
    if (!report) return;
    try {
      await api("/api/reports/submit", {
        method: "POST",
        body: {
          class: report.class,
          section: report.section,
          from_date: report.from_date,
          to_date: report.to_date,
          report_type: report.type,
          report_json: { dates: report.dates, data: report.data, avg_pct: report.avg_pct },
        },
      });
      setModal(false); setToast(true);
      setTimeout(() => { setToast(false); go("admin-dashboard"); }, 2000);
    } catch (e) {
      setErr(e.message);
      setModal(false);
    }
  };

  if (!report) {
    return (
      <>
        <NavBar title="Report Preview"/>
        <main className="min-h-screen bg-blue-50 px-4 py-8">
          <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-md p-8 text-center text-blue-600">
            No report data. Please generate a report first.
            <div className="mt-4">
              <button onClick={() => go("admin-reports")} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl">← Back to Reports</button>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <NavBar title="Report Preview"/>
      {modal && <Modal message="Final Submit?" onConfirm={submit} onCancel={() => setModal(false)} confirmLabel="Submit" cancelLabel="Cancel"/>}
      {toast && <Toast message="Report submitted successfully!"/>}
      <main className="min-h-screen bg-blue-50 px-4 py-8 relative overflow-hidden">
        <div className="absolute top-10 right-10 w-20 h-20 bg-blue-200/50 rounded-3xl sc-float-a pointer-events-none"/>
        <div className="absolute bottom-16 left-12 w-24 h-24 bg-blue-300/40 rounded-full sc-float-b pointer-events-none"/>
        <div className="relative max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8 flex flex-col gap-5 sc-card-pop">
          <div className="flex items-center justify-between">
            <div className="sc-fade-up sc-d1">
              <h2 className="text-xl font-bold text-blue-800">Report Preview</h2>
              <p className="text-sm text-blue-500">Class {report.class_label} · {report.type}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white text-center rounded-xl px-4 py-2 shadow-lg shadow-blue-600/30 sc-pop sc-d2">
              <div className="text-2xl font-bold">{report.avg_pct}%</div>
              <div className="text-xs">Avg Attendance</div>
            </div>
          </div>
          {err && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2 sc-fade-up">{err}</div>}
          <div className="overflow-x-auto rounded-xl border border-blue-100 shadow-sm sc-fade-up sc-d3">
            <table className="w-full text-xs md:text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                  <th className="px-3 py-3 text-left font-semibold">Roll</th>
                  <th className="px-3 py-3 text-left font-semibold">Name</th>
                  {report.dates.map(d => <th key={d} className="px-3 py-3 font-semibold">{d}</th>)}
                  <th className="px-3 py-3 font-semibold">%</th>
                </tr>
              </thead>
              <tbody>
                {report.data.map((s, i) => (
                  <tr key={s.id} className={`sc-row transition-colors ${i % 2 === 0 ? "bg-white hover:bg-blue-50/70" : "bg-blue-50 hover:bg-blue-100/60"}`}>
                    <td className="px-3 py-2.5 font-medium text-blue-800">{s.roll}</td>
                    <td className="px-3 py-2.5 text-blue-900 whitespace-nowrap">{s.name}</td>
                    {s.attendance.map((a, j) => (
                      <td key={j} className="px-3 py-2.5 text-center">
                        <span className={`inline-flex w-6 h-6 rounded-full text-xs font-bold items-center justify-center transition-transform hover:scale-125 ${a==="P" ? "bg-green-100 text-green-700" : a==="H" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-500"}`}>{a}</span>
                      </td>
                    ))}
                    <td className={`px-3 py-2.5 text-center font-bold ${s.pct >= 75 ? "text-green-600" : "text-red-500"}`}>{s.pct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-blue-50 rounded-xl px-4 py-3 text-sm text-blue-700 font-medium text-center sc-fade-up sc-d4">
            Average Overall Attendance: <span className="font-bold text-blue-800">{report.avg_pct}%</span>
          </div>
          <div className="flex gap-3 sc-fade-up sc-d5">
            <button onClick={() => go("admin-reports")} className="sc-btn flex-1 py-3 bg-blue-100 hover:bg-blue-200 text-blue-800 font-semibold rounded-xl">← Back</button>
            <button onClick={() => setModal(true)} className="sc-btn sc-shimmer-wrap flex-1 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-md hover:shadow-lg shadow-blue-600/30">Submit Report</button>
          </div>
        </div>
      </main>
    </>
  );
}

function AttendanceTable({ go, title, navTitle, backPage, allowedClasses, allowHalfDay = true }) {
  const [cls, setCls] = useState(allowedClasses[0]);
  const [students, setStudents] = useState([]);
  const [statuses, setStatuses] = useState({});
  const [studentIdToRoll, setStudentIdToRoll] = useState({});
  const [modal, setModal] = useState(false);
  const [toast, setToast] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const { class: c, section } = parseClassLabel(cls);
    setLoading(true);
    api(`/api/attendance?class=${c}&section=${section}`)
      .then(r => {
        const list = r.attendance || [];
        setStudents(list);
        const map = {};
        const rollMap = {};
        for (const s of list) {
          map[s.student_id] = s.status === "PRESENT" ? "Present" : s.status === "HALF_DAY" ? "Half Day" : "Absent";
          rollMap[s.student_id] = s.roll_no;
        }
        setStatuses(map);
        setStudentIdToRoll(rollMap);
      })
      .catch(e => setErr(e.message))
      .finally(() => setLoading(false));
  }, [cls]);

  const save = async () => {
    setModal(false);
    try {
      const date = new Date().toISOString().slice(0, 10);
      const updates = Object.entries(statuses).map(([sid, st]) => ({
        student_id: parseInt(sid, 10),
        date,
        status: st === "Present" ? "PRESENT" : st === "Half Day" ? "HALF_DAY" : "ABSENT",
        marked_by: title.includes("Modify") ? "admin" : "teacher",
      }));
      await api("/api/attendance/update", { method: "PUT", body: { updates } });
      setToast(title.includes("Modify") ? "Attendance modified successfully!" : "Attendance updated successfully!");
      setTimeout(() => setToast(""), 2500);
    } catch (e) {
      setErr(e.message);
    }
  };

  const color = v => v === "Present" ? "bg-green-100 text-green-700" : v === "Absent" ? "bg-red-100 text-red-600" : "bg-yellow-100 text-yellow-700";
  return (
    <>
      <NavBar title={navTitle}/>
      {modal && <Modal message="Changes will be saved?" onConfirm={save} onCancel={() => setModal(false)} confirmLabel="Yes" cancelLabel="No"/>}
      {toast && <Toast message={toast}/>}
      <main className="min-h-screen bg-blue-50 px-4 py-8 relative overflow-hidden">
        <div className="absolute top-10 right-10 w-20 h-20 bg-blue-200/50 rounded-3xl sc-float-a pointer-events-none"/>
        <div className="absolute bottom-16 left-12 w-24 h-24 bg-blue-300/40 rounded-full sc-float-b pointer-events-none"/>
        <div className="relative max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8 flex flex-col gap-5 sc-card-pop">
          <h2 className="text-xl font-bold text-blue-800 sc-fade-up sc-d1">{title}</h2>
          {err && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2 sc-fade-up">{err}</div>}
          <div className="sc-fade-up sc-d2">
            <label className="block text-sm font-medium text-blue-700 mb-1">Select Class</label>
            <select value={cls} onChange={e => setCls(e.target.value)} className="w-full border border-blue-200 rounded-xl px-4 py-3 text-blue-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition-shadow hover:shadow-md">
              {allowedClasses.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div key={cls} className="overflow-x-auto rounded-xl border border-blue-100 shadow-sm sc-fade-up sc-d3">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                  <th className="px-4 py-3 text-left font-semibold">Roll No</th>
                  <th className="px-4 py-3 text-left font-semibold">Name</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={3} className="px-4 py-6 text-center text-blue-500">
                    <span className="inline-flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-400 sc-pulse-soft"/>
                      <span className="w-2 h-2 rounded-full bg-blue-400 sc-pulse-soft" style={{animationDelay:".15s"}}/>
                      <span className="w-2 h-2 rounded-full bg-blue-400 sc-pulse-soft" style={{animationDelay:".3s"}}/>
                      <span className="ml-2">Loading...</span>
                    </span>
                  </td></tr>
                )}
                {!loading && students.length === 0 && (
                  <tr><td colSpan={3} className="px-4 py-6 text-center text-blue-400 sc-fade-in">No students found</td></tr>
                )}
                {students.map((s, i) => (
                  <tr key={s.student_id} className={`sc-row transition-colors ${i % 2 === 0 ? "bg-white hover:bg-blue-50/70" : "bg-blue-50 hover:bg-blue-100/60"}`}>
                    <td className="px-4 py-3 font-medium text-blue-800">{String(studentIdToRoll[s.student_id] || s.roll_no).padStart(2, "0")}</td>
                    <td className="px-4 py-3 text-blue-900">{s.name}</td>
                    <td className="px-4 py-3">
                      <select value={statuses[s.student_id] || "Absent"} onChange={e => setStatuses(p => ({...p, [s.student_id]: e.target.value}))}
                        className={`text-xs font-semibold px-2 py-1.5 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-transform hover:scale-105 ${color(statuses[s.student_id])}`}>
                         <option>Present</option><option>Absent</option>{allowHalfDay && <option>Half Day</option>}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex gap-3 sc-fade-up sc-d4">
            <button onClick={() => go(backPage)} className="sc-btn flex-1 py-3 bg-blue-100 hover:bg-blue-200 text-blue-800 font-semibold rounded-xl">← Back</button>
            <button onClick={() => setModal(true)} className="sc-btn sc-shimmer-wrap flex-1 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-md hover:shadow-lg shadow-blue-600/30">Save Changes</button>
          </div>
        </div>
      </main>
    </>
  );
}

function PageAdminModifyAttendance({ go }) {
  return <AttendanceTable go={go} title="Modify Attendance" navTitle="Modify Attendance" backPage="admin-dashboard" allowedClasses={CLASSES}/>;
}

function PageTeacherViewAttendance({ go, teacher }) {
  const teacherClass = teacher ? formatClassLabel(teacher.class, teacher.section) : CLASSES[0];
  return <AttendanceTable go={go} title="View Student Attendance" navTitle="View Student Attendance" backPage="teacher-dashboard" allowedClasses={[teacherClass]} allowHalfDay={false}/>;
}

// ---------- Animated login hero (replaces the school illustration) ----------
function AnimatedLoginHero({ title = "Shiksha Connect", subtitle = "Smart Attendance", icon = "🎓" }) {
  return (
    <div className="relative w-full h-full min-h-[320px] flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-500 via-indigo-500 to-blue-700 p-6">
      {/* gradient mesh blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-16 -left-16 w-72 h-72 bg-cyan-300/40 rounded-full mix-blend-overlay sc-blob-a"/>
        <div className="absolute -bottom-20 -right-16 w-72 h-72 bg-fuchsia-300/35 rounded-full mix-blend-overlay sc-blob-b"/>
        <div className="absolute top-1/3 left-1/2 w-56 h-56 bg-yellow-200/30 rounded-full mix-blend-overlay sc-blob-c"/>
      </div>

      {/* sparkles / particles */}
      <span className="sc-sparkle absolute top-[14%] left-[22%] w-1.5 h-1.5 bg-white rounded-full"/>
      <span className="sc-sparkle absolute top-[28%] right-[18%] w-1 h-1 bg-white rounded-full" style={{animationDelay:".6s"}}/>
      <span className="sc-sparkle absolute bottom-[24%] left-[16%] w-2 h-2 bg-white rounded-full" style={{animationDelay:"1.1s"}}/>
      <span className="sc-sparkle absolute bottom-[32%] right-[28%] w-1.5 h-1.5 bg-white rounded-full" style={{animationDelay:"1.7s"}}/>
      <span className="sc-sparkle absolute top-[58%] left-[8%] w-1 h-1 bg-white rounded-full" style={{animationDelay:"2.2s"}}/>

      {/* concentric pulsing rings */}
      <div className="absolute w-72 h-72 rounded-full border-2 border-white/15 sc-ring-pulse"/>
      <div className="absolute w-56 h-56 rounded-full border-2 border-white/20 sc-ring-pulse" style={{animationDelay:".7s"}}/>
      <div className="absolute w-40 h-40 rounded-full border-2 border-white/30 sc-ring-pulse" style={{animationDelay:"1.4s"}}/>

      {/* orbiting glass tiles */}
      <div className="absolute top-6 left-6 w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-xl shadow-xl sc-float-a sc-tilt">📚</div>
      <div className="absolute top-8 right-8 w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-xl shadow-xl sc-float-b sc-tilt">📋</div>
      <div className="absolute bottom-8 left-8 w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-xl shadow-xl sc-float-c sc-tilt">✓</div>
      <div className="absolute bottom-6 right-6 w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-xl shadow-xl sc-float-a sc-tilt" style={{animationDelay:"2s"}}>📷</div>

      {/* center hero badge */}
      <div className="relative z-10 text-center text-white px-4">
        <div className="relative inline-flex items-center justify-center mb-4">
          <span className="absolute inset-0 -m-3 rounded-3xl bg-white/15 blur-xl sc-pulse-soft"/>
          <div className="relative w-24 h-24 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center shadow-2xl sc-pop sc-d2 sc-tilt">
            <span className="text-5xl sc-pulse-soft" style={{display:"inline-block"}}>{icon}</span>
          </div>
        </div>
        <h3 className="text-2xl font-bold tracking-wide sc-fade-up sc-d3 drop-shadow-md">{title}</h3>
        <p className="text-sm text-white/85 mt-1 sc-fade-up sc-d4">{subtitle}</p>
        <div className="mt-4 flex items-center justify-center gap-1.5 sc-fade-up sc-d5">
          <span className="w-1.5 h-1.5 rounded-full bg-white/80 sc-pulse-soft"/>
          <span className="w-1.5 h-1.5 rounded-full bg-white/80 sc-pulse-soft" style={{animationDelay:".25s"}}/>
          <span className="w-1.5 h-1.5 rounded-full bg-white/80 sc-pulse-soft" style={{animationDelay:".5s"}}/>
        </div>
      </div>
    </div>
  );
}

// ---------- Global animation styles (used across every page) ----------
function ScAnimations() {
  return (
    <style>{`
      @keyframes scFadeIn { from{opacity:0} to{opacity:1} }
      @keyframes scFadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
      @keyframes scFadeDown { from{opacity:0;transform:translateY(-14px)} to{opacity:1;transform:translateY(0)} }
      @keyframes scFadeLeft { from{opacity:0;transform:translateX(-22px)} to{opacity:1;transform:translateX(0)} }
      @keyframes scFadeRight { from{opacity:0;transform:translateX(22px)} to{opacity:1;transform:translateX(0)} }
      @keyframes scCardPop { from{opacity:0;transform:translateY(24px) scale(.96)} to{opacity:1;transform:translateY(0) scale(1)} }
      @keyframes scPop { from{opacity:0;transform:scale(.7)} to{opacity:1;transform:scale(1)} }
      @keyframes scPulseSoft { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }
      @keyframes scPulseRing { 0%{transform:scale(1);opacity:.45} 70%{transform:scale(1.55);opacity:0} 100%{opacity:0} }
      @keyframes scFloatA { 0%,100%{transform:translate(0,0) rotate(0)} 50%{transform:translate(15px,-18px) rotate(7deg)} }
      @keyframes scFloatB { 0%,100%{transform:translate(0,0) rotate(0)} 50%{transform:translate(-18px,16px) rotate(-8deg)} }
      @keyframes scFloatC { 0%,100%{transform:translate(0,0) rotate(0)} 50%{transform:translate(12px,18px) rotate(5deg)} }
      @keyframes scShimmer { 0%{transform:translateX(-120%) skewX(-20deg)} 100%{transform:translateX(220%) skewX(-20deg)} }
      @keyframes scWiggle { 0%,100%{transform:rotate(0)} 25%{transform:rotate(-6deg)} 75%{transform:rotate(6deg)} }
      @keyframes scGlow { 0%,100%{box-shadow:0 0 0 0 rgba(59,130,246,.35)} 50%{box-shadow:0 0 0 10px rgba(59,130,246,0)} }
      @keyframes scBlobA { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(40px,30px) scale(1.18)} }
      @keyframes scBlobB { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-35px,-25px) scale(1.15)} }
      @keyframes scBlobC { 0%,100%{transform:translate(-50%,-50%) scale(1)} 50%{transform:translate(-40%,-60%) scale(1.22)} }
      @keyframes scRingPulse { 0%{transform:scale(.7);opacity:.6} 100%{transform:scale(1.4);opacity:0} }
      @keyframes scSparkle { 0%,100%{opacity:0;transform:scale(.5)} 50%{opacity:1;transform:scale(1.2)} }
      @keyframes scGradientShift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
      @keyframes scSlideInPage { from{opacity:0;transform:translateY(8px) scale(.995)} to{opacity:1;transform:translateY(0) scale(1)} }
      @keyframes scTiltHover { 0%{transform:rotate(0)} 50%{transform:rotate(2deg)} 100%{transform:rotate(0)} }
      @keyframes scBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }

      .sc-fade-in{opacity:0;animation:scFadeIn .55s ease-out forwards}
      .sc-fade-up{opacity:0;animation:scFadeUp .6s ease-out forwards}
      .sc-fade-down{opacity:0;animation:scFadeDown .55s ease-out forwards}
      .sc-fade-left{opacity:0;animation:scFadeLeft .6s ease-out forwards}
      .sc-fade-right{opacity:0;animation:scFadeRight .6s ease-out forwards}
      .sc-card-pop{opacity:0;animation:scCardPop .65s cubic-bezier(.2,.9,.3,1.2) forwards}
      .sc-pop{opacity:0;animation:scPop .5s cubic-bezier(.2,.9,.3,1.4) forwards}
      .sc-pulse-soft{animation:scPulseSoft 2.4s ease-in-out infinite}
      .sc-pulse-ring{animation:scPulseRing 2.4s cubic-bezier(0,0,.2,1) infinite}
      .sc-float-a{animation:scFloatA 8s ease-in-out infinite}
      .sc-float-b{animation:scFloatB 10s ease-in-out infinite}
      .sc-float-c{animation:scFloatC 9s ease-in-out infinite}
      .sc-glow{animation:scGlow 2.2s ease-in-out infinite}
      .sc-wiggle:hover{animation:scWiggle .5s ease-in-out}

      .sc-d1{animation-delay:.08s} .sc-d2{animation-delay:.16s} .sc-d3{animation-delay:.24s}
      .sc-d4{animation-delay:.32s} .sc-d5{animation-delay:.40s} .sc-d6{animation-delay:.48s}
      .sc-d7{animation-delay:.56s} .sc-d8{animation-delay:.64s} .sc-d9{animation-delay:.72s}
      .sc-d10{animation-delay:.80s}

      .sc-btn{transition:transform .25s ease,box-shadow .25s ease,background-color .25s ease}
      .sc-btn:hover{transform:translateY(-2px)}
      .sc-btn:active{transform:translateY(0) scale(.97)}

      .sc-card-hover{transition:transform .3s ease,box-shadow .3s ease}
      .sc-card-hover:hover{transform:translateY(-3px);box-shadow:0 14px 34px -10px rgba(30,64,175,.25)}

      .sc-icon-spin{transition:transform .35s ease}
      .sc-icon-spin:hover{transform:rotate(15deg) scale(1.08)}

      .sc-shimmer-wrap{position:relative;overflow:hidden}
      .sc-shimmer-wrap::after{content:"";position:absolute;top:0;left:0;width:60%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.32),transparent);animation:scShimmer 3s ease-in-out infinite;pointer-events:none}

      .sc-blob-a{animation:scBlobA 12s ease-in-out infinite}
      .sc-blob-b{animation:scBlobB 14s ease-in-out infinite}
      .sc-blob-c{transform-origin:center;animation:scBlobC 16s ease-in-out infinite}
      .sc-ring-pulse{opacity:0;animation:scRingPulse 2.6s cubic-bezier(0,.4,.6,1) infinite}
      .sc-sparkle{opacity:0;animation:scSparkle 2.8s ease-in-out infinite}
      .sc-bounce{animation:scBounce 2.2s ease-in-out infinite}
      .sc-tilt{transition:transform .35s ease,box-shadow .35s ease}
      .sc-tilt:hover{transform:rotate(4deg) scale(1.08);box-shadow:0 18px 38px -10px rgba(0,0,0,.35)}
      .sc-grad-anim{background-size:200% 200%;animation:scGradientShift 6s ease infinite}
      .sc-page-in{animation:scSlideInPage .5s ease-out forwards}

      .sc-row{opacity:0;animation:scFadeUp .45s ease-out forwards}
      .sc-row:nth-child(1){animation-delay:.04s}
      .sc-row:nth-child(2){animation-delay:.08s}
      .sc-row:nth-child(3){animation-delay:.12s}
      .sc-row:nth-child(4){animation-delay:.16s}
      .sc-row:nth-child(5){animation-delay:.20s}
      .sc-row:nth-child(6){animation-delay:.24s}
      .sc-row:nth-child(7){animation-delay:.28s}
      .sc-row:nth-child(8){animation-delay:.32s}
      .sc-row:nth-child(9){animation-delay:.36s}
      .sc-row:nth-child(10){animation-delay:.40s}
      .sc-row:nth-child(n+11){animation-delay:.44s}
    `}</style>
  );
}

export default function App() {
  const [page, setPage] = useState("welcome");

  const [teacher, setTeacher] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [report, setReport] = useState(null);
  const go = (p) => { setPage(p); window.scrollTo(0, 0); };
  const pages = {
    "welcome":              <PageWelcome go={go}/>,
    "help":                 <PageHelp go={go}/>,
    "about":                <PageAbout go={go}/>,
    "role":                 <PageRoleSelect go={go}/>,
    "teacher-login":        <PageTeacherLogin go={go} setTeacher={setTeacher}/>,
    "teacher-dashboard":    <PageTeacherDashboard go={go} teacher={teacher}/>,
    "teacher-attendance":   <PageTeacherAttendance go={go} teacher={teacher}/>,
    "teacher-view":         <PageTeacherViewAttendance go={go} teacher={teacher}/>,
    "teacher-leave":        <PageTeacherLeave go={go} teacher={teacher}/>,
    "admin-login":          <PageAdminLogin go={go} setAdmin={setAdmin}/>,
    "admin-dashboard":      <PageAdminDashboard go={go} admin={admin}/>,
    "admin-add":            <PageAdminAdd go={go}/>,
    "admin-modify":         <PageAdminModifyAttendance go={go}/>,
    "admin-remove":         <PageAdminRemove go={go}/>,
    "admin-reports":        <PageAdminReports go={go} setReport={setReport}/>,
    "admin-report-preview": <PageAdminReportPreview go={go} report={report}/>,
  };
  return (
    <div className="min-h-screen bg-blue-50">
      <ScAnimations/>
      <div key={page} className="sc-fade-in">
        {pages[page] || <PageRoleSelect go={go}/>}
      </div>
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { useThemeLanguage } from "../context/useThemeLanguage.js";
import { translations } from "../i18n/translations.js";

// Hook nhỏ: phát hiện khi một section cuộn vào khung nhìn, để kích hoạt animation 1 lần
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;

    if (!el) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold },
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, [threshold]);

  return [ref, inView];
}

// Animate từng chữ trong một dòng tiêu đề
function AnimatedWords({
  text,
  inView = true,
  baseDelay = 0,
  stagger = 0.045,
  wordClassName = "",
}) {
  const words = text.split(" ");

  return (
    <>
      {words.map((word, i) => (
        <span
          key={i}
          className="inline-block overflow-hidden pb-1 align-bottom"
        >
          <span
            className={`inline-block transition-all duration-700 ease-out ${wordClassName}`}
            style={{
              opacity: inView ? 1 : 0,
              transform: inView ? "translateY(0)" : "translateY(115%)",
              transitionDelay: inView ? `${baseDelay + i * stagger}s` : "0s",
            }}
          >
            {word}
            {i < words.length - 1 ? "\u00A0" : ""}
          </span>
        </span>
      ))}
    </>
  );
}

function HeroSneaker({ t }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinKey, setSpinKey] = useState(0);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setTilt({
      x: (x / rect.width - 0.5) * 14,
      y: (y / rect.height - 0.5) * -10,
    });
  };

  const handleMouseEnter = () => {
    setHovered(true);

    if (!isSpinning) {
      setSpinKey((prev) => prev + 1);
      setIsSpinning(true);
    }
  };

  const handleMouseLeave = () => {
    setHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  const handleSpinEnd = () => {
    setIsSpinning(false);
  };

  const stars = [
    [
      "left-[11%] top-[26%]",
      "text-neutral-900",
      32,
      "0s",
      "-translate-x-7 -translate-y-5",
    ],
    [
      "left-[25%] top-[16%]",
      "text-neutral-500",
      15,
      "0.4s",
      "-translate-x-3 -translate-y-6",
    ],
    [
      "right-[14%] top-[22%]",
      "text-neutral-900",
      28,
      "0.9s",
      "translate-x-7 -translate-y-5",
    ],
    ["right-[7%] top-[46%]", "text-neutral-500", 17, "1.4s", "translate-x-8"],
    [
      "left-[19%] bottom-[21%]",
      "text-neutral-600",
      21,
      "1.9s",
      "-translate-x-6 translate-y-6",
    ],
    [
      "right-[24%] bottom-[16%]",
      "text-neutral-400",
      14,
      "2.4s",
      "translate-x-5 translate-y-5",
    ],
  ];

  return (
    <div
      className="group relative flex min-h-[520px] items-center justify-center overflow-hidden rounded-[2rem] border border-neutral-200 bg-[#f0f0ee] opacity-0 sm:min-h-[560px] lg:min-h-[590px]"
      style={{
        animation: "heroPanelIn 0.8s ease-out 0.15s forwards",
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <style>{`
        @keyframes shoeFloat {
          0%, 100% { transform: translateY(0) rotate(-2.5deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
        }

        @keyframes orbitOne {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }

        @keyframes orbitTwo {
          from { transform: translate(-50%, -50%) rotate(360deg); }
          to { transform: translate(-50%, -50%) rotate(0deg); }
        }

        @keyframes starMove {
          0%, 100% {
            opacity: 0.35;
            transform: scale(0.8) translateY(3px);
          }

          50% {
            opacity: 1;
            transform: scale(1.05) translateY(-6px);
          }
        }

        @keyframes shadowMove {
          0%, 100% {
            transform: translateX(-50%) scaleX(1);
            opacity: 0.18;
          }

          50% {
            transform: translateX(-50%) scaleX(0.75);
            opacity: 0.08;
          }
        }

        @keyframes shoeSpin {
          from {
            transform: perspective(1100px) rotateY(0deg);
          }

          to {
            transform: perspective(1100px) rotateY(360deg);
          }
        }

        @keyframes heroPanelIn {
          from {
            opacity: 0;
            transform: translateY(18px) scale(0.98);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes badgePulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(23,23,23,0.28);
          }

          50% {
            box-shadow: 0 0 0 8px rgba(23,23,23,0);
          }
        }

        .hero-shoe {
          animation: shoeFloat 4s ease-in-out infinite;
        }

        .hero-orbit-one {
          animation: orbitOne 14s linear infinite;
        }

        .hero-orbit-two {
          animation: orbitTwo 20s linear infinite;
        }

        .hero-star {
          animation: starMove 2.8s ease-in-out infinite;
        }

        .hero-shadow {
          animation: shadowMove 4s ease-in-out infinite;
        }

        .hero-shoe-spin {
          animation: shoeSpin 2.6s ease-in-out;
        }

        .hero-badge {
          animation: badgePulse 2.6s ease-in-out infinite;
        }
      `}</style>

      {/* Glow */}
      <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/80 blur-3xl" />

      {/* Orbit rings */}
      <div className="hero-orbit-one absolute left-1/2 top-1/2 h-[340px] w-[580px] rounded-[50%] border-[2.5px] border-neutral-400/80" />

      <div className="hero-orbit-two absolute left-1/2 top-1/2 h-[270px] w-[490px] rounded-[50%] border-[2px] border-neutral-300/90" />

      {/* Stars */}
      {stars.map(([pos, color, size, delay, hover]) => (
        <span
          key={pos}
          className={`hero-star pointer-events-none absolute z-20 ${pos} ${color} transition-all duration-700 ${
            hovered ? hover : ""
          }`}
          style={{ animationDelay: delay }}
        >
          <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 1.5L14.4 9.5L22.5 12L14.4 14.5L12 22.5L9.6 14.5L1.5 12L9.6 9.5L12 1.5Z" />
          </svg>
        </span>
      ))}

      {/* Badge */}
      <div className="hero-badge absolute right-6 top-6 z-30 rounded-full bg-neutral-950 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white shadow-lg transition-transform duration-300 hover:scale-105">
        <span className="mr-2">✦</span>
        {t.home.hero.badge}
      </div>

      {/* Shoe Container */}
      <div className="absolute inset-0 flex items-center justify-center px-6 pt-10">
        <div
          className="relative w-[85%] max-w-[540px]"
          style={{ perspective: "1100px" }}
        >
          <div className="hero-shoe relative">
            {/* Shadow */}
            <div className="hero-shadow absolute -bottom-8 left-1/2 h-8 w-[60%] rounded-full bg-neutral-900/30 blur-xl" />

            <div
              key={spinKey}
              className={`transform-gpu transition-transform duration-150 ease-out ${
                isSpinning ? "hero-shoe-spin" : ""
              }`}
              onAnimationEnd={handleSpinEnd}
              style={{
                transform: isSpinning
                  ? undefined
                  : `perspective(1100px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
              }}
            >
              {/* Clean Geometric Sneaker SVG */}
              <svg
                viewBox="0 0 860 480"
                className="block h-auto w-full drop-shadow-[0_28px_32px_rgba(0,0,0,0.14)]"
                role="img"
                aria-label={t.home.hero.imageAlt}
              >
                <defs>
                  <linearGradient
                    id="bodyGrad"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="100%" stopColor="#e5e5e0" />
                  </linearGradient>

                  <linearGradient
                    id="soleGrad"
                    x1="0%"
                    y1="0%"
                    x2="0%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="100%" stopColor="#d0d0cc" />
                  </linearGradient>
                </defs>

                {/* Outsole */}
                <path
                  d="M 180 395 C 180 420, 210 430, 260 430 L 680 430 C 750 430, 780 410, 780 385 C 780 375, 750 370, 680 370 L 220 370 C 190 370, 180 380, 180 395 Z"
                  fill="#1a1a1a"
                />

                {/* Midsole */}
                <path
                  d="M 175 355 C 175 385, 205 395, 260 395 L 680 395 C 750 395, 790 370, 790 345 C 790 330, 750 325, 680 325 L 220 325 C 190 325, 175 340, 175 355 Z"
                  fill="url(#soleGrad)"
                />

                {/* Heel Panel */}
                <path
                  d="M 190 325 L 190 150 C 190 110, 230 80, 270 80 L 330 80 C 290 150, 290 230, 330 325 Z"
                  fill="#1a1a1a"
                />

                {/* Main Upper */}
                <path
                  d="M 300 325 C 300 230, 300 150, 350 80 L 400 80 C 440 80, 480 120, 540 160 C 600 200, 660 220, 720 230 C 770 240, 790 270, 790 300 C 790 320, 750 325, 680 325 Z"
                  fill="url(#bodyGrad)"
                />

                {/* Toe Guard */}
                <path
                  d="M 580 325 C 580 250, 640 230, 720 230 C 770 240, 790 270, 790 300 C 790 320, 750 325, 680 325 Z"
                  fill="#d4d4d0"
                />

                {/* Abstract Swoosh / Logo */}
                <path
                  d="M 280 200 C 400 280, 540 270, 640 170 C 560 220, 440 230, 330 170 Z"
                  fill="#1a1a1a"
                />

                {/* Collar Padding */}
                <path
                  d="M 270 80 L 360 80 C 370 110, 340 140, 310 140 C 280 140, 260 110, 270 80 Z"
                  fill="#b0b0ac"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Caption */}
      <div className="absolute bottom-6 left-6 z-30">
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-neutral-400">
          {t.home.hero.captionEyebrow}
        </p>

        <p className="mt-1 text-sm font-semibold text-neutral-950">
          {t.home.hero.captionTitle}
        </p>
      </div>
    </div>
  );
}

function HomePage() {
  const { language } = useThemeLanguage();
  const t = translations[language];

  const [introRef, introInView] = useInView();
  const [ctaRef, ctaInView] = useInView();

  const approachItems = t.home.approach.items;

  return (
    <div className="overflow-hidden bg-[#f7f7f6]">
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(22px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .fade-up {
          opacity: 0;
          animation: fadeInUp 0.7s ease-out forwards;
        }

        @keyframes textShine {
          to {
            background-position: -200% center;
          }
        }

        .text-shimmer {
          background: linear-gradient(
            90deg,
            #a3a3a3 20%,
            #171717 40%,
            #171717 60%,
            #a3a3a3 80%
          );

          background-size: 220% auto;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: textShine 4.5s linear infinite;
        }

        @keyframes btnShine {
          0% {
            transform: translateX(-160%) skewX(-20deg);
          }

          35%,
          100% {
            transform: translateX(260%) skewX(-20deg);
          }
        }

        .btn-shine {
          position: relative;
          overflow: hidden;
          isolation: isolate;
        }

        .btn-shine::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 35%;
          height: 100%;
          background: linear-gradient(
            115deg,
            transparent,
            rgba(255,255,255,0.55),
            transparent
          );
          transform: translateX(-160%) skewX(-20deg);
          animation: btnShine 3.4s ease-in-out infinite;
          animation-delay: 1.1s;
          pointer-events: none;
        }

        .btn-shine-dark::after {
          background: linear-gradient(
            115deg,
            transparent,
            rgba(23,23,23,0.12),
            transparent
          );
        }

        @keyframes dotGlow {
          0%,
          100% {
            box-shadow: 0 0 0 0 rgba(23,23,23,0.35);
          }

          50% {
            box-shadow: 0 0 0 6px rgba(23,23,23,0);
          }
        }

        .dot-glow {
          animation: dotGlow 2.4s ease-in-out infinite;
        }
      `}</style>

      {/* Hero */}
      <section className="border-b border-neutral-200 bg-[#f7f7f6]">
        <div className="mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6 sm:pb-20 sm:pt-14 lg:px-8 lg:pb-24 lg:pt-16">
          <div className="grid items-center gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:gap-12">
            {/* Hero content */}
            <div className="max-w-2xl">
              <p
                className="fade-up mb-5 text-[11px] font-semibold uppercase tracking-[0.28em] text-neutral-400"
                style={{ animationDelay: "0s" }}
              >
                {t.home.hero.eyebrow}
              </p>

              <h1 className="max-w-3xl text-5xl font-semibold leading-[1.02] tracking-[-0.05em] text-neutral-950 sm:text-6xl lg:text-7xl">
                <AnimatedWords
                  text={t.home.hero.titleLineOne}
                  baseDelay={0.08}
                />

                <span className="block">
                  <AnimatedWords
                    text={t.home.hero.titleLineTwo}
                    baseDelay={0.32}
                    wordClassName="text-shimmer"
                  />
                </span>
              </h1>

              <p
                className="fade-up mt-7 max-w-xl text-base leading-7 text-neutral-600 sm:text-lg sm:leading-8"
                style={{ animationDelay: "0.2s" }}
              >
                {t.home.hero.description}
              </p>

              <div
                className="fade-up mt-9 flex flex-wrap items-center gap-3"
                style={{ animationDelay: "0.3s" }}
              >
                <Link
                  to="/products"
                  className="btn-shine group inline-flex items-center justify-center rounded-xl bg-neutral-950 px-6 py-3.5 text-sm font-medium !text-white transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.03] hover:bg-neutral-800 hover:shadow-lg hover:shadow-neutral-950/20 active:scale-95"
                >
                  <span className="relative z-10">
                    {t.home.hero.exploreProducts}
                  </span>

                  <span className="relative z-10 ml-3 inline-block transition-transform duration-300 group-hover:translate-x-1.5">
                    →
                  </span>
                </Link>

                <Link
                  to="/about"
                  className="btn-shine btn-shine-dark inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-6 py-3.5 text-sm font-medium text-neutral-900 transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.03] hover:border-neutral-950 hover:bg-neutral-50 active:scale-95"
                >
                  <span className="relative z-10">
                    {t.home.hero.aboutStore}
                  </span>
                </Link>
              </div>

              {/* Shopping flow */}
              <div
                className="fade-up mt-12 grid max-w-xl grid-cols-3 border-y border-neutral-200 py-5"
                style={{ animationDelay: "0.4s" }}
              >
                <div className="group cursor-default pr-4 transition-transform duration-300 hover:-translate-y-1">
                  <p className="text-2xl font-semibold tracking-tight text-neutral-950 transition-colors duration-300 group-hover:text-neutral-500">
                    01
                  </p>

                  <p className="mt-1 text-xs leading-5 text-neutral-500">
                    {t.home.hero.stepOne}
                  </p>
                </div>

                <div className="group cursor-default border-l border-neutral-200 px-4 transition-transform duration-300 hover:-translate-y-1">
                  <p className="text-2xl font-semibold tracking-tight text-neutral-950 transition-colors duration-300 group-hover:text-neutral-500">
                    02
                  </p>

                  <p className="mt-1 text-xs leading-5 text-neutral-500">
                    {t.home.hero.stepTwo}
                  </p>
                </div>

                <div className="group cursor-default border-l border-neutral-200 pl-4 transition-transform duration-300 hover:-translate-y-1">
                  <p className="text-2xl font-semibold tracking-tight text-neutral-950 transition-colors duration-300 group-hover:text-neutral-500">
                    03
                  </p>

                  <p className="mt-1 text-xs leading-5 text-neutral-500">
                    {t.home.hero.stepThree}
                  </p>
                </div>
              </div>
            </div>

            {/* Hero sneaker illustration */}
            <HeroSneaker t={t} />
          </div>
        </div>
      </section>

      {/* Collection intro */}
      <section ref={introRef} className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div
              className="transition-all duration-700 ease-out"
              style={{
                opacity: introInView ? 1 : 0,
                transform: introInView ? "translateY(0)" : "translateY(24px)",
              }}
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-neutral-400">
                {t.home.approach.eyebrow}
              </p>

              <h2 className="mt-4 max-w-md text-3xl font-semibold tracking-[-0.035em] text-neutral-950 sm:text-4xl">
                <AnimatedWords
                  text={t.home.approach.title}
                  inView={introInView}
                  baseDelay={0.1}
                />
              </h2>
            </div>

            <div className="grid gap-8 sm:grid-cols-3">
              {approachItems.map((item, i) => (
                <div
                  key={item.title}
                  className="group transition-all duration-700 ease-out hover:-translate-y-1"
                  style={{
                    opacity: introInView ? 1 : 0,
                    transform: introInView
                      ? "translateY(0)"
                      : "translateY(24px)",
                    transitionDelay: introInView ? `${0.12 * (i + 1)}s` : "0s",
                  }}
                >
                  <p className="text-sm font-semibold text-neutral-950">
                    <span className="dot-glow inline-block h-1.5 w-1.5 -translate-y-px rounded-full bg-neutral-950 transition-transform duration-300 group-hover:scale-150" />{" "}
                    {item.title}
                  </p>

                  <p className="mt-2 text-sm leading-6 text-neutral-500">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section
        ref={ctaRef}
        className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
      >
        <div
          className="overflow-hidden rounded-[2rem] bg-neutral-950 px-6 py-12 transition-all duration-700 ease-out sm:px-10 sm:py-16 lg:px-14"
          style={{
            opacity: ctaInView ? 1 : 0,
            transform: ctaInView ? "scale(1)" : "scale(0.97)",
          }}
        >
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-neutral-500">
                {t.home.cta.eyebrow}
              </p>

              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl lg:text-5xl">
                <AnimatedWords
                  text={t.home.cta.title}
                  inView={ctaInView}
                  baseDelay={0.05}
                />
              </h2>

              <p className="mt-4 max-w-xl text-sm leading-6 text-neutral-400 sm:text-base">
                {t.home.cta.description}
              </p>
            </div>

            <Link
              to="/products"
              className="btn-shine btn-shine-dark group inline-flex shrink-0 items-center justify-center rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-neutral-950 transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.04] hover:bg-neutral-100 hover:shadow-lg hover:shadow-black/20 active:scale-95"
            >
              <span className="relative z-10">{t.home.cta.button}</span>

              <span className="relative z-10 ml-3 inline-block transition-transform duration-300 group-hover:translate-x-1.5">
                →
              </span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;

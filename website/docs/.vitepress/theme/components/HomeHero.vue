<template>
  <section class="home-hero">
    <span class="hero-orb hero-orb--nectarine" aria-hidden="true" />
    <span class="hero-orb hero-orb--peche" aria-hidden="true" />
    <span class="hero-orb hero-orb--menthe" aria-hidden="true" />
    <span class="hero-orb hero-orb--lagune" aria-hidden="true" />

    <div class="hero-inner">
      <h1 class="hero-title">
        من الصفر إلى الاحتراف
        <span class="hero-accent">في هندسة الذكاء الاصطناعي</span>
      </h1>

      <p class="hero-subtitle">مسار تعليمي شامل من 20 مرحلة و435 درسًا</p>
      <p class="hero-description">
        الرياضيات، بايثون، الخوارزميات، النماذج التوليدية، بناء LLMs ونشرها — بأيدٍ عربية.
      </p>

      <div class="hero-actions">
        <a class="hero-btn hero-btn--primary" href="/phases/00/01-dev-environment">
          ابدأ التعلم الآن 🚀
        </a>
        <a class="hero-btn hero-btn--secondary" href="/roadmap">
          استكشف المسار 🗺️
        </a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.home-hero {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  padding: clamp(4rem, 9vw, 7rem) 1.5rem clamp(4.5rem, 9vw, 7rem);
  text-align: center;
  background: var(--bg);
  transition: background-color 0.3s ease;
}

.hero-inner {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 1060px;
  margin: 0 auto;
}

.hero-orb {
  position: absolute;
  z-index: 1;
  width: clamp(120px, 18vw, 240px);
  height: clamp(120px, 18vw, 240px);
  pointer-events: none;
  border: 2px solid currentColor;
  border-radius: 50%;
  opacity: 0.32;
  filter: blur(1px);
  box-shadow: var(--neo-shadow-sm);
  transition: opacity 0.3s ease, box-shadow 0.3s ease;
}

.hero-orb::after {
  position: absolute;
  inset: 18%;
  content: '';
  background: currentColor;
  border-radius: 50%;
  opacity: 0.14;
}

.hero-orb--nectarine {
  top: -4rem;
  inset-inline-end: -3rem;
  color: var(--nectarine);
}

.hero-orb--peche {
  top: 16%;
  inset-inline-start: -5rem;
  width: clamp(90px, 12vw, 170px);
  height: clamp(90px, 12vw, 170px);
  color: var(--peche);
}

.hero-orb--menthe {
  bottom: -5rem;
  inset-inline-start: 12%;
  width: clamp(100px, 14vw, 190px);
  height: clamp(100px, 14vw, 190px);
  color: var(--menthe);
}

.hero-orb--lagune {
  bottom: 8%;
  inset-inline-end: 6%;
  width: clamp(70px, 9vw, 130px);
  height: clamp(70px, 9vw, 130px);
  color: var(--lagune);
}

.hero-title {
  max-width: 1000px;
  margin: 0 auto 1.1rem;
  font-size: clamp(2.5rem, 5.2vw, 4rem);
  font-weight: 800;
  line-height: 1.18;
  color: var(--vp-c-text-1);
}

.hero-accent {
  display: block;
  color: var(--nectarine-strong);
}

@supports ((-webkit-background-clip: text) or (background-clip: text)) {
  .hero-accent {
    background: linear-gradient(120deg, var(--nectarine-strong) 10%, var(--peche-text) 90%);
    background-clip: text;
    -webkit-background-clip: text;
    color: transparent;
  }
}

.dark .hero-accent {
  background: linear-gradient(120deg, var(--nectarine-text) 10%, var(--peche-text) 90%);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}

.hero-subtitle {
  max-width: 760px;
  margin: 0 auto 0.65rem;
  font-size: clamp(1.1rem, 1.9vw, 1.4rem);
  font-weight: 600;
  line-height: 1.6;
  color: var(--vp-c-text-2);
}

.hero-description {
  max-width: 760px;
  margin: 0 auto;
  font-size: clamp(0.95rem, 1.35vw, 1.08rem);
  line-height: 1.85;
  color: var(--vp-c-text-2);
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.85rem;
  justify-content: center;
  margin-top: 2rem;
}

.hero-btn {
  display: inline-flex;
  gap: 0.4rem;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  padding: 0.75rem 1.4rem;
  font-size: 0.95rem;
  font-weight: 800;
  text-decoration: none;
  border-radius: 12px;
  transition: transform 0.2s ease, background-color 0.2s ease, border-color 0.2s ease,
    box-shadow 0.2s ease, color 0.2s ease;
}

.hero-btn:hover {
  transform: translateY(-2px);
}

.hero-btn:focus-visible {
  outline: 2px solid var(--lagune-text);
  outline-offset: 3px;
}

.hero-btn--primary {
  color: #1a1c20;
  background: linear-gradient(135deg, var(--nectarine), var(--peche));
  border: 2px solid color-mix(in srgb, var(--peche) 48%, var(--nectarine));
  box-shadow: 6px 6px 12px color-mix(in srgb, var(--nectarine) 40%, var(--shadow-dark)),
    -6px -6px 12px var(--shadow-light);
}

.hero-btn--primary:hover {
  background: linear-gradient(135deg, var(--nectarine), var(--peche));
  color: #1a1c20;
  box-shadow: 7px 7px 16px color-mix(in srgb, var(--nectarine) 48%, var(--shadow-dark)),
    -7px -7px 16px var(--shadow-light);
}

.hero-btn--secondary {
  color: var(--peche-text);
  background: transparent;
  border: 2px solid var(--peche);
  box-shadow: var(--neo-shadow-sm);
}

.hero-btn--secondary:hover {
  color: var(--peche-text);
  background: color-mix(in srgb, var(--peche) 14%, transparent);
  border-color: var(--peche-text);
}

.dark .hero-btn--primary {
  color: #1a1c20;
  background: linear-gradient(135deg, var(--nectarine-text), var(--peche-text));
  border-color: color-mix(in srgb, var(--peche) 55%, var(--nectarine));
}

.dark .hero-btn--primary:hover {
  color: #1a1c20;
  background: linear-gradient(135deg, var(--nectarine-text), var(--peche-text));
}

@media (max-width: 480px) {
  .hero-actions {
    flex-direction: column;
  }

  .hero-btn {
    width: 100%;
  }

  .hero-orb {
    opacity: 0.22;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-btn {
    transition: none;
  }
}
</style>

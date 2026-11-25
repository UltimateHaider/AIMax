<template>
  <footer class="site-footer">
    <div class="footer-inner">
      <div class="footer-brand">
        <a class="footer-logo" href="/">
          <span class="footer-logo-mark" aria-hidden="true">AI</span>
          <span>AI Engineering <strong>بالعربية</strong></span>
        </a>
        <p class="footer-tagline">
          منهج مفتوح المصدر لتعلم هندسة الذكاء الاصطناعي من الصفر إلى الاحتراف.
        </p>
      </div>

      <nav class="footer-links" aria-label="روابط سريعة">
        <a href="/">الرئيسية</a>
        <a href="/roadmap">خريطة المسار</a>
        <a href="/about">عن المسار</a>
        <a
          href="https://github.com/UltimateHaider/ai-engineering-from-scratch"
          target="_blank"
          rel="noopener noreferrer"
        >GitHub</a>
        <a
          href="https://github.com/UltimateHaider/ai-engineering-from-scratch/blob/main/LICENSE"
          target="_blank"
          rel="noopener noreferrer"
        >الترخيص</a>
      </nav>
    </div>

    <div class="footer-bottom">
      <p>
        MIT — المصدر الأصلي:
        <a
          href="https://github.com/rohitg00/ai-engineering-from-scratch"
          target="_blank"
          rel="noopener noreferrer"
        >rohitg00/ai-engineering-from-scratch</a>
      </p>
      <p>© 2026 AI Engineering بالعربية</p>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  padding: 2.5rem 1.5rem 1.4rem;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg-alt);
  border-block-start: 4px solid transparent;
  border-image: linear-gradient(
      90deg,
      var(--nectarine),
      var(--peche),
      var(--menthe),
      var(--lagune)
    )
    1;
}

.footer-inner,
.footer-bottom {
  max-width: 1152px;
  margin: 0 auto;
}

.footer-inner {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
  justify-content: space-between;
  padding-bottom: 1.6rem;
}

.footer-brand {
  max-width: 440px;
}

.footer-logo {
  display: inline-flex;
  gap: 0.55rem;
  align-items: center;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  text-decoration: none;
}

.footer-logo strong {
  font-weight: 700;
  color: var(--vp-c-brand-1);
}

.footer-logo-mark {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  font-family: var(--vp-font-family-mono);
  font-size: 0.62rem;
  font-weight: 800;
  color: #1a1c20;
  background: linear-gradient(135deg, var(--nectarine), var(--peche));
  border: 2px solid color-mix(in srgb, var(--peche) 55%, var(--nectarine));
  border-radius: 9px;
  box-shadow: var(--neo-shadow-sm);
}

.footer-tagline {
  margin: 0.65rem 0 0;
  font-size: 0.82rem;
  line-height: 1.7;
  color: var(--vp-c-text-2);
}

.footer-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 1.2rem;
  align-items: center;
  padding-top: 0.2rem;
}

.footer-links a {
  font-size: 0.84rem;
  font-weight: 600;
  color: var(--vp-c-text-2);
  text-decoration: none;
  transition: color 0.2s ease;
}

.footer-links a:hover,
.footer-bottom a:hover {
  color: var(--lagune-text);
}

.footer-bottom {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1.5rem;
  align-items: center;
  justify-content: space-between;
  padding-top: 1.1rem;
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
  border-block-start: 1px solid var(--vp-c-divider);
}

.footer-bottom p {
  margin: 0;
}

.footer-bottom a {
  color: var(--vp-c-text-2);
  text-decoration: none;
}

.footer-bottom a:hover {
  color: var(--lagune-text);
}

@media (max-width: 768px) {
  .site-footer {
    padding-inline: 1rem;
  }

  .footer-inner {
    flex-direction: column;
    gap: 1.2rem;
  }

  .footer-bottom {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>

<template>
  <header ref="siteNavRef" class="site-nav" :class="{ 'is-scrolled': isScrolled }" dir="rtl">
    <div class="site-nav__inner">
      <div class="site-nav__start">
        <a href="/" class="site-brand">
          <span class="site-brand__mark" aria-hidden="true">🧠</span>
          <span class="site-brand__copy">
            <span class="site-brand__title">
              AI Engineering
              <span class="site-brand__badge">بالعربية</span>
            </span>
            <span class="site-brand__subtitle">من الصفر إلى الاحتراف</span>
          </span>
        </a>

        <nav class="site-nav__links" aria-label="التنقل الرئيسي">
          <a
            href="/"
            class="nav-link"
            :class="{ 'is-active': isActive('/') }"
            :aria-current="isActive('/') ? 'page' : undefined"
          >
            الرئيسية
          </a>
          <a
            href="/roadmap"
            class="nav-link"
            :class="{ 'is-active': isActive('/roadmap') }"
            :aria-current="isActive('/roadmap') ? 'page' : undefined"
          >
            خريطة المسار
          </a>

          <div ref="phasesDropdownRef" class="nav-dropdown">
            <button
              ref="phasesTriggerRef"
              type="button"
              class="nav-link nav-dropdown__trigger"
              :class="{ 'is-active': isPhasesOpen }"
              :aria-expanded="isPhasesOpen"
              aria-haspopup="true"
              aria-controls="phases-menu"
              @click="togglePhasesMenu"
            >
              المراحل
              <ChevronDown
                class="nav-dropdown__chevron"
                :class="{ 'is-open': isPhasesOpen }"
                :size="15"
                aria-hidden="true"
              />
            </button>

            <div v-if="isPhasesOpen" id="phases-menu" class="phases-menu">
              <a
                v-for="phase in phasesList"
                :key="phase.id"
                :href="`/phases/${phase.id}/`"
                class="phase-menu-item"
                @click="isPhasesOpen = false"
              >
                <span class="phase-menu__badge">{{ phase.id }}</span>
                <span class="phase-menu__copy">
                  <span class="phase-menu__name">{{ phase.nameAr }}</span>
                  <span class="phase-menu__count">{{ phase.lessonCount }} درسًا</span>
                </span>
              </a>
            </div>
          </div>
        </nav>
      </div>

      <div class="site-nav__actions">
        <button
          type="button"
          class="nav-search"
          title="ابحث في 435 درسًا (Ctrl + K)"
          aria-label="بحث في الدروس"
          @click="openSearchModal"
        >
          <Search :size="17" aria-hidden="true" />
          <span class="nav-search__label">ابحث في 435 درسًا...</span>
          <kbd class="nav-search__kbd">Ctrl K</kbd>
        </button>

        <button
          type="button"
          class="icon-button"
          aria-label="تبديل المظهر"
          title="تبديل المظهر"
          @click="toggleDarkMode"
        >
          <Sun class="theme-icon theme-icon--light" :size="18" aria-hidden="true" />
          <Moon class="theme-icon theme-icon--dark" :size="18" aria-hidden="true" />
        </button>

        <a
          href="https://github.com/UltimateHaider/ai-engineering-from-scratch"
          target="_blank"
          rel="noopener noreferrer"
          class="icon-button"
          title="المستودع الأصلي على GitHub"
          aria-label="المستودع الأصلي على GitHub"
        >
          <Github :size="18" aria-hidden="true" />
        </a>

        <button
          ref="mobileToggleRef"
          type="button"
          class="icon-button nav-mobile-toggle"
          :aria-expanded="isMobileMenuOpen"
          aria-controls="mobile-menu"
          aria-label="القائمة الرئيسية"
          @click="isMobileMenuOpen = !isMobileMenuOpen"
        >
          <X v-if="isMobileMenuOpen" :size="19" aria-hidden="true" />
          <Menu v-else :size="19" aria-hidden="true" />
        </button>
      </div>
    </div>

    <div v-if="isMobileMenuOpen" id="mobile-menu" class="mobile-menu">
      <a
        href="/"
        class="mobile-menu__link"
        :class="{ 'is-active': isActive('/') }"
        :aria-current="isActive('/') ? 'page' : undefined"
        @click="isMobileMenuOpen = false"
      >
        الرئيسية
      </a>
      <a
        href="/roadmap"
        class="mobile-menu__link"
        :class="{ 'is-active': isActive('/roadmap') }"
        :aria-current="isActive('/roadmap') ? 'page' : undefined"
        @click="isMobileMenuOpen = false"
      >
        خريطة المسار التعليمي
      </a>

      <div class="mobile-menu__phases">
        <span class="mobile-menu__label">تصفح المراحل:</span>
        <a
          v-for="phase in phasesList"
          :key="phase.id"
          :href="`/phases/${phase.id}/`"
          class="mobile-phase"
          @click="isMobileMenuOpen = false"
        >
          <span class="mobile-phase__id">{{ phase.id }}</span>
          <span>{{ phase.nameAr }}</span>
          <span class="mobile-phase__count">{{ phase.lessonCount }}</span>
        </a>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useData, useRoute } from 'vitepress'
import { ChevronDown, Github, Menu, Moon, Search, Sun, X } from 'lucide-vue-next'
import summaryData from '../curriculum-summary.json'

const { isDark } = useData()
const route = useRoute()

const isScrolled = ref(false)
const isPhasesOpen = ref(false)
const isMobileMenuOpen = ref(false)
const phasesDropdownRef = ref<HTMLElement | null>(null)
const phasesTriggerRef = ref<HTMLButtonElement | null>(null)
const mobileToggleRef = ref<HTMLButtonElement | null>(null)
const siteNavRef = ref<HTMLElement | null>(null)

const phasesList = summaryData.phases || []

function isActive(path: string): boolean {
  if (path === '/') return route.path === '/' || route.path === '/index.html'
  return route.path.startsWith(path)
}

function togglePhasesMenu(): void {
  isPhasesOpen.value = !isPhasesOpen.value
}

function toggleDarkMode(): void {
  isDark.value = !isDark.value
}

function openSearchModal(): void {
  window.dispatchEvent(new CustomEvent('ai-open-search'))
}

function handleScroll(): void {
  isScrolled.value = window.scrollY > 10
}

function handleClickOutside(event: MouseEvent): void {
  const target = event.target as Node
  if (phasesDropdownRef.value && !phasesDropdownRef.value.contains(target)) {
    isPhasesOpen.value = false
  }
  if (isMobileMenuOpen.value && siteNavRef.value && !siteNavRef.value.contains(target)) {
    isMobileMenuOpen.value = false
  }
}

function handleKeydown(event: KeyboardEvent): void {
  if (event.key !== 'Escape') return

  if (isPhasesOpen.value) {
    isPhasesOpen.value = false
    phasesTriggerRef.value?.focus()
  }

  if (isMobileMenuOpen.value) {
    isMobileMenuOpen.value = false
    mobileToggleRef.value?.focus()
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.site-nav {
  position: sticky;
  top: 0;
  z-index: 50;
  width: 100%;
  background: color-mix(in srgb, var(--bg) 92%, transparent);
  border-bottom: 1px solid var(--vp-c-divider);
  backdrop-filter: blur(16px);
  transition: background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
}

.site-nav.is-scrolled {
  box-shadow: 0 8px 20px color-mix(in srgb, var(--shadow-dark) 55%, transparent);
}

.site-nav__inner {
  display: flex;
  gap: 1.25rem;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 1320px;
  height: var(--vp-nav-height, 64px);
  padding: 0 1.25rem;
  margin: 0 auto;
}

.site-nav__start,
.site-nav__actions,
.site-nav__links {
  display: flex;
  align-items: center;
}

.site-nav__start {
  gap: 1.1rem;
  min-width: 0;
}

.site-nav__links {
  gap: 0.25rem;
}

.site-nav__actions {
  flex-shrink: 0;
  gap: 0.55rem;
}

.site-brand {
  display: inline-flex;
  flex-shrink: 0;
  gap: 0.6rem;
  align-items: center;
  text-decoration: none;
}

.site-brand__mark {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  font-size: 1.15rem;
  background: linear-gradient(135deg, var(--nectarine), var(--peche));
  border: 2px solid color-mix(in srgb, var(--peche) 55%, var(--vp-c-divider));
  border-radius: 13px;
  box-shadow: var(--neo-shadow-sm);
  transition: transform 0.2s ease, box-shadow 0.3s ease;
}

.site-brand:hover .site-brand__mark {
  transform: translateY(-1px) rotate(-3deg);
}

.site-brand__copy {
  display: flex;
  flex-direction: column;
  gap: 0.05rem;
}

.site-brand__title {
  display: inline-flex;
  gap: 0.4rem;
  align-items: center;
  font-size: 0.94rem;
  font-weight: 800;
  line-height: 1.2;
  color: var(--vp-c-text-1);
  white-space: nowrap;
}

.site-brand__badge {
  padding: 0.12rem 0.4rem;
  font-size: 0.62rem;
  font-weight: 700;
  color: var(--lagune-text);
  background: color-mix(in srgb, var(--lagune) 16%, transparent);
  border: 1px solid color-mix(in srgb, var(--lagune) 40%, transparent);
  border-radius: 999px;
}

.site-brand__subtitle {
  font-size: 0.66rem;
  font-weight: 600;
  color: var(--vp-c-text-3);
  white-space: nowrap;
}

.nav-link {
  display: inline-flex;
  gap: 0.3rem;
  align-items: center;
  padding: 0.43rem 0.7rem;
  font-family: inherit;
  font-size: 0.8rem;
  font-weight: 600;
  line-height: 1.3;
  color: var(--vp-c-text-2);
  text-decoration: none;
  cursor: pointer;
  background: transparent;
  border: 2px solid transparent;
  border-radius: 11px;
  transition: color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.nav-link:hover {
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg-soft);
}

.nav-link.is-active {
  color: var(--lagune-text);
  background: color-mix(in srgb, var(--lagune) 18%, transparent);
  border-color: var(--lagune);
  box-shadow: var(--neo-inset-sm);
}

.nav-dropdown {
  position: relative;
}

.nav-dropdown__trigger {
  background: transparent;
}

.nav-dropdown__chevron {
  transition: transform 0.2s ease;
}

.nav-dropdown__chevron.is-open {
  transform: rotate(180deg);
}

.phases-menu {
  position: fixed;
  top: calc(var(--vp-nav-height, 64px) + 0.65rem);
  left: 50%;
  right: auto;
  z-index: 70;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.35rem;
  width: min(540px, calc(100vw - 2rem));
  max-height: 480px;
  padding: 0.65rem;
  overflow-y: auto;
  background: var(--bg);
  border: 2px solid var(--lagune);
  border-radius: 20px;
  box-shadow: var(--neo-shadow);
  transform: translateX(-50%);
}

.phase-menu-item {
  display: flex;
  gap: 0.55rem;
  align-items: flex-start;
  padding: 0.55rem;
  text-decoration: none;
  border: 2px solid transparent;
  border-radius: 12px;
  transition: background-color 0.2s ease, border-color 0.2s ease;
}

.phase-menu-item:hover {
  background: color-mix(in srgb, var(--lagune) 10%, transparent);
  border-color: color-mix(in srgb, var(--lagune) 35%, transparent);
}

.phase-menu__badge {
  display: grid;
  flex-shrink: 0;
  place-items: center;
  width: 30px;
  height: 30px;
  font-family: var(--vp-font-family-mono);
  font-size: 0.68rem;
  font-weight: 700;
  color: #ffffff;
  background: var(--lagune-strong);
  border-radius: 9px;
}

.phase-menu__copy {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  min-width: 0;
}

.phase-menu__name {
  overflow: hidden;
  font-size: 0.76rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.phase-menu__count {
  font-family: var(--vp-font-family-mono);
  font-size: 0.62rem;
  color: var(--vp-c-text-3);
}

.nav-search {
  display: flex;
  gap: 0.45rem;
  align-items: center;
  width: 16rem;
  padding: 0.46rem 0.65rem;
  font-family: inherit;
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  text-align: start;
  cursor: pointer;
  background: var(--bg);
  border: 2px solid var(--vp-c-divider);
  border-radius: 12px;
  box-shadow: var(--neo-inset-sm);
  transition: color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.nav-search:hover,
.nav-search:focus-visible {
  color: var(--vp-c-text-1);
  border-color: var(--lagune);
  outline: none;
}

.nav-search__label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nav-search__kbd {
  flex-shrink: 0;
  padding: 0.12rem 0.32rem;
  font-family: var(--vp-font-family-mono);
  font-size: 0.57rem;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 5px;
}

.icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  color: var(--vp-c-text-2);
  cursor: pointer;
  background: var(--bg);
  border: 2px solid var(--vp-c-divider);
  border-radius: 11px;
  box-shadow: var(--neo-shadow-sm);
  transition: color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease,
    transform 0.2s ease;
}

.icon-button:hover {
  color: var(--nectarine-text);
  border-color: var(--nectarine);
  transform: translateY(-1px);
}

.theme-icon--dark {
  display: none;
}

.dark .theme-icon--light {
  display: none;
}

.dark .theme-icon--dark {
  display: block;
}

.icon-button:focus-visible,
.nav-link:focus-visible,
.site-brand:focus-visible,
.phase-menu-item:focus-visible,
.mobile-menu__link:focus-visible,
.mobile-phase:focus-visible {
  outline: 2px solid var(--lagune-text);
  outline-offset: 2px;
}

.nav-mobile-toggle {
  display: none;
}

.mobile-menu {
  display: none;
  padding: 0.8rem 1rem 1.1rem;
  background: var(--bg);
  border-top: 1px solid var(--vp-c-divider);
  box-shadow: var(--neo-shadow);
}

.mobile-menu__link {
  display: block;
  padding: 0.65rem 0.75rem;
  font-size: 0.84rem;
  font-weight: 700;
  color: var(--vp-c-text-2);
  text-decoration: none;
  border: 2px solid transparent;
  border-radius: 11px;
}

.mobile-menu__link.is-active {
  color: var(--lagune-text);
  background: color-mix(in srgb, var(--lagune) 16%, transparent);
  border-color: var(--lagune);
}

.mobile-menu__phases {
  padding-top: 0.75rem;
  margin-top: 0.65rem;
  border-top: 1px solid var(--vp-c-divider);
}

.mobile-menu__label {
  display: block;
  padding: 0 0.75rem 0.35rem;
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--vp-c-text-3);
}

.mobile-phase {
  display: flex;
  gap: 0.55rem;
  align-items: center;
  padding: 0.45rem 0.75rem;
  font-size: 0.76rem;
  color: var(--vp-c-text-2);
  text-decoration: none;
  border-radius: 9px;
}

.mobile-phase:hover {
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg-soft);
}

.mobile-phase__id {
  font-family: var(--vp-font-family-mono);
  font-size: 0.62rem;
  font-weight: 700;
  color: var(--lagune-text);
}

.mobile-phase__count {
  margin-inline-start: auto;
  font-family: var(--vp-font-family-mono);
  font-size: 0.6rem;
  color: var(--vp-c-text-3);
}

.mobile-menu__phases {
  max-height: 15rem;
  overflow-y: auto;
}

@media (max-width: 1080px) {
  .nav-search {
    width: 36px;
    padding: 0;
    justify-content: center;
    box-shadow: var(--neo-shadow-sm);
  }

  .nav-search__label,
  .nav-search__kbd {
    display: none;
  }
}

@media (max-width: 860px) {
  .site-nav__links {
    display: none;
  }

  .nav-mobile-toggle {
    display: inline-flex;
  }

  .mobile-menu {
    display: block;
  }

  .site-brand__badge,
  .site-brand__subtitle {
    display: none;
  }
}

@media (max-width: 520px) {
  .site-nav__inner {
    gap: 0.5rem;
    padding: 0 0.7rem;
  }

  .site-nav__actions {
    gap: 0.35rem;
  }

  .icon-button {
    width: 33px;
    height: 33px;
  }

  .site-brand__title {
    font-size: 0.8rem;
  }

  .site-brand__mark {
    width: 35px;
    height: 35px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .site-nav,
  .site-brand__mark,
  .nav-link,
  .icon-button,
  .nav-dropdown__chevron {
    transition: none;
  }
}
</style>

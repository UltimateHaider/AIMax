import DefaultTheme from 'vitepress/theme-without-fonts';
import Layout from './Layout.vue';
import './katex.css';
import './custom.css';
import './auth.css';

import CustomNav from './components/CustomNav.vue';
import CustomSidebar from './components/CustomSidebar.vue';
import PhaseBadge from './components/PhaseBadge.vue';

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    app.component('CustomNav', CustomNav);
    app.component('CustomSidebar', CustomSidebar);
    app.component('PhaseBadge', PhaseBadge);
  }
};

import { createRouter, createWebHistory } from 'vue-router';
import PortalView from '../views/PortalView.vue';
import HomeView from '../views/HomeView.vue';
import MemberDetailView from '../views/MemberDetailView.vue';
import BlacklistView from '../views/BlacklistView.vue';
import DewanStaffView from '../views/DewanStaffView.vue';
import MotmView from '../views/MotmView.vue';
import NewsView from '../views/NewsView.vue';
import FaqView from '../views/FaqView.vue';
import AdminView from '../views/AdminView.vue';
import NotFoundView from '../views/NotFoundView.vue';

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/members', redirect: '/' },
  { path: '/home', redirect: '/' },
  { path: '/portal', name: 'portal', component: PortalView },
  { path: '/member-list', name: 'member-list', component: () => import('../views/MemberListView.vue') },
  { path: '/members-list', redirect: '/member-list' },
  { path: '/list-member', redirect: '/member-list' },
  { path: '/photo-member', redirect: '/member-list' },
  { path: '/biodata', redirect: '/register' },
  { path: '/member/:slug', name: 'member-detail', component: MemberDetailView },
  { path: '/members/:slug', redirect: to => `/member/${to.params.slug}` },
  { path: '/blacklist', name: 'blacklist', component: BlacklistView },
  { path: '/dewan-staff', name: 'dewan-staff', component: DewanStaffView },
  { path: '/motm', name: 'motm', component: MotmView },
  { path: '/news', name: 'news', component: NewsView },
  { path: '/articles', name: 'articles', component: () => import('../views/ArticleListView.vue') },
  { path: '/article', redirect: '/articles' },
  { path: '/article/:slug', name: 'article-detail', component: () => import('../views/ArticleDetailView.vue') },
  { path: '/faq', name: 'faq', component: FaqView },
  { path: '/rules', name: 'rules', component: () => import('../views/RulesView.vue') },
  { path: '/rules/community', redirect: '/rules?tab=community' },
  { path: '/rules/ot', redirect: '/rules?tab=ot' },
  { path: '/privacy', redirect: '/rules?tab=privacy' },
  { path: '/gallery', name: 'gallery', component: () => import('../views/GalleryView.vue') },
  { path: '/ai', name: 'ai', component: () => import('../views/AiView.vue') },
  { path: '/meetup', name: 'meetup', component: () => import('../views/MeetupView.vue') },
  { path: '/meetups', redirect: '/meetup' },
  { path: '/meetup/scan', name: 'meetup-scan', component: () => import('../views/MeetupScanView.vue') },
  { path: '/gacha', name: 'gacha', component: () => import('../views/GachaView.vue') },
  { path: '/register', name: 'register', component: () => import('../views/RegistrationFlow.vue') },
  { path: '/panel', redirect: '/admin?tab=registrations' },
  { path: '/registrations', redirect: '/admin?tab=registrations' },
  { path: '/admin', name: 'admin', component: AdminView },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFoundView }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth' };
    }
    return { top: 0, behavior: 'smooth' };
  }
});

router.beforeEach((to) => {
  const isUnlocked =
    typeof window !== 'undefined' &&
    (sessionStorage.getItem('xfive_site_unlocked') === 'true' ||
     localStorage.getItem('xfive_site_unlocked') === 'true');

  const isPublicPath =
    to.path === '/' ||
    to.path === '/home' ||
    to.path.startsWith('/admin') ||
    to.path.startsWith('/panel') ||
    to.path.startsWith('/articles') ||
    to.path.startsWith('/article') ||
    to.path.startsWith('/gallery');

  if (!isUnlocked && !isPublicPath) {
    return { path: '/', query: { redirect: to.fullPath } };
  }

  if (to.path === '/' && to.query && to.query.page) {
    return { path: '/member-list', query: to.query };
  }
});

export default router;


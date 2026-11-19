import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ProfileView from '../views/ProfileView.vue'
import BlogView from '../views/BlogView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfileView,
  },
  {
    // 文档缺失时的专属错误页，渲染 ./docs/error.md
    path: '/error',
    name: 'error',
    component: BlogView,
    props: { isError: true },
  },
  {
    // 目录式路由：/foo/bar -> ./docs/foo/bar.md
    path: '/:pathMatch(.*)*',
    name: 'blog',
    component: BlogView,
  },
]

// file:// 下 history.pushState 不可用（双击打开离线单文件），自动降级为 hash 路由；
// 通过 HTTP 访问时仍保持 /foo/bar 这种目录式 history 路由。
const isFileProtocol = typeof window !== 'undefined' && window.location.protocol === 'file:'

export const router = createRouter({
  history: isFileProtocol ? createWebHashHistory() : createWebHistory(),
  routes,
})

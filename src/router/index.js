import Vue from 'vue'
import VueRouter from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import auth from '@/auth'

const emitter = require('tiny-emitter/instance')

Vue.use(VueRouter)

const originalReplace = VueRouter.prototype.replace
VueRouter.prototype.replace = function replace (location, onResolve, onReject) {
  if (onResolve || onReject) return originalReplace.call(this, location, onResolve, onReject)
  return originalReplace.call(this, location).catch(err => {
    if (err && err.name !== 'NavigationDuplicated') {
      throw err
    }
  })
}

function requireAuth (to, from, next) {
  emitter.emit('show-loading', false)

  if (!auth.loggedIn()) {
    // Remember the original target
    next({ name: 'login' })
    return
  }

  next()
}

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    beforeEnter: requireAuth
  },
  {
    path: '/login',
    name: 'login',
    component: () => import(/* webpackChunkName: "login" */ '@/views/LoginView.vue')
  },
  {
    path: '/about',
    name: 'about',
    component: () => import(/* webpackChunkName: "about" */ '@/views/AboutView.vue'),
    beforeEnter: requireAuth
  },
  {
    path: '/activity',
    name: 'activities',
    component: () => import(/* webpackChunkName: "activities" */ '@/views/Activities.vue'),
    beforeEnter: requireAuth
  },
  {
    path: '/activity/:activityId',
    name: 'activity-details',
    component: () => import(/* webpackChunkName: "activity-details" */ '@/views/ActivityDetails.vue'),
    beforeEnter: requireAuth
  },
  {
    path: '/event/:eventId',
    name: 'event-details',
    component: () => import(/* webpackChunkName: "event-details" */ '@/views/EventDetails.vue'),
    beforeEnter: requireAuth
  },
  {
    path: '/participant',
    name: 'participants',
    component: () => import(/* webpackChunkName: "participants" */ '@/views/Participants.vue'),
    beforeEnter: requireAuth
  },
  {
    path: '/participant/:participantId',
    name: 'participant-details',
    component: () => import(/* webpackChunkName: "participant-details" */ '@/views/ParticipantDetails.vue'),
    beforeEnter: requireAuth
  }
]

const router = new VueRouter({
  routes
})

export default router

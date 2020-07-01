import Vue from 'vue'
import Router from 'vue-router'
import Dashboard from '@/views/Dashboard.vue'
import Contacts from '@/views/Contacts.vue'
import Users from '@/views/Users.vue'
import Callback from '@/views/Callback.vue'
import ContactModalForm from '@/components/ContactModalForm.vue'

Vue.use(Router)

const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/callback',
      name: 'auth-callback',
      component: Callback
    },
    {
      path: '/',
      name: 'home',
      component: Dashboard,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/contacts',
      name: 'contacts',
      component: Contacts,
      meta: {
        requiresAuth: true
      },
      children: [
        {
          path: 'create',
          name: 'contact-create',
          component: ContactModalForm,
          props: true
        },
        {
          path: 'edit/:id',
          name: 'contact-edit',
          component: ContactModalForm,
          props: true
        }
      ]
    },
    {
      path: '/users',
      name: 'users',
      component: Users,
      meta: {
        requiresAuth: true
      }
    }
    // {
    //   path: "/about",
    //   name: "about",
    //   // route level code-splitting
    //   // this generates a separate chunk (about.[hash].js) for this route
    //   // which is lazy-loaded when the route is visited.
    //   component: () =>
    //     import(/* webpackChunkName: "about" */ "./views/About.vue")
    // }
  ]
})

router.beforeEach(async (routeTo, routeFrom, next) => {
  if (routeTo.name == 'auth-callback') {
    // check if "to"-route is "callback" and allow access
    next()
  } else if (router.app.$auth.isAuthenticated()) {
    next()
  } else {
    // trigger Auth0 login
    router.app.$auth.login()
    // next()
  }
})

export default router

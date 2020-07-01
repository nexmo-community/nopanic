<template>
  <v-app>
    <BaseNavbar />
    <NotificationContainer />

    <v-content>
      <router-view :key="$route.fullPath"></router-view>
    </v-content>
  </v-app>
</template>

<style>
.layout.row.wrap {
  max-width: 500px !important;
  margin: auto;
}
.container.grid-list-md .layout:only-child {
  margin: auto;
}

@media screen and (min-width: 750px) {
  .layout.row.wrap {
    max-width: 900px !important;
  }
}
</style>

<script>
import { mapState } from 'vuex'
import NotificationContainer from '@/components/NotificationContainer.vue'

export default {
  name: 'App',
  components: {
    NotificationContainer,
  },
  mounted() {
    if (this.isLogged) {
      if (!this.isFetchingUser) {
        // get the user information or create a new user if doesn't exists
        this.$store.dispatch('user/fetchOrCreateUser')
      }
    }
  },
  data() {
    return {
      updateLocation: null,
    }
  },
  computed: {
    ...mapState({
      isLogged: (state) => state.user.isLogged,
      isFetchingUser: (state) => state.isFetchingUser,
    }),
  },
  watch: {
    isLogged: function (newVal) {
      // observing the changes in isLogged in order to
      // change of view, to home or sig in
      console.log(`isLogged: ${newVal}`)
      if (newVal) {
        this.$router.push({ name: 'home' })
      } else {
        this.$router.push({ name: 'signin' })
      }
    },
  },
}
</script>

<template>
  <div class="callback">&nbsp;</div>
</template>

<script>
export default {
  name: 'Callback',
  mounted() {
    this.$auth.handleAuthentication().then(({ user, token }) => {
      // store the user information in the app state
      this.$store.dispatch('user/signInWithUserAndToken', { user, token })
      // get the user information or create a new user if doesn't exists
      this.$store.dispatch('user/fetchOrCreateUser')
      // redirect to the home view
      this.$router.push({ name: 'home' })
    })
  }
}
</script>

<style scoped>
.callback {
  width: 40px;
  height: 40px;
  background-color: #333;
  margin: 100px auto;
  -webkit-animation: sk-rotateplane 1.2s infinite ease-in-out;
  animation: sk-rotateplane 1.2s infinite ease-in-out;
}
@-webkit-keyframes sk-rotateplane {
  0% {
    -webkit-transform: perspective(120px);
  }
  50% {
    -webkit-transform: perspective(120px) rotateY(180deg);
  }
  100% {
    -webkit-transform: perspective(120px) rotateY(180deg) rotateX(180deg);
  }
}
@keyframes sk-rotateplane {
  0% {
    transform: perspective(120px) rotateX(0deg) rotateY(0deg);
    -webkit-transform: perspective(120px) rotateX(0deg) rotateY(0deg);
  }
  50% {
    transform: perspective(120px) rotateX(-180.1deg) rotateY(0deg);
    -webkit-transform: perspective(120px) rotateX(-180.1deg) rotateY(0deg);
  }
  100% {
    transform: perspective(120px) rotateX(-180deg) rotateY(-179.9deg);
    -webkit-transform: perspective(120px) rotateX(-180deg) rotateY(-179.9deg);
  }
}
</style>

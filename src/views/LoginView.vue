<template>
  <div class="h-100 d-flex justify-content-center align-items-center">
    <b-card :title="$t('pageLoginTitle')" :sub-title="$t('pageLoginSubtitle')">
      <b-form @submit.prevent="login">
        <b-input-group label="Username" label-for="username">
          <b-form-input id="username" v-model="username" required />
        </b-input-group>
        <b-input-group label="Username" label-for="password">
          <b-form-input id="password" v-model="password" type="password" required />
        </b-input-group>
        <b-button class="w-100 mt-3" type="submit" variant="primary">{{ $t('buttonLogin') }}</b-button>
        <p v-if="error" :class="error.variant">{{ $t(error.text) }}</p>
      </b-form>
    </b-card>
  </div>
</template>

<script>
import { apiPostToken } from '@/plugins/api/auth'

const emitter = require('tiny-emitter/instance')

export default {
  name: 'LoginView',
  data: function () {
    return {
      username: null,
      password: null,
      error: null
    }
  },
  methods: {
    login: function () {
      emitter.emit('show-loading', true)
      apiPostToken({
        username: this.username,
        password: this.password
      }, result => {
        emitter.emit('show-loading', false)
        // Do this here as well
        this.$store.commit('TOKEN_CHANGED', result)

        // Otherwise, just go to home
        this.$router.push({ name: 'home' })
      }, {
        codes: [400, 401, 500],
        callback: e => {
          emitter.emit('show-loading', false)
          switch (e.status) {
            case 400:
              // Bad request, some parameter is missing
              this.error = {
                text: 'toastErrorMissingParameter',
                variant: 'text-danger'
              }
              break
            case 403:
              // Bad credentials
              this.error = {
                text: 'toastErrorInvalidUsernamePassword',
                variant: 'text-danger'
              }
              break
            case 500:
              // Server error
              this.error = {
                text: 'toastErrorServer500',
                variant: 'text-danger'
              }
              break
          }
        }
      })
    }
  }
}
</script>

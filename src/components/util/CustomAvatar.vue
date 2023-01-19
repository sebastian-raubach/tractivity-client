<template>
  <b-avatar :to="to" :variant="variant" :text="userInitials" :size="size" :src="url" />
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  props: {
    id: {
      type: Number,
      default: null
    },
    name: {
      type: String,
      default: null
    },
    size: {
      type: String,
      default: '2.5em'
    },
    variant: {
      type: String,
      default: 'dark'
    },
    searchParams: {
      type: Object,
      default: null
    },
    to: {
      type: Object,
      default: null
    },
    type: {
      type: String,
      default: 'participant'
    }
  },
  computed: {
    ...mapGetters([
      'storeToken',
      'storeBaseUrl'
    ]),
    url: function () {
      const result = new URL(`${this.type}/${this.id}/img`, this.storeBaseUrl)
      result.searchParams.append('imageToken', this.storeToken.imageToken)

      if (this.searchParams) {
        Object.keys(this.searchParams).filter(k => this.searchParams[k] !== undefined && this.searchParams[k] !== null).forEach(k => result.searchParams.append(k, this.searchParams[k]))
      }

      return result.href
    },
    userInitials: function () {
      return this.name ? (this.name || '').split(' ').slice(0, 2).map(p => p.substring(0, 1)).join('') : null
    }
  }
}
</script>

<style>

</style>

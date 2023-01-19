<template>
  <b-modal :ok-title="$t('buttonSave')"
           :cancel-title="$t('buttonCancel')"
           :title="$t('modalTitleAddActivityType')"
           size="md"
           @ok.prevent="onSubmit"
           ref="addActivityTypeModal">
    <b-form @submit.prevent="onSubmit" novalidate>
      <b-form-group :label="$t('formLabelActivityTypeName')" label-for="name">
        <b-form-input id="name" v-model="name" />
      </b-form-group>

      <!-- Preview the image -->
      <b-img fluid-grow rounded :src="imageData" class="image" v-if="imageData" />
      <!-- Input for selecting (or taking) the image -->
      <b-form-file v-model="imageFile" accept="image/png, image/jpeg" class="file-selector" ref="imageInput" />

      <p class="text-danger" v-if="errorMessage">{{ $t(errorMessage) }}</p>
    </b-form>
  </b-modal>
</template>

<script>
import { apiPostActivityType } from '@/plugins/api/activity'
const emitter = require('tiny-emitter/instance')

export default {
  data: function () {
    return {
      name: null,
      imageFile: null,
      imageData: null,
      formState: {
        name: null
      },
      errorMessage: null
    }
  },
  watch: {
    imageFile: async function (newValue) {
      if (newValue) {
        // Convert to base64 for displaying
        this.imageData = await this.toBase64(newValue)
      } else {
        this.imageData = null
      }
    }
  },
  methods: {
    /**
     * Converts the participant selected file into base64
     * @param file The image file
     */
    toBase64: function (file) {
      // Return a promise as we can't wait for this
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => resolve(reader.result)
        reader.onerror = error => reject(error)
      })
    },
    onSubmit: function () {
      this.formValidated = true

      this.formState = {
        name: this.name !== undefined && this.name !== null && this.name.length < 255
      }

      if (Object.keys(this.formState).filter(st => !this.formState[st]).length === 0) {
        emitter.emit('show-loading', true)

        const formData = new FormData()
        formData.append('image', this.imageFile)
        formData.append('name', this.name)

        apiPostActivityType(formData, () => {
          emitter.emit('show-loading', false)
          this.$emit('change')
          this.hide()
        })
      }
    },
    /**
     * Shows the modal dialog and resets it to its initial state
     */
    show: function () {
      this.name = null
      this.imageFile = null
      this.imageData = null
      this.formState = {
        null: null
      }
      this.errorMessage = null

      this.$nextTick(() => this.$refs.addActivityTypeModal.show())
    },
    /**
     * Hides the modal dialog
     */
    hide: function () {
      this.$nextTick(() => this.$refs.addActivityTypeModal.hide())
    }
  }
}
</script>

<style scoped>
</style>

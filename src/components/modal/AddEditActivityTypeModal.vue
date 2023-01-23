<template>
  <b-modal :ok-title="$t('buttonSave')"
           :cancel-title="$t('buttonCancel')"
           :title="isEdit ? $t('modalTitleEditActivityType') : $t('modalTitleAddActivityType')"
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
import { apiPostActivityType, apiPatchActivityType } from '@/plugins/api/activity'
const emitter = require('tiny-emitter/instance')

export default {
  props: {
    activityTypeToEdit: {
      type: Object,
      default: () => null
    }
  },
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
  computed: {
    isEdit: function () {
      return this.activityTypeToEdit !== null
    }
  },
  watch: {
    activityTypeToEdit: function () {
      this.update()
    },
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

        const resultHandler = () => {
          emitter.emit('show-loading', false)
          this.$emit('change')
          this.hide()
        }

        const errorHandler = {
          codes: [400, 404, 409],
          callback: e => {
            emitter.emit('show-loading', false)

            switch (e.status) {
              case 400:
                this.errorMessage = 'formErrorMissingParameter'
                break
              case 404:
                this.errorMessage = 'formErrorNotFound'
                break
            }
          }
        }

        const formData = new FormData()
        formData.append('image', this.imageFile)
        formData.append('name', this.name)

        if (this.isEdit) {
          apiPatchActivityType(this.activityTypeToEdit.id, formData, resultHandler, errorHandler)
        } else {
          apiPostActivityType(formData, resultHandler, errorHandler)
        }
      }
    },
    update: function () {
      if (this.activityTypeToEdit) {
        this.name = this.activityTypeToEdit.name
      } else {
        this.name = null
      }

      this.imageFile = null
      this.imageData = null
      this.formState = {
        null: null
      }
      this.errorMessage = null
    },
    /**
     * Shows the modal dialog and resets it to its initial state
     */
    show: function () {
      this.update()

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

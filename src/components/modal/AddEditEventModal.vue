<template>
  <b-modal :ok-title="$t('buttonSave')"
           :cancel-title="$t('buttonCancel')"
           :title="isEdit ? $t('modalTitleEditEvent') : $t('modalTitleAddEvent')"
           size="md"
           @ok.prevent="onSubmit"
           ref="addEditEventModal">
    <b-form @submit.prevent="onSubmit" novalidate>
      <b-form-group :label="$t('formLabelEventName')" label-for="name">
        <b-form-input id="name" v-model="name" />
      </b-form-group>
      <b-form-group :label="$t('formLabelEventDob')" label-for="createdOn">
        <b-form-datepicker id="createdOn" :start-weekday="1" :value-as-date="true" v-model="createdOn" />
      </b-form-group>

      <p class="text-danger" v-if="errorMessage">{{ $t(errorMessage) }}</p>
    </b-form>
  </b-modal>
</template>

<script>
import { apiPatchEvent, apiPostEvent } from '@/plugins/api/event'

const emitter = require('tiny-emitter/instance')

export default {
  props: {
    eventToEdit: {
      type: Object,
      default: () => null
    }
  },
  data: function () {
    return {
      name: null,
      createdOn: null,
      formState: {
        name: null,
        createdOn: null
      },
      errorMessage: null
    }
  },
  computed: {
    isEdit: function () {
      return this.eventToEdit !== null
    }
  },
  methods: {
    onSubmit: function () {
      this.formValidated = true

      this.formState = {
        name: this.name !== null && this.name.length > 0 && this.name.length < 255
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
                this.errorMessage = 'formErrorParticipantMissingParameter'
                break
              case 404:
                this.errorMessage = 'formErrorParticipantNotFound'
                break
            }
          }
        }

        if (this.isEdit) {
          apiPatchEvent({
            id: this.eventToEdit.eventId,
            name: this.name,
            createdOn: this.createdOn
          }, resultHandler, errorHandler)
        } else {
          apiPostEvent({
            name: this.name,
            createdOn: this.createdOn
          }, resultHandler, errorHandler)
        }
      }
    },
    /**
     * Shows the modal dialog and resets it to its initial state
     */
    show: function () {
      if (this.eventToEdit) {
        this.name = this.eventToEdit.eventName
        this.createdOn = this.eventToEdit.eventCreatedOn
      } else {
        this.name = null
        this.createdOn = new Date()
      }
      this.errorMessage = null
      this.formValidated = null
      this.formState = {
        name: null
      }
      this.$nextTick(() => this.$refs.addEditEventModal.show())
    },
    /**
     * Hides the modal dialog
     */
    hide: function () {
      this.$nextTick(() => this.$refs.addEditEventModal.hide())
    }
  }
}
</script>

<style>
</style>

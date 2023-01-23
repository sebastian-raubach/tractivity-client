<template>
  <b-modal :ok-title="$t('buttonSave')"
           :cancel-title="$t('buttonCancel')"
           :title="isEdit ? $t('modalTitleEditParticipant') : $t('modalTitleAddParticipant')"
           size="md"
           @ok.prevent="onSubmit"
           ref="addEditParticipantModal">
    <b-form @submit.prevent="onSubmit" novalidate>
      <b-form-group :label="$t('formLabelParticipantName')" label-for="username">
        <b-form-input id="username" v-model="name" />
      </b-form-group>
      <b-form-group :label="$t('formLabelParticipantDob')" label-for="dob">
        <b-form-datepicker :start-weekday="1" :value-as-date="true" id="dob" v-model="dob" />
      </b-form-group>
      <b-form-group :label="$t('formLabelParticipantGender')" label-for="gender">
        <b-form-radio-group button-variant="outline-light" :options="genders" v-model="gender" buttons />
      </b-form-group>

      <p class="text-danger" v-if="errorMessage">{{ $t(errorMessage) }}</p>
    </b-form>
  </b-modal>
</template>

<script>
import { apiPatchParticipant, apiPostParticipant } from '@/plugins/api/participant'

const emitter = require('tiny-emitter/instance')

export default {
  props: {
    participantToEdit: {
      type: Object,
      default: () => null
    }
  },
  data: function () {
    return {
      name: null,
      dob: null,
      gender: null,
      icon: null,
      formState: {
        name: null,
        dob: null,
        gender: null
      },
      errorMessage: null
    }
  },
  computed: {
    isEdit: function () {
      return this.participantToEdit !== null
    },
    genders: function () {
      return [{
        text: this.$t('formSelectGenderFemale'),
        value: 'female'
      },
      {
        text: this.$t('formSelectGenderMale'),
        value: 'male'
      },
      {
        text: this.$t('formSelectGenderOther'),
        value: 'other'
      }]
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
                this.errorMessage = 'formErrorMissingParameter'
                break
              case 404:
                this.errorMessage = 'formErrorNotFound'
                break
            }
          }
        }

        if (this.isEdit) {
          apiPatchParticipant({
            id: this.participantToEdit.participantId,
            name: this.name,
            dob: this.dob,
            gender: this.gender
          }, resultHandler, errorHandler)
        } else {
          apiPostParticipant({
            name: this.name,
            dob: this.dob,
            gender: this.gender
          }, resultHandler, errorHandler)
        }
      }
    },
    /**
     * Shows the modal dialog and resets it to its initial state
     */
    show: function () {
      if (this.participantToEdit) {
        this.name = this.participantToEdit.participantName
        this.dob = this.participantToEdit.participantDob
        this.gender = this.participantToEdit.participantGender
        this.icon = null
      } else {
        this.name = null
        this.dob = null
        this.gender = 'female'
        this.icon = null
      }
      this.errorMessage = null
      this.formValidated = null
      this.formState = {
        name: null,
        dob: null,
        gender: null
      }
      this.$nextTick(() => this.$refs.addEditParticipantModal.show())
    },
    /**
     * Hides the modal dialog
     */
    hide: function () {
      this.$nextTick(() => this.$refs.addEditParticipantModal.hide())
    }
  }
}
</script>

<style>
</style>

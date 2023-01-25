<template>
  <b-modal :ok-title="$t('buttonSave')"
           :cancel-title="$t('buttonCancel')"
           :title="$t('modalTitleAddMeasureType')"
           size="md"
           @ok.prevent="onSubmit"
           ref="addMeasureTypeModal">
    <b-form @submit.prevent="onSubmit" novalidate>
      <b-form-group :label="$t('formLabelMeasureTypeName')" label-for="name">
        <b-form-input id="name" v-model="name" />
      </b-form-group>

      <b-form-group :label="$t('formLabelMeasureType')" label-for="type">
        <b-form-select :options="measureTypes" v-model="measureType" :disabled="isEdit" />
      </b-form-group>

      <b-row>
        <b-col cols=12 md=6>
          <b-form-group :label="$t('formLabelMeasureMinValue')" label-for="min-value" v-if="measureType === 'decimal' || measureType === 'integer'">
            <b-form-input type="number" id="min-value" v-model="minValue" :disabled="isEdit" />
          </b-form-group>
        </b-col>
        <b-col cols=12 md=6>
          <b-form-group :label="$t('formLabelMeasureMaxValue')" label-for="max-value" v-if="measureType === 'decimal' || measureType === 'integer'">
            <b-form-input type="number" id="max-value" v-model="maxValue" :disabled="isEdit" />
          </b-form-group>
        </b-col>
        <b-col cols=12 md=6>
          <b-form-group :label="$t('formLabelMeasureMinDate')" label-for="min-date" v-if="measureType === 'date'">
            <b-form-datepicker :value-as-date="true" :start-weekday="1" id="min-date" v-model="minDate" :disabled="isEdit" />
          </b-form-group>
        </b-col>
        <b-col cols=12 md=6>
          <b-form-group :label="$t('formLabelMeasureMaxDate')" label-for="max-date" v-if="measureType === 'date'">
            <b-form-datepicker :value-as-date="true" :start-weekday="1" id="max-date" v-model="maxDate" :disabled="isEdit" />
          </b-form-group>
        </b-col>
      </b-row>

      <b-form-group :label="$t('formLabelMeasureCategories')" label-for="categories" v-if="measureType === 'single_cat' || measureType === 'multi_cat'">
        <b-form-input id="categories" v-model="categories" :disabled="isEdit" />
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
import { apiPostMeasure, apiPatchMeasure } from '@/plugins/api/measure'
const emitter = require('tiny-emitter/instance')

export default {
  props: {
    measureTypeToEdit: {
      type: Object,
      default: () => null
    }
  },
  data: function () {
    return {
      name: null,
      imageFile: null,
      imageData: null,
      measureType: null,
      minValue: null,
      maxValue: null,
      minDate: null,
      maxDate: null,
      categories: null,
      formState: {
        name: null,
        measureType: null
      },
      errorMessage: null
    }
  },
  computed: {
    isEdit: function () {
      return this.measureTypeToEdit !== null
    },
    measureTypes: function () {
      return [{
        value: 'truth_value',
        text: this.$t('formSelectOptionMeasureTypeBoolean')
      }, {
        value: 'integer',
        text: this.$t('formSelectOptionMeasureTypeInteger')
      }, {
        value: 'decimal',
        text: this.$t('formSelectOptionMeasureTypeDecimal')
      }, {
        value: 'single_cat',
        text: this.$t('formSelectOptionMeasureTypeSingleCategory')
      }, {
        value: 'multi_cat',
        text: this.$t('formSelectOptionMeasureTypeMultiCategory')
      }, {
        value: 'date',
        text: this.$t('formSelectOptionMeasureTypeDate')
      }, {
        value: 'text',
        text: this.$t('formSelectOptionMeasureTypeText')
      }]
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
    },
    measureTypeToEdit: function () {
      this.update()
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
        name: this.name !== undefined && this.name !== null && this.name.length < 255,
        measureType: this.measureType !== undefined && this.measureType !== null
      }

      if (Object.keys(this.formState).filter(st => !this.formState[st]).length === 0) {
        emitter.emit('show-loading', true)

        const formData = new FormData()
        formData.append('image', this.imageFile)
        formData.append('name', this.name)
        if (!this.isEdit) {
          formData.append('measureType', this.measureType)
          if (this.minDate) {
            formData.append('minDate', this.minDate.toISOString().substring(0, 10))
          }
          if (this.maxDate) {
            formData.append('maxDate', this.maxDate.toISOString().substring(0, 10))
          }
          if (this.minValue !== undefined && this.minValue !== null) {
            formData.append('minValue', this.minValue)
          }
          if (this.maxValue !== undefined && this.maxValue !== null) {
            formData.append('maxValue', this.maxValue)
          }
          if (this.categories && this.categories.length > 0) {
            formData.append('categories', this.categories)
          }
        }

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
          apiPatchMeasure(this.measureTypeToEdit.id, formData, resultHandler, errorHandler)
        } else {
          apiPostMeasure(formData, resultHandler, errorHandler)
        }
      }
    },
    update: function () {
      if (this.measureTypeToEdit) {
        this.name = this.measureTypeToEdit.name
        this.measureType = this.measureTypeToEdit.type
        this.imageFile = null
        this.imageData = null
        this.minValue = this.measureTypeToEdit.restrictions ? this.measureTypeToEdit.restrictions.minValue : null
        this.maxValue = this.measureTypeToEdit.restrictions ? this.measureTypeToEdit.restrictions.maxValue : null
        this.minDate = this.measureTypeToEdit.restrictions ? this.measureTypeToEdit.restrictions.minDate : null
        this.maxDate = this.measureTypeToEdit.restrictions ? this.measureTypeToEdit.restrictions.maxDate : null
        this.categories = (this.measureTypeToEdit.restrictions && this.measureTypeToEdit.restrictions.categories) ? this.measureTypeToEdit.restrictions.categories.join(',') : null
      } else {
        this.name = null
        this.measureType = null
        this.imageFile = null
        this.imageData = null
        this.minValue = null
        this.maxValue = null
        this.minDate = null
        this.maxDate = null
        this.categories = null
      }
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

      this.$nextTick(() => this.$refs.addMeasureTypeModal.show())
    },
    /**
     * Hides the modal dialog
     */
    hide: function () {
      this.$nextTick(() => this.$refs.addMeasureTypeModal.hide())
    }
  }
}
</script>

<style scoped>
</style>

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
        <b-form-select :options="measureTypes" v-model="measureType" />
      </b-form-group>

      <b-row>
        <b-col cols=12 md=6>
          <b-form-group :label="$t('formLabelMeasureMinValue')" label-for="min-value" v-if="measureType === 'decimal' || measureType === 'integer'">
            <b-form-input type="number" id="min-value" v-model="minValue" />
          </b-form-group>
        </b-col>
        <b-col cols=12 md=6>
          <b-form-group :label="$t('formLabelMeasureMaxValue')" label-for="max-value" v-if="measureType === 'decimal' || measureType === 'integer'">
            <b-form-input type="number" id="max-value" v-model="maxValue" />
          </b-form-group>
        </b-col>
        <b-col cols=12 md=6>
          <b-form-group :label="$t('formLabelMeasureMinDate')" label-for="min-date" v-if="measureType === 'date'">
            <b-form-datepicker :value-as-date="true" :start-weekday="1" id="min-date" v-model="minDate" />
          </b-form-group>
        </b-col>
        <b-col cols=12 md=6>
          <b-form-group :label="$t('formLabelMeasureMaxDate')" label-for="max-date" v-if="measureType === 'date'">
            <b-form-datepicker :value-as-date="true" :start-weekday="1" id="max-date" v-model="maxDate" />
          </b-form-group>
        </b-col>
      </b-row>

      <b-form-group :label="$t('formLabelMeasureCategories')" label-for="categories" v-if="measureType === 'single_cat' || measureType === 'multi_cat'">
        <b-form-input id="categories" v-model="categories" />
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
import { apiPostMeasure } from '@/plugins/api/measure'
const emitter = require('tiny-emitter/instance')

export default {
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
    measureTypes: function () {
      return [{
        value: 'boolean_',
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

        apiPostMeasure(formData, () => {
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
      this.minValue = null
      this.maxValue = null
      this.minDate = null
      this.maxDate = null
      this.categories = null
      this.formState = {
        null: null
      }
      this.errorMessage = null

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

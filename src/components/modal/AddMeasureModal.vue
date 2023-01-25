<template>
  <b-modal :ok-title="$t('buttonSave')"
           :cancel-title="$t('buttonCancel')"
           :title="$t('modalTitleAddMeasure')"
           size="md"
           @ok.prevent="onSubmit"
           ref="addMeasureModal">
    <b-form @submit.prevent="onSubmit" novalidate>
      <div class="text-center" v-if="selectedMeasure">
        <CustomAvatar :id="selectedMeasure.id"
                      :name="selectedMeasure.name"
                      size="4em"
                      type="measure" />
      </div>

      <b-form-group :label="$t('formLabelMeasure')" label-for="measure">
        <b-input-group>
          <b-form-select id="measure" :options="measureOptions" v-model="selectedMeasure" />

          <b-input-group-append>
            <b-button @click="$refs.addMeasureTypeModal.show()" v-if="selectedMeasure"><BIconPencil /></b-button>
            <b-button @click="onAddMeasureTypeClicked"><BIconPlus /></b-button>
          </b-input-group-append>
        </b-input-group>
      </b-form-group>

      <b-form-group :label="$t('formLabelMeasureValue')" label-for="value" v-if="selectedMeasure">
        <b-form-checkbox switch id="value" v-model="value" v-if="selectedMeasure.type === 'truth_value'" />
        <b-form-select multiple id="value" :options="measureCategoryOptions" v-model="value" v-else-if="selectedMeasure.type === 'multi_cat'" />
        <b-form-select id="value" :options="measureCategoryOptions" v-model="value" v-else-if="selectedMeasure.type === 'single_cat'" />
        <b-form-input id="value" type="number" v-model="value" v-else-if="selectedMeasure.type === 'integer' || selectedMeasure.type === 'decimal'" />
        <b-form-datepicker id="value" :value-as-date="true" :start-weekday="1" v-model="value" v-else-if="selectedMeasure.type === 'date'" />
        <b-form-input id="value" v-model="value" v-else />
      </b-form-group>

      <p class="text-danger" v-if="errorMessage">{{ $t(errorMessage) }}</p>
    </b-form>

    <AddEditMeasureTypeModal :measureTypeToEdit="selectedMeasure" ref="addMeasureTypeModal" @change="$emit('measure-type-added')" />
  </b-modal>
</template>

<script>
import AddEditMeasureTypeModal from '@/components/modal/AddEditMeasureTypeModal'
import CustomAvatar from '@/components/util/CustomAvatar'

import { BIconPencil, BIconPlus } from 'bootstrap-vue'

export default {
  components: {
    BIconPencil,
    BIconPlus,
    AddEditMeasureTypeModal,
    CustomAvatar
  },
  props: {
    measureToEdit: {
      type: Object,
      default: () => {}
    }
  },
  data: function () {
    return {
      selectedMeasure: null,
      value: null,
      formState: {
        measureId: null,
        value: null
      },
      errorMessage: null
    }
  },
  watch: {
    selectedMeasure: function (newValue) {
      switch (newValue.type) {
        case 'truth_value':
          this.value = true
          break
        case 'single_cat':
          this.value = (newValue.restrictions && newValue.restrictions.categories && newValue.restrictions.categories.length > 0) ? newValue.restrictions.categories[0] : null
          break
        case 'multi_cat':
          this.value = []
          break
        case 'decimal':
        case 'integer':
          this.value = 0
          break
        case 'date':
          this.value = new Date()
          break
        default:
          this.value = ''
          break
      }
    }
  },
  computed: {
    measureCategoryOptions: function () {
      if (this.selectedMeasure && this.selectedMeasure.restrictions && this.selectedMeasure.restrictions.categories && (this.selectedMeasure.type === 'multi_cat' || this.selectedMeasure.type === 'single_cat')) {
        return this.selectedMeasure.restrictions.categories
      } else {
        return []
      }
    },
    measureOptions: function () {
      if (this.measures) {
        return this.measures.map(m => {
          return {
            value: m,
            text: m.name
          }
        })
      } else {
        return []
      }
    }
  },
  methods: {
    onAddMeasureTypeClicked: function () {
      this.selectedMeasure = null
      this.$nextTick(() => this.$refs.addMeasureTypeModal.show())
    },
    checkValue: function () {
      if (this.value === undefined || this.value === null) {
        return false
      } else {
        const r = this.selectedMeasure.restrictions
        switch (this.selectedMeasure.type) {
          case 'decimal':
            if (isNaN(this.value) || isNaN(parseFloat(this.value))) {
              return false
            } else {
              const floatValue = parseFloat(this.value)
              if (r) {
                if (r.minValue !== undefined && r.minValue != null) {
                  if (floatValue < r.minValue) {
                    return false
                  }
                }
                if (r.maxValue !== undefined && r.maxValue !== null) {
                  if (floatValue > r.maxValue) {
                    return false
                  }
                }
              }

              return true
            }
          case 'integer':
            if (!/^-?\d+$/.test(this.value)) {
              return false
            } else {
              if (r) {
                const intValue = parseInt(this.value)
                if (r.minValue !== undefined && r.minValue != null) {
                  if (intValue < r.minValue) {
                    return false
                  }
                }
                if (r.maxValue !== undefined && r.maxValue !== null) {
                  if (intValue > r.maxValue) {
                    return false
                  }
                }
              }

              return true
            }
          case 'single_cat':
            if (r && r.categories) {
              return r.categories.includes(this.value)
            } else {
              return false
            }
          case 'multi_cat':
            return this.value.length > 0 && this.value.filter(v => {
              if (r && r.categories) {
                return r.categories.includes(v)
              } else {
                return false
              }
            }).length === this.value.length
          case 'date':
            if (r) {
              if (r.minDate && this.value < new Date(r.minDate)) {
                return false
              }
              if (r.maxDate && this.value > new Date(r.maxDate)) {
                return false
              }
            }

            return true
        }

        return true
      }
    },
    onSubmit: function () {
      this.formValidated = true

      this.formState = {
        measureId: this.selectedMeasure !== undefined && this.selectedMeasure !== null,
        value: this.checkValue()
      }

      if (Object.keys(this.formState).filter(st => !this.formState[st]).length === 0) {
        const result = []

        if (this.selectedMeasure.type === 'multi_cat') {
          this.value.forEach(v => {
            result.push({
              measureId: this.selectedMeasure.id,
              measureName: this.selectedMeasure.name,
              measuredValue: v
            })
          })
        } else if (this.selectedMeasure.type === 'date') {
          result.push({
            measureId: this.selectedMeasure.id,
            measureName: this.selectedMeasure.name,
            measuredValue: this.value.toISOString().substring(0, 10)
          })
        } else {
          result.push({
            measureId: this.selectedMeasure.id,
            measureName: this.selectedMeasure.name,
            measuredValue: `${this.value}`
          })
        }

        this.$emit('measures-added', result)
        this.hide()
      }
    },
    /**
     * Shows the modal dialog and resets it to its initial state
     */
    show: function () {
      this.measureId = null
      this.value = null
      this.errorMessage = null
      this.formValidated = null
      this.selectedMeasure = null
      this.formState = {
        measureId: null,
        value: null
      }

      if (this.measures && this.measures.length > 0) {
        this.selectedMeasure = this.measures[0]
      }

      this.$nextTick(() => this.$refs.addMeasureModal.show())
    },
    /**
     * Hides the modal dialog
     */
    hide: function () {
      this.$nextTick(() => this.$refs.addMeasureModal.hide())
    }
  }
}
</script>

<style>
</style>

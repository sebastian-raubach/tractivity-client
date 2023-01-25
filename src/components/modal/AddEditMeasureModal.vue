<template>
  <b-modal :ok-title="$t('buttonSave')"
           :cancel-title="$t('buttonCancel')"
           :title="$t('modalTitleAddLocation')"
           size="lg"
           @shown="updateMeasures"
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
          <b-form-select id="measure" :disabled="isEdit" :options="measureOptions" :state="formState.measureId" v-model="selectedMeasure" />

          <b-input-group-append>
            <b-button @click="$refs.addMeasureTypeModal.show()" v-if="selectedMeasure"><BIconPencil /></b-button>
            <b-button @click="onAddMeasureTypeClicked" v-if="!isEdit"><BIconPlus /></b-button>
          </b-input-group-append>
        </b-input-group>
      </b-form-group>

      <b-form-group :label="$t('formLabelMeasureValue')" label-for="value" v-if="selectedMeasure">
        <b-form-checkbox switch id="value" v-model="measuredValue" :state="formState.measuredValue" v-if="selectedMeasure.type === 'truth_value'" />
        <b-form-select :multiple="!isEdit" id="value" :options="measureCategoryOptions" v-model="measuredValue" :state="formState.measuredValue" v-else-if="selectedMeasure.type === 'multi_cat'" />
        <b-form-select id="value" :options="measureCategoryOptions" v-model="measuredValue" :state="formState.measuredValue" v-else-if="selectedMeasure.type === 'single_cat'" />
        <b-form-input id="value" type="number" v-model="measuredValue" :state="formState.measuredValue" v-else-if="selectedMeasure.type === 'integer' || selectedMeasure.type === 'decimal'" />
        <b-form-datepicker id="value" :value-as-date="true" :start-weekday="1" v-model="measuredValue" :state="formState.measuredValue" v-else-if="selectedMeasure.type === 'date'" />
        <b-form-input id="value" v-model="measuredValue" :state="formState.measuredValue" v-else />
      </b-form-group>

      <p class="text-danger" v-if="errorMessage">{{ $t(errorMessage) }}</p>
    </b-form>

    <AddEditMeasureTypeModal :measureTypeToEdit="selectedMeasure" ref="addMeasureTypeModal" @change="updateMeasures" />
  </b-modal>
</template>

<script>
import CustomAvatar from '@/components/util/CustomAvatar'
import AddEditMeasureTypeModal from '@/components/modal/AddEditMeasureTypeModal'

import { apiGetMeasures, apiPostParticipantMeasure, apiPatchParticipantMeasure } from '@/plugins/api/measure'

import { BIconPencil, BIconPlus } from 'bootstrap-vue'

const emitter = require('tiny-emitter/instance')

export default {
  components: {
    BIconPencil,
    BIconPlus,
    CustomAvatar,
    AddEditMeasureTypeModal
  },
  props: {
    measureToEdit: {
      type: Object,
      default: () => null
    },
    activityId: {
      type: Number,
      default: null
    },
    participantId: {
      type: Number,
      default: null
    }
  },
  data: function () {
    return {
      measureId: null,
      measuredValue: null,
      measures: null,
      selectedMeasure: null,
      formState: {
        measureId: null,
        measuredValue: null
      },
      errorMessage: null
    }
  },
  watch: {
    measureToEdit: function () {
      this.update()
    },
    selectedMeasure: function (newValue) {
      if (newValue) {
        this.measureId = newValue.id
        if (newValue.type === 'multi_cat') {
          this.measuredValue = []
        } else {
          this.measuredValue = null
        }
      } else {
        this.measureId = null
        this.measuredValue = null
      }
    }
  },
  computed: {
    isEdit: function () {
      return this.measureToEdit !== null
    },
    selectedMeasureDummy: function () {
      if (this.selectedMeasure) {
        return {
          id: this.selectedMeasure.measureId,
          name: this.selectedMeasure.measureName,
          type: this.selectedMeasure.measureType,
          restrictions: this.selectedMeasure.measureRestrictions ? JSON.parse(JSON.stringify(this.selectedMeasure.measureRestrictions)) : null
        }
      } else {
        return null
      }
    },
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
    updateMeasures: function () {
      apiGetMeasures(result => {
        this.measures = result

        if (this.measureToEdit) {
          this.selectedMeasure = this.measures.find(m => m.id === this.measureToEdit.measureId)
        } else {
          this.selectedMeasure = null
        }
      })
    },
    checkValue: function () {
      if (this.measuredValue === undefined || this.measuredValue === null) {
        return false
      } else {
        const r = this.selectedMeasure.restrictions
        const type = this.isEdit ? (this.selectedMeasure.type === 'multi_cat' ? 'single_cat' : this.selectedMeasure.type) : this.selectedMeasure.type
        switch (type) {
          case 'decimal':
            if (isNaN(this.measuredValue) || isNaN(parseFloat(this.measuredValue))) {
              return false
            } else {
              const floatValue = parseFloat(this.measuredValue)
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
            if (!/^-?\d+$/.test(this.measuredValue)) {
              return false
            } else {
              if (r) {
                const intValue = parseInt(this.measuredValue)
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
              return r.categories.includes(this.measuredValue)
            } else {
              return false
            }
          case 'multi_cat':
            return this.measuredValue.length > 0 && this.measuredValue.filter(v => {
              if (r && r.categories) {
                return r.categories.includes(v)
              } else {
                return false
              }
            }).length === this.measuredValue.length
          case 'date':
            if (r) {
              if (r.minDate && this.measuredValue < new Date(r.minDate)) {
                return false
              }
              if (r.maxDate && this.measuredValue > new Date(r.maxDate)) {
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
        measureId: this.measureId !== undefined && this.measureId !== null,
        measuredValue: this.checkValue()
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
          apiPatchParticipantMeasure(this.measureToEdit.activityMeasureId, {
            activityMeasureId: this.measureToEdit.activityMeasureId,
            measureId: this.measureToEdit.measureId,
            measureType: this.measureToEdit.measureType,
            measuredValue: this.measuredValue
          }, resultHandler, errorHandler)
        } else {
          if (this.selectedMeasure.type === 'multi_cat') {
            apiPostParticipantMeasure(this.activityId, this.participantId, this.measuredValue.map(mv => {
              return {
                measureId: this.selectedMeasure.id,
                measureType: this.selectedMeasure.type,
                measuredValue: mv
              }
            }), resultHandler, errorHandler)
          } else {
            apiPostParticipantMeasure(this.activityId, this.participantId, [{
              measureId: this.selectedMeasure.id,
              measureType: this.selectedMeasure.type,
              measuredValue: this.measuredValue
            }], resultHandler, errorHandler)
          }
        }
      }
    },
    update: function () {
      this.selectedMeasure = null

      if (this.measureToEdit) {
        this.measureId = this.measureToEdit.measureId
        this.measureType = this.measureToEdit.measureType
        this.measuredValue = this.measureToEdit.measuredValue
      } else {
        this.measureId = null
        this.measureType = null
        this.measuredValue = null
      }

      this.errorMessage = null
      this.formValidated = null

      this.formState = {
        measureId: null,
        measuredValue: null
      }
    },
    /**
     * Shows the modal dialog and resets it to its initial state
     */
    show: function () {
      this.update()

      this.$nextTick(() => this.$refs.addMeasureModal.show())
    },
    /**
     * Hides the modal dialog
     */
    hide: function () {
      this.measureId = null
      this.measureType = null
      this.selectedMeasure = null
      this.measuredValue = null
      this.$nextTick(() => this.$refs.addMeasureModal.hide())
    }
  }
}
</script>

<style scoped>
</style>

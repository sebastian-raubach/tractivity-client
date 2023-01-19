<template>
  <b-modal :ok-title="$t('buttonSave')"
           :cancel-title="$t('buttonCancel')"
           :title="$t('modalTitleAddLocation')"
           size="lg"
           @shown="invalidateSize"
           @ok.prevent="onSubmit"
           ref="addLocationModal">
    <b-form @submit.prevent="onSubmit" novalidate>
      <b-row>
        <b-col cols=12 md=6>
          <b-form-group :label="$t('formLabelLocationName')" label-for="name">
            <b-form-input id="name" v-model="name" />
          </b-form-group>
        </b-col>
        <b-col cols=12 md=6>
          <b-form-group :label="$t('formLabelLocationElevation')" label-for="elevation">
            <b-form-input id="elevation" type="number" v-model="elevation" />
          </b-form-group>
        </b-col>
        <b-col cols=12 md=6>
          <b-form-group :label="$t('formLabelLocationLatitude')" label-for="latitude">
            <b-form-input id="latitude" type="number" v-model="latitude" readonly />
          </b-form-group>
        </b-col>
        <b-col cols=12 md=6>
          <b-form-group :label="$t('formLabelLocationLongitude')" label-for="longitude">
            <b-form-input id="longitude" type="number" v-model="longitude" readonly />
          </b-form-group>
        </b-col>
      </b-row>

      <div id="map" class="map" />

      <p class="text-danger" v-if="errorMessage">{{ $t(errorMessage) }}</p>
    </b-form>
  </b-modal>
</template>

<script>
import { apiPostLocation } from '@/plugins/api/location'

import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const emitter = require('tiny-emitter/instance')

export default {
  data: function () {
    return {
      name: null,
      latitude: null,
      longitude: null,
      elevation: null,
      formState: {
        name: null
      },
      errorMessage: null
    }
  },
  methods: {
    invalidateSize: function () {
      const map = L.map('map').setView([56.46, -2.99], 6)

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map)

      map.on('click', e => {
        if (e.latlng) {
          this.latitude = e.latlng.lat
          this.longitude = e.latlng.lng
        }
      })
    },
    onSubmit: function () {
      this.formValidated = true

      this.formState = {
        name: this.name !== undefined && this.name !== null && this.name.length < 255
      }

      if (Object.keys(this.formState).filter(st => !this.formState[st]).length === 0) {
        emitter.emit('show-loading', true)

        apiPostLocation({
          name: this.name,
          latitude: this.latitude,
          longitude: this.longitude,
          elevation: this.elevation
        }, () => {
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

      this.$nextTick(() => this.$refs.addLocationModal.show())
    },
    /**
     * Hides the modal dialog
     */
    hide: function () {
      this.$nextTick(() => this.$refs.addLocationModal.hide())
    }
  }
}
</script>

<style scoped>
.map {
  height: 50vh;
}
</style>

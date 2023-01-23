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
import { apiPostLocation, apiPatchLocation } from '@/plugins/api/location'

import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Set the leaflet marker icon
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
})

const emitter = require('tiny-emitter/instance')

let marker

export default {
  props: {
    locationToEdit: {
      type: Object,
      default: () => null
    }
  },
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
  watch: {
    locationToEdit: function () {
      this.update()
    }
  },
  computed: {
    isEdit: function () {
      return this.locationToEdit !== null
    }
  },
  methods: {
    invalidateSize: function () {
      if (marker) {
        marker.remove()
        marker = null
      }

      const map = L.map('map').setView([56.46, -2.99], 6)

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map)

      map.on('click', e => {
        if (e.latlng) {
          this.latitude = e.latlng.lat
          this.longitude = e.latlng.lng

          if (marker) {
            marker.setLatLng(L.latLng(e.latlng.lat, e.latlng.lng))
          } else {
            marker = L.marker([e.latlng.lat, e.latlng.lng])
            marker.addTo(map)
          }
        }
      })

      if (this.latitude && this.longitude) {
        marker = L.marker([this.latitude, this.longitude])
        marker.addTo(map)
      }
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

        if (this.isEdit) {
          apiPatchLocation({
            id: this.locationToEdit.id,
            name: this.name,
            latitude: this.latitude,
            longitude: this.longitude,
            elevation: this.elevation
          }, resultHandler, errorHandler)
        } else {
          apiPostLocation({
            name: this.name,
            latitude: this.latitude,
            longitude: this.longitude,
            elevation: this.elevation
          }, resultHandler, errorHandler)
        }
      }
    },
    update: function () {
      if (this.locationToEdit) {
        this.name = this.locationToEdit.name
        this.latitude = this.locationToEdit.latitude
        this.longitude = this.locationToEdit.longitude
        this.elevation = this.locationToEdit.elevation
      } else {
        this.name = null
        this.latitude = null
        this.longitude = null
        this.elevation = null
      }

      this.errorMessage = null
      this.formValidated = null

      this.formState = {
        name: null
      }
    },
    /**
     * Shows the modal dialog and resets it to its initial state
     */
    show: function () {
      this.update()

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
.map:hover {
  cursor: crosshair;
}
</style>

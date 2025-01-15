<template>
  <b-modal :ok-title="$t('buttonSave')"
           :cancel-title="$t('buttonCancel')"
           :title="isEdit ? $t('modalTitleEditActivity') : $t('modalTitleAddActivity')"
           size="xl"
           @ok.prevent="onSubmit"
           ref="addEditActivityModal">
    <b-form @submit.prevent="onSubmit" novalidate>
      <b-row>
        <b-col cols=12 md=6>
          <b-form-group :label="$t('formLabelEvent')" label-for="activity-event">
            <b-input-group>
              <b-form-input disabled id="activity-event" :value="eventDisplay" :state="formState.eventId" />

              <b-input-group-append>
                <b-button @click="$refs.eventSelectionModal.show()"><BIconBookmarkStar /> </b-button>
              </b-input-group-append>
            </b-input-group>
          </b-form-group>
        </b-col>
        <b-col cols=12 md=6>
          <b-form-group :label="$t('formLabelActivityType')" label-for="activity-type">
            <b-input-group>
              <b-form-select id="activity-type" :options="activityTypeOptions" v-model="activityTypeId" :state="formState.activityTypeId" />

              <b-input-group-append>
                <b-button @click="$refs.activityTypeModal.show()" v-if="activityTypeId"><BIconPencil /> </b-button>
                <b-button @click="onAddActivityTypeClicked"><BIconPlus /> </b-button>
              </b-input-group-append>
            </b-input-group>
          </b-form-group>
        </b-col>
        <b-col cols=12 md=6>
          <b-form-group :label="$t('formLabelLocation')" label-for="location">
            <b-input-group>
              <b-form-select id="location" :options="locationOptions" v-model="locationId" :state="formState.locationId" />

              <b-input-group-append>
                <b-button @click="$refs.locationModal.show()" v-if="locationId"><BIconPencil /> </b-button>
                <b-button @click="onAddLocationClicked"><BIconPlus /> </b-button>
              </b-input-group-append>
            </b-input-group>
          </b-form-group>
        </b-col>
        <b-col cols=12 md=6>
          <b-form-group :label="$t('formLabelActivityDate')" label-for="activity-date">
            <b-input-group>
              <b-form-datepicker id="activity-date" :start-weekday="1" :value-as-date="true" v-model="createdOn" />
              <b-input-group-append>
                <b-button @click="setToday"><BIconCalendarDate /></b-button>
              </b-input-group-append>
            </b-input-group>
          </b-form-group>
        </b-col>
        <b-col cols=12>
          <b-form-group :label="$t('formLabelParticipants')" label-for="participants" :state="formState.participants">
            <b-list-group v-if="participants && participants.length > 0" id="participants">
              <b-list-group-item :variant="(formState.participants === false && !atLeastOneParticipantSelected) ? 'danger' : null" v-for="(participant, pi) in participants" :key="`participant-selection-${participant.participantId}`" :active="participant.selected" class="d-flex align-items-center" href="#" @click.prevent="onParticipantSelected(pi)">
                <b-form-checkbox v-model="participant.selected" />
                <CustomAvatar :id="participant.participantId"
                              :name="participant.participantName"
                              type="participant"
                              class="mx-2" />
                <span>{{ participant.participantName }}</span>
              </b-list-group-item>
            </b-list-group>
            <b-button @click="$refs.participantModal.show()">{{ $t('buttonAddParticipant') }}</b-button>
          </b-form-group>
        </b-col>
      </b-row>

      <p class="text-danger" v-if="errorMessage">{{ $t(errorMessage) }}</p>
    </b-form>

    <EventSelectionModal ref="eventSelectionModal" @event-selected="selectedEvent => { event = selectedEvent }" />
    <AddEditParticipantModal ref="participantModal" @change="updateParticipants" />
    <!-- <AddMeasureModal ref="measureModal" :measures="measureTypes" @measures-added="addMeasureValues" @measure-type-added="updateMeasures" /> -->
    <AddEditLocationModal :locationToEdit="selectedLocation" ref="locationModal" @change="updateLocations" />
    <AddEditActivityTypeModal :activityTypeToEdit="selectedActivityType" ref="activityTypeModal" @change="updateActivityTypes" />
  </b-modal>
</template>

<script>
import Vue from 'vue'

import EventSelectionModal from '@/components/modal/EventSelectionModal'
import AddEditParticipantModal from '@/components/modal/AddEditParticipantModal'
// import AddMeasureModal from '@/components/modal/AddMeasureModal'
import AddEditLocationModal from '@/components/modal/AddEditLocationModal'
import AddEditActivityTypeModal from '@/components/modal/AddEditActivityTypeModal'
import CustomAvatar from '@/components/util/CustomAvatar'

import { apiGetLocations } from '@/plugins/api/location'
import { apiGetActivityTypes, apiPostActivity } from '@/plugins/api/activity'
import { apiGetEvent } from '@/plugins/api/event'

import { BIconBookmarkStar, BIconPencil, BIconPlus, BIconCalendarDate } from 'bootstrap-vue'
import { apiPostParticipantTable } from '@/plugins/api/participant'
import { MAX_JAVA_INTEGER } from '@/plugins/api/base'

const emitter = require('tiny-emitter/instance')

export default {
  components: {
    BIconBookmarkStar,
    BIconPlus,
    BIconPencil,
    BIconCalendarDate,
    AddEditActivityTypeModal,
    AddEditLocationModal,
    CustomAvatar,
    EventSelectionModal,
    AddEditParticipantModal
  },
  props: {
    activityToEdit: {
      type: Object,
      default: () => null
    },
    eventIdToSelect: {
      type: Number,
      default: null
    },
    preferredLocation: {
      type: Number,
      default: null
    }
  },
  data: function () {
    return {
      activityTypeId: null,
      locationId: null,
      eventId: null,
      event: null,
      createdOn: new Date(),
      formState: {
        activityTypeId: null,
        locationId: null,
        eventId: null,
        participants: null
      },
      errorMessage: null,
      activityTypes: [],
      participants: [],
      locations: [],
      selectedParticipant: null
    }
  },
  watch: {
    event: function (newValue) {
      if (newValue) {
        this.eventId = newValue.eventId
        this.createdOn = newValue.latestActivity || newValue.eventCreatedOn
      } else {
        this.eventId = null
        this.createdOn = new Date()
      }
    }
  },
  computed: {
    atLeastOneParticipantSelected: function () {
      return this.participants.some(p => p.selected)
    },
    selectedActivityType: function () {
      if (this.activityTypeId && this.activityTypes) {
        return this.activityTypes.find(at => at.id === this.activityTypeId)
      } else {
        return null
      }
    },
    selectedLocation: function () {
      if (this.locationId && this.locations) {
        return this.locations.find(l => l.id === this.locationId)
      } else {
        return null
      }
    },
    selectedParticipants: function () {
      if (this.participants) {
        return this.participants.filter(p => p.selected)
      } else {
        return []
      }
    },
    isEdit: function () {
      return this.activityToEdit !== null
    },
    eventDisplay: function () {
      if (this.event) {
        return `${this.event.eventName} - ${new Date(this.event.eventCreatedOn).toLocaleDateString()}`
      } else {
        return this.$t('formPlaceholderEvent')
      }
    },
    locationOptions: function () {
      if (this.locations) {
        return this.locations.map(l => {
          return {
            value: l.id,
            text: l.name
          }
        })
      } else {
        return []
      }
    },
    activityTypeOptions: function () {
      if (this.activityTypes) {
        return this.activityTypes.map(at => {
          return {
            value: at.id,
            text: at.name
          }
        })
      } else {
        return []
      }
    }
  },
  methods: {
    onParticipantSelected: function (index) {
      this.participants[index].selected = !this.participants[index].selected
    },
    onAddActivityTypeClicked: function () {
      this.activityTypeId = null

      this.$nextTick(() => this.$refs.activityTypeModal.show())
    },
    onAddLocationClicked: function () {
      this.locationId = null

      this.$nextTick(() => this.$refs.locationModal.show())
    },
    onSubmit: function () {
      this.formValidated = true

      const sp = this.participants.filter(p => p.selected)

      this.formState = {
        activityTypeId: this.activityTypeId !== undefined && this.activityTypeId !== null,
        locationId: this.locationId !== undefined && this.locationId !== null,
        eventId: this.eventId !== undefined && this.eventId !== null,
        participants: sp && sp.length > 0
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
          // TODO
          // apiPatchActivity({
          // }, resultHandler, errorHandler)
        } else {
          apiPostActivity({
            locationId: this.locationId,
            eventId: this.eventId,
            activityTypeId: this.activityTypeId,
            createdOn: this.createdOn,
            participantIds: sp.map(p => p.participantId)
          }, resultHandler, errorHandler)
        }
      }
    },
    update: function () {
      this.updateActivityTypes()
      this.updateParticipants()
      this.updateLocations()

      if (this.eventId) {
        apiGetEvent(this.eventId, result => {
          this.event = result
        })
      } else {
        this.event = null
      }
    },
    updateActivityTypes: function () {
      apiGetActivityTypes(result => {
        this.activityTypes = result
        if (this.activityTypeId === null && result.length > 0) {
          const sorted = result.concat().sort((a, b) => b.count - a.count)

          this.activityTypeId = sorted[0].id
        }
      })
    },
    updateLocations: function () {
      apiGetLocations(result => {
        this.locations = result

        if (result.length > 0) {
          if (this.preferredLocation !== undefined && this.preferredLocation !== null) {
            this.locationId = this.preferredLocation
          } else {
            this.locationId = result[0].id
          }
        }
      })
    },
    setToday: function () {
      this.createdOn = new Date().toISOString()
    },
    updateParticipants: function () {
      apiPostParticipantTable({
        page: 1,
        limit: MAX_JAVA_INTEGER,
        orderBy: 'participantName',
        ascending: 1
      }, result => {
        this.participants = result.data

        this.participants.forEach(p => {
          Vue.set(p, 'selected', false)
        })
      })
    },
    /**
     * Shows the modal dialog and resets it to its initial state
     */
    show: function () {
      if (this.activityToEdit) {
        this.activityTypeId = this.activityToEdit.activityTypeId
        this.eventId = this.activityToEdit.eventId
        this.locationId = this.activityToEdit.locationId
        this.createdOn = this.activityToEdit.activityCreatedOn
      } else {
        this.activityTypeId = null
        this.eventId = this.eventIdToSelect
        this.locationId = this.preferredLocation
        this.createdOn = new Date()
      }
      this.errorMessage = null
      this.formValidated = null
      this.formState = {
        activityTypeId: null,
        locationId: null,
        eventId: null,
        participants: null
      }
      this.$nextTick(() => this.$refs.addEditActivityModal.show())

      this.update()
    },
    /**
     * Hides the modal dialog
     */
    hide: function () {
      this.$nextTick(() => this.$refs.addEditActivityModal.hide())
    }
  }
}
</script>

<style>
</style>

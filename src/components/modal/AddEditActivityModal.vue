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
              <b-form-input disabled id="activity-event" :value="eventDisplay" />

              <b-input-group-append>
                <b-button @click="$refs.eventSelectionModal.show()"><BIconBookmarkStar /> </b-button>
              </b-input-group-append>
            </b-input-group>
          </b-form-group>
        </b-col>
        <b-col cols=12 md=6>
          <b-form-group :label="$t('formLabelActivityType')" label-for="activity-type">
            <b-input-group>
              <b-form-select id="activity-type" :options="activityTypeOptions" v-model="activityTypeId" />

              <b-input-group-append>
                <b-button @click="$refs.activityTypeModal.show()"><BIconJournalAlbum /> </b-button>
              </b-input-group-append>
            </b-input-group>
          </b-form-group>
        </b-col>
        <b-col cols=12 md=6>
          <b-form-group :label="$t('formLabelLocation')" label-for="location">
            <b-input-group>
              <b-form-select id="location" :options="locationOptions" v-model="locationId" />

              <b-input-group-append>
                <b-button @click="$refs.locationModal.show()"><BIconPinMap /> </b-button>
              </b-input-group-append>
            </b-input-group>
          </b-form-group>
        </b-col>
        <b-col cols=12 md=6>
          <b-form-group :label="$t('formLabelActivityDate')" label-for="activity-date">
            <b-form-datepicker id="activity-date" :start-weekday="1" :value-as-date="true" v-model="createdOn" />
          </b-form-group>
        </b-col>
        <b-col cols=12>
          <b-form-group :label="$t('formLabelParticipants')" label-for="participants">
            <b-list-group v-if="participants && participants.length > 0" id="participants">
              <b-list-group-item v-for="participant in participants" :key="`participant-selection-${participant.participantId}`" :active="participant.selected" class="d-flex align-items-center" href="#" @click.prevent="e => { participant.selected = !participant.selected }">
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

        <b-col cols=12 md=6 v-for="participant in selectedParticipants" :key="`participant-entry-${participant.participantId}`">
          <ParticipantMeasures :participantMeasures="participant.participantMeasures" />
          <b-button @click="addMeasure(participant)">{{ $t('buttonAddMeasure') }}</b-button>
        </b-col>
      </b-row>

      <p class="text-danger" v-if="errorMessage">{{ $t(errorMessage) }}</p>
    </b-form>

    <EventSelectionModal ref="eventSelectionModal" @event-selected="selectedEvent => { event = selectedEvent }" />
    <AddEditParticipantModal ref="participantModal" @change="updateParticipants" />
    <AddMeasureModal ref="measureModal" :measures="measureTypes" @measures-added="addMeasureValues" @measure-type-added="updateMeasures" />
    <AddLocationModal ref="locationModal" @change="updateLocations" />
    <addActivityTypeModal ref="activityTypeModal" @change="updateActivityTypes" />
  </b-modal>
</template>

<script>
import Vue from 'vue'

import EventSelectionModal from '@/components/modal/EventSelectionModal'
import AddEditParticipantModal from '@/components/modal/AddEditParticipantModal'
import AddMeasureModal from '@/components/modal/AddMeasureModal'
import AddLocationModal from '@/components/modal/AddLocationModal'
import AddActivityTypeModal from '@/components/modal/AddActivityTypeModal'
import ParticipantMeasures from '@/components/participant/ParticipantMeasures'
import CustomAvatar from '@/components/util/CustomAvatar'

import { apiGetLocations } from '@/plugins/api/location'
import { apiGetActivityTypes } from '@/plugins/api/activity'
import { apiGetMeasures } from '@/plugins/api/measure'
import { apiGetEvent } from '@/plugins/api/event'

import { BIconBookmarkStar, BIconJournalAlbum, BIconPinMap } from 'bootstrap-vue'
import { apiPostParticipantTable } from '@/plugins/api/participant'
import { MAX_JAVA_INTEGER } from '@/plugins/api/base'

export default {
  components: {
    BIconBookmarkStar,
    BIconJournalAlbum,
    BIconPinMap,
    AddActivityTypeModal,
    AddLocationModal,
    AddMeasureModal,
    CustomAvatar,
    EventSelectionModal,
    AddEditParticipantModal,
    ParticipantMeasures
  },
  props: {
    activityToEdit: {
      type: Object,
      default: () => null
    }
  },
  data: function () {
    return {
      activityTypeId: null,
      locationId: null,
      eventId: null,
      event: null,
      measures: [],
      createdOn: new Date(),
      formState: {
        activityTypeId: null,
        locationId: null,
        eventId: null,
        measures: null
      },
      errorMessage: null,
      activityTypes: [],
      measureTypes: [],
      participants: [],
      locations: [],
      selectedParticipant: null
    }
  },
  computed: {
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
    addMeasureValues: function (measureValues) {
      if (!this.selectedParticipant.participantMeasures.participantMeasures) {
        Vue.set(this.selectedParticipant.participantMeasures, 'participantMeasures', [])
      }

      measureValues.forEach(mv => this.selectedParticipant.participantMeasures.participantMeasures.push(mv))
    },
    addMeasure: function (participant) {
      this.selectedParticipant = participant
      this.$nextTick(() => this.$refs.measureModal.show())
    },
    onSubmit: function () {
      this.formValidated = true

      this.formState = {
        activityTypeId: this.activityTypeId !== undefined && this.activityTypeId !== null,
        locationId: null,
        eventId: null,
        measures: null
      }

      if (Object.keys(this.formState).filter(st => !this.formState[st]).length === 0) {
        // emitter.emit('show-loading', true)

        // const resultHandler = () => {
        //   emitter.emit('show-loading', false)
        //   this.$emit('change')
        //   this.hide()
        // }

        // const errorHandler = {
        //   codes: [400, 404, 409],
        //   callback: e => {
        //     emitter.emit('show-loading', false)

        //     switch (e.status) {
        //       case 400:
        //         this.errorMessage = 'formErrorParticipantMissingParameter'
        //         break
        //       case 404:
        //         this.errorMessage = 'formErrorParticipantNotFound'
        //         break
        //     }
        //   }
        // }

        // if (this.isEdit) {
        //   apiPatchActivity({
        //   }, resultHandler, errorHandler)
        // } else {
        //   apiPostActivity({
        //   }, resultHandler, errorHandler)
        // }
      }
    },
    update: function () {
      this.updateActivityTypes()
      this.updateMeasures()
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
          this.activityTypeId = result[0].id
        }
      })
    },
    updateLocations: function () {
      apiGetLocations(result => {
        this.locations = result

        if (result.length > 0) {
          this.locationId = result[0].id
        }
      })
    },
    updateMeasures: function () {
      apiGetMeasures(result => {
        this.measureTypes = result
        this.measureTypes.forEach(m => {
          Vue.set(m, 'selected', false)
        })
      })
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
          Vue.set(p, 'participantMeasures', {
            participantId: p.participantId,
            participantName: p.participantName,
            participantMeasures: []
          })
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
        this.eventId = null
        this.locationId = null
        this.createdOn = new Date()
      }
      this.errorMessage = null
      this.formValidated = null
      this.formState = {
        activityTypeId: null,
        locationId: null,
        eventId: null,
        measures: null
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

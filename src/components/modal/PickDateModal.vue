<template>
  <b-modal :ok-title="$t('buttonSave')"
           :cancel-title="$t('buttonCancel')"
           :title="$t('modalTitlePickDate')"
           size="md"
           @ok.prevent="onSubmit"
           ref="pickDateModal">
    <b-form @submit.prevent="onSubmit" novalidate autocomplete="off">
      <b-form-group :label="$t('formLabelActivityDate')" label-for="activity-date">
        <b-input-group>
          <b-form-input type="date" id="activity-date" v-model="date" />
        </b-input-group>
      </b-form-group>
    </b-form>
  </b-modal>
</template>

<script>
export default {
  components: {
  },
  data: function () {
    return {
      date: new Date().toISOString().split('T')[0]
    }
  },
  methods: {
    onSubmit: function () {
      this.$emit('date-selected', this.date)
      this.hide()
    },
    /**
     * Shows the modal dialog and resets it to its initial state
     */
    show: function () {
      this.date = new Date().toISOString().split('T')[0]
      this.$nextTick(() => this.$refs.pickDateModal.show())
    },
    /**
     * Hides the modal dialog
     */
    hide: function () {
      this.$nextTick(() => this.$refs.pickDateModal.hide())
    }
  }
}
</script>

<style>
</style>

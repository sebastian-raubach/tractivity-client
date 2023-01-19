<template>
  <div>
    <h1 class="display-3">{{ $t('pageActivitiesTitle') }}</h1>
    <hr />
    <ActivityTable :getData="getData" />
  </div>
</template>

<script>
import ActivityTable from '@/components/table/ActivityTable'
import { apiPostActivityTable } from '@/plugins/api/activity'

export default {
  components: {
    ActivityTable
  },
  methods: {
    getData: function (params) {
      if (!params.orderBy) {
        params.orderBy = 'activityCreatedOn'
        params.ascending = 0
      }

      return apiPostActivityTable(params)
    }
  }
}
</script>

<style>

</style>

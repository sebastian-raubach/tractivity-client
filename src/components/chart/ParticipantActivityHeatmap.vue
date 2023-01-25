<template>
  <div ref="chart" />
</template>

<script>
import { mapGetters } from 'vuex'

import { apiPostParticipantActivityTable } from '@/plugins/api/participant'
import { MAX_JAVA_INTEGER } from '@/plugins/api/base'

const Plotly = require('plotly.js-dist-min')

let chartData = null

export default {
  props: {
    participant: {
      type: Object,
      default: () => null
    },
    year: {
      type: Number,
      default: () => new Date().getFullYear()
    },
    activityTypeId: {
      type: Number,
      default: null
    }
  },
  data: function () {
    return {
      participantActivities: [],
      colors: ['#440154', '#48186a', '#472d7b', '#424086', '#3b528b', '#33638d', '#2c728e', '#26828e', '#21918c', '#1fa088', '#28ae80', '#3fbc73', '#5ec962', '#84d44b', '#addc30', '#d8e219', '#fde725']
    }
  },
  computed: {
    ...mapGetters([
      'storeLocale'
    ]),
    months: function () {
      const format = new Intl.DateTimeFormat(this.storeLocale.replace('_', '-'), { month: 'short' }).format
      return [...Array(12).keys()].map((m) => format(new Date(this.year, m % 12, 1)))
    },
    minDate: function () {
      if (this.year) {
        return `${this.year}-01-01`
      } else {
        return null
      }
    },
    maxDate: function () {
      if (this.year) {
        return `${this.year}-12-31`
      } else {
        return null
      }
    }
  },
  watch: {
    participant: function () {
      this.update()
    },
    year: function () {
      this.update()
    },
    activityTypeId: function () {
      this.update()
    }
  },
  methods: {
    update: function () {
      const filter = [{
        column: 'activityCreatedOn',
        comparator: 'lessOrEquals',
        operator: 'and',
        values: [this.maxDate]
      }, {
        column: 'activityCreatedOn',
        comparator: 'greaterOrEquals',
        operator: 'and',
        values: [this.minDate]
      }]

      if (this.activityTypeId) {
        filter.push({
          column: 'activityTypeId',
          comparator: 'equals',
          operator: 'and',
          values: [this.activityTypeId]
        })
      }

      apiPostParticipantActivityTable(this.participant.participantId, {
        page: 1,
        limit: MAX_JAVA_INTEGER,
        filter: filter
      }, result => {
        chartData = result.data

        this.drawChart()
      })
    },
    drawChart: function () {
      Plotly.purge(this.$refs.chart)

      const z = Array.from(Array(31).keys()).map(i => new Array(12).fill(0))

      chartData.forEach(dp => {
        const date = new Date(dp.activityCreatedOn)
        const month = date.getMonth()
        const day = date.getDate()

        z[day - 1][month]++
      })

      const colorscale = this.colors.map((c, i) => [(i + 1) / (this.colors.length), c])
      colorscale.unshift([0, 'rgba(25,36,46,0.5)'])

      const traces = [{
        z: z,
        x: this.months,
        y: Array.from(Array(31).keys()).map(i => i + 1),
        type: 'heatmap',
        hoverongaps: false,
        xgap: 1,
        ygap: 1,
        colorscale: colorscale,
        hovertemplate: '%{x}. %{y}: %{z}',
        colorbar: { tickfont: { color: 'white' } }
      }]

      const monthAxis = {
        showgrid: false,
        title: { text: this.$t('chartAxisMonth'), font: { color: 'white' } },
        tickfont: { color: 'white' }
      }
      const dayAxis = {
        showgrid: false,
        tickmode: 'array',
        tickvals: Array.from(Array(31).keys()).map(i => i + 1),
        title: { text: this.$t('chartAxisDay'), font: { color: 'white' } },
        tickfont: { color: 'white' }
      }

      const layout = {
        margin: { l: 75, r: 35, t: 25, b: 75, autoexpand: true },
        height: 640,
        paper_bgcolor: 'transparent',
        plot_bgcolor: 'transparent',
        xaxis: monthAxis,
        yaxis: dayAxis
      }

      const config = {
        displayModeBar: false,
        responsive: true,
        displaylogo: false
      }

      Plotly.newPlot(this.$refs.chart, traces, layout, config)
    }
  },
  mounted: function () {
    this.update()
  }
}
</script>

<style>

</style>

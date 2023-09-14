<template>
  <div ref="chart" />
</template>

<script>
import { mapGetters } from 'vuex'

import { apiPostParticipantActivityTable } from '@/plugins/api/participant'
import { MAX_JAVA_INTEGER } from '@/plugins/api/base'

const Plotly = require('plotly.js-dist-min')

let chartData = null

const categoryColors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf']

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
    },
    colorBy: {
      type: Object,
      default: () => { return { id: -1 } }
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
    },
    colorBy: function () {
      this.drawChart()
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

      const colorscale = this.colors.map((c, i) => [(i + 1) / (this.colors.length), c])
      colorscale.unshift([0, 'rgba(25,36,46,0.5)'])

      let z
      const traces = []

      if (this.colorBy.id === -1 || this.colorBy.type === 'integer' || this.colorBy.type === 'decimal') {
        z = Array.from(Array(31).keys()).map(i => new Array(12).fill(0))
        chartData.forEach(dp => {
          const date = new Date(dp.activityCreatedOn)
          const month = date.getMonth()
          const day = date.getDate()

          if (this.colorBy.id === -1) {
            z[day - 1][month]++
          } else if (this.colorBy.type === 'integer' || this.colorBy.type === 'decimal') {
            if (dp.participantMeasures) {
              dp.participantMeasures.filter(pm => pm.participantId === this.participant.participantId).forEach(pm => {
                if (pm.participantMeasures) {
                  pm.participantMeasures.filter(ppmm => ppmm.measureId === this.colorBy.id).forEach(ppmm => {
                    z[day - 1][month] = +ppmm.measuredValue
                  })
                }
              })
            }
          }
        })

        traces.push({
          z: z,
          x: this.months,
          y: Array.from(Array(31).keys()).map(i => i + 1),
          type: 'heatmap',
          hoverongaps: false,
          xgap: 1,
          ygap: 1,
          name: '',
          colorscale: colorscale,
          hovertemplate: '%{x}. %{y}: %{z}',
          colorbar: { tickfont: { color: 'white' } }
        })
      } else {
        z = Array.from(Array(31).keys()).map(i => new Array(12).fill(NaN))
        if (this.colorBy.type === 'truth_value') {
          const truthArray = ['true', 'false']
          chartData.forEach(dp => {
            const date = new Date(dp.activityCreatedOn)
            const month = date.getMonth()
            const day = date.getDate()

            if (dp.participantMeasures) {
              dp.participantMeasures.filter(pm => pm.participantId === this.participant.participantId).forEach(pm => {
                if (pm.participantMeasures) {
                  pm.participantMeasures.filter(ppmm => ppmm.measureId === this.colorBy.id).forEach(ppmm => {
                    z[day - 1][month] = truthArray.indexOf(ppmm.measuredValue)
                  })
                }
              })
            }
          })

          traces.push({
            z: z,
            x: this.months,
            y: Array.from(Array(31).keys()).map(i => i + 1),
            type: 'heatmap',
            hoverongaps: false,
            xgap: 1,
            ygap: 1,
            name: '',
            zauto: false,
            zmin: -0.5,
            zmax: truthArray.length - 0.5,
            colorbar: {
              tickmode: 'array',
              tickvals: truthArray.map((c, i) => i),
              ticktext: truthArray,
              title: {
                side: 'right',
                font: { color: 'white' }
              },
              tickfont: { color: 'white' },
              autotick: false,
              tick0: 0,
              dtick: 1,
              nticks: truthArray.length
            },
            colorscale: truthArray.map((_, i) => {
              const l = truthArray.length
              const c = categoryColors[i % categoryColors.length]
              return [[i / l, c], [(i + 1) / l, c]]
            }).flat(),
            hovertemplate: '%{x}. %{y}: %{z}'
          })
        } else if (this.colorBy.type === 'single_cat') {
          chartData.forEach(dp => {
            const date = new Date(dp.activityCreatedOn)
            const month = date.getMonth()
            const day = date.getDate()

            if (dp.participantMeasures) {
              dp.participantMeasures.filter(pm => pm.participantId === this.participant.participantId).forEach(pm => {
                if (pm.participantMeasures) {
                  pm.participantMeasures.filter(ppmm => ppmm.measureId === this.colorBy.id).forEach(ppmm => {
                    z[day - 1][month] = this.colorBy.restrictions.categories.indexOf(ppmm.measuredValue)
                  })
                }
              })
            }
          })

          traces.push({
            z: z,
            x: this.months,
            y: Array.from(Array(31).keys()).map(i => i + 1),
            type: 'heatmap',
            hoverongaps: false,
            xgap: 1,
            ygap: 1,
            name: '',
            zauto: false,
            zmin: -0.5,
            zmax: this.colorBy.restrictions.categories.length - 0.5,
            colorbar: {
              tickmode: 'array',
              tickvals: this.colorBy.restrictions.categories.map((c, i) => i),
              ticktext: this.colorBy.restrictions.categories,
              title: {
                side: 'right',
                font: { color: 'white' }
              },
              tickfont: { color: 'white' },
              autotick: false,
              tick0: 0,
              dtick: 1,
              nticks: this.colorBy.restrictions.categories.length
            },
            colorscale: this.colorBy.restrictions.categories.map((_, i) => {
              const l = this.colorBy.restrictions.categories.length
              const c = categoryColors[i % categoryColors.length]
              return [[i / l, c], [(i + 1) / l, c]]
            }).flat(),
            hovertemplate: '%{x}. %{y}: %{z}'
          })
        }
      }

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

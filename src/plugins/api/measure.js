import { apiAxios, apiForm } from '@/plugins/api/base'

const apiGetMeasureById = (measureId, onSuccess, onError) => apiAxios({ url: `measure/${measureId}`, success: onSuccess, error: onError })

const apiGetMeasures = (onSuccess, onError) => apiAxios({ url: 'measure', success: onSuccess, error: onError })

const apiPostMeasure = (formData, onSuccess, onError) => apiForm({ url: 'measure', method: 'POST', formData: formData, success: onSuccess, error: onError })

const apiPatchMeasure = (measureId, formData, onSuccess, onError) => apiForm({ url: `measure/${measureId}`, method: 'PATCH', formData: formData, success: onSuccess, error: onError })

const apiPostParticipantMeasure = (activityId, participantId, data, onSuccess, onError) => apiAxios({ url: `participant/${participantId}/${activityId}/measure`, method: 'POST', data: data, success: onSuccess, error: onError })

const apiPatchParticipantMeasure = (participantMeasureId, data, onSuccess, onError) => apiAxios({ url: `measure/value/${participantMeasureId}`, method: 'PATCH', data: data, success: onSuccess, error: onError })

const apiDeleteParticipantMeasure = (participantMeasureId, onSuccess, onError) => apiAxios({ url: `measure/value/${participantMeasureId}`, method: 'DELETE', success: onSuccess, error: onError })

const apiGetParticipantMeasures = (activityId, participantId, onSuccess, onError) => apiAxios({ url: `participant/${participantId}/${activityId}/measure`, success: onSuccess, error: onError })

export {
  apiGetMeasureById,
  apiGetMeasures,
  apiPostMeasure,
  apiPatchMeasure,
  apiGetParticipantMeasures,
  apiPostParticipantMeasure,
  apiPatchParticipantMeasure,
  apiDeleteParticipantMeasure
}

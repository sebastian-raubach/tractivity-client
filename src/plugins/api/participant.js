import { apiAxios, apiForm } from '@/plugins/api/base'

const apiGetParticipant = (participantId, onSuccess, onError) => apiAxios({ url: `participant/${participantId}`, success: onSuccess, error: onError })

const apiGetParticipantActivityCount = (participantId, onSuccess, onError) => apiAxios({ url: `participant/${participantId}/activitycount`, success: onSuccess, error: onError })

const apiGetParticipantParticipantCount = (participantId, onSuccess, onError) => apiAxios({ url: `participant/${participantId}/participantcount`, success: onSuccess, error: onError })

const apiPostParticipantTable = (queryData, onSuccess, onError) => {
  queryData.page -= 1
  return apiAxios({ url: 'participant/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostParticipantActivityTable = (participantId, queryData, onSuccess, onError) => {
  queryData.page -= 1
  return apiAxios({ url: `participant/${participantId}/activity`, method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPatchParticipant = (participant, onSuccess, onError) => apiAxios({ url: `participant/${participant.id}`, method: 'PATCH', data: participant, success: onSuccess, error: onError })

const apiPostParticipant = (participant, onSuccess, onError) => apiAxios({ url: 'participant', method: 'POST', data: participant, success: onSuccess, error: onError })

const apiDeleteParticipant = (participantId, onSuccess, onError) => apiAxios({ url: `participant/${participantId}`, method: 'DELETE', success: onSuccess, error: onError })

const apiPostParticipantImage = (participantId, formData, onSuccess, onError) => apiForm({ url: `participant/${participantId}/img`, formData: formData, success: onSuccess, error: onError })

export {
  apiGetParticipant,
  apiGetParticipantActivityCount,
  apiGetParticipantParticipantCount,
  apiPostParticipantTable,
  apiPostParticipantActivityTable,
  apiPatchParticipant,
  apiPostParticipant,
  apiDeleteParticipant,
  apiPostParticipantImage
}

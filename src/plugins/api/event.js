import { apiAxios } from '@/plugins/api/base'

const apiGetEvent = (eventId, onSuccess, onError) => apiAxios({ url: `event/${eventId}`, success: onSuccess, error: onError })

const apiPostEventTable = (queryData, onSuccess, onError) => {
  queryData.page -= 1
  return apiAxios({ url: 'event/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostEventActivityTable = (eventId, queryData, onSuccess, onError) => {
  queryData.page -= 1
  return apiAxios({ url: `event/${eventId}/activity`, method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPatchEvent = (event, onSuccess, onError) => apiAxios({ url: `event/${event.id}`, method: 'PATCH', data: event, success: onSuccess, error: onError })

const apiPostEvent = (event, onSuccess, onError) => apiAxios({ url: 'event', method: 'POST', data: event, success: onSuccess, error: onError })

export {
  apiGetEvent,
  apiPostEventTable,
  apiPostEventActivityTable,
  apiPatchEvent,
  apiPostEvent
}

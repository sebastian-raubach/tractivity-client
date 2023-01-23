import { apiAxios, apiForm } from '@/plugins/api/base'

const apiGetActivityTypes = (onSuccess, onError) => apiAxios({ url: 'activitytype', success: onSuccess, error: onError })

const apiGetActivity = (activityId, onSuccess, onError) => apiAxios({ url: `activity/${activityId}`, success: onSuccess, error: onError })

const apiGetActivityYears = (onSuccess, onError) => apiAxios({ url: 'activity/year', success: onSuccess, error: onError })

const apiPostActivityTable = (queryData, onSuccess, onError) => {
  queryData.page -= 1
  return apiAxios({ url: 'activity/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostActivity = (activity, onSuccess, onError) => apiAxios({ url: 'activity', method: 'POST', data: activity, success: onSuccess, error: onError })

const apiPostActivityType = (formData, onSuccess, onError) => apiForm({ url: 'activitytype', method: 'POST', formData: formData, success: onSuccess, error: onError })

const apiPatchActivityType = (activityTypeId, formData, onSuccess, onError) => apiForm({ url: `activitytype/${activityTypeId}`, method: 'PATCH', formData: formData, success: onSuccess, error: onError })

export {
  apiGetActivity,
  apiGetActivityYears,
  apiPostActivityTable,
  apiGetActivityTypes,
  apiPostActivity,
  apiPostActivityType,
  apiPatchActivityType
}

import { apiAxios, apiForm } from '@/plugins/api/base'

const apiGetMeasures = (onSuccess, onError) => apiAxios({ url: 'measure', success: onSuccess, error: onError })

const apiPostMeasure = (formData, onSuccess, onError) => apiForm({ url: 'measure', method: 'POST', formData: formData, success: onSuccess, error: onError })

const apiPatchMeasure = (measureId, formData, onSuccess, onError) => apiForm({ url: `measure/${measureId}`, method: 'PATCH', formData: formData, success: onSuccess, error: onError })

export {
  apiGetMeasures,
  apiPostMeasure,
  apiPatchMeasure
}

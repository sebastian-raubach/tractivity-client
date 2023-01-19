import { apiAxios } from '@/plugins/api/base'

const apiGetLocations = (onSuccess, onError) => apiAxios({ url: 'location', success: onSuccess, error: onError })

const apiPostLocation = (location, onSuccess, onError) => apiAxios({ url: 'location', method: 'POST', data: location, success: onSuccess, error: onError })

export {
  apiGetLocations,
  apiPostLocation
}

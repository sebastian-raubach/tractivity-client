import { apiAxios } from '@/plugins/api/base'

const apiCheckToken = (token, onSuccess, onError) => apiAxios({ url: 'token/check', method: 'POST', data: token, success: onSuccess, error: onError })

const apiPostToken = (queryData, onSuccess, onError) => apiAxios({ url: 'token', method: 'POST', data: queryData, success: onSuccess, error: onError })

const apiDeleteToken = (queryData, onSuccess, onError) => apiAxios({ url: 'token', method: 'DELETE', data: queryData, success: onSuccess, error: onError })

export {
  apiPostToken,
  apiCheckToken,
  apiDeleteToken
}

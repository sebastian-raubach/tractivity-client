import axios from 'axios'
import store from '@/store'
import { i18n } from '@/plugins/i18n.js'

const MAX_JAVA_INTEGER = 2147483647

const emitter = require('tiny-emitter/instance')

/**
 * Returns the current authentication token
 */
const getToken = () => {
  let t = store.getters.storeToken

  // Check if the token is still valid
  if (t && ((new Date().getTime() - new Date(t.createdOn).getTime()) > t.lifetime)) {
    t = null
    store.dispatch('setToken', t)
  }

  return t ? t.token : null
}

const handleError = (error) => {
  emitter.emit('show-loading', false)
  const variant = 'danger'
  const title = i18n.t('genericError')
  let message = error.statusText

  switch (error.status) {
    case 400:
      message = i18n.t('httpErrorFourOO')
      break
    case 401:
      message = i18n.t('httpErrorFourOOne')
      store.dispatch('setToken', null)
      // We're using the emitter here rather than directly accessing the router to prevent a circular dependency
      emitter.emit('route', { name: 'login' })
      return
    case 403: {
      message = i18n.t('httpErrorFourOThree')
      // store.dispatch('setToken', null)
      // We're using the emitter here rather than directly accessing the router to prevent a circular dependency
      // emitter.emit('route', { name: 'login' })
      break
    }
    case 404:
      message = i18n.t('httpErrorFourOFour')
      break
    case 405:
      message = i18n.t('httpErrorFourOFive')
      break
    case 408:
      message = i18n.t('httpErrorFourOEight')
      break
    case 409:
      message = i18n.t('httpErrorFourONine')
      break
    case 410:
      message = i18n.t('httpErrorFourTen')
      break
    case 500:
      message = i18n.t('httpErrorFiveOO')
      break
    case 501:
      message = i18n.t('httpErrorFiveOOne')
      break
    case 503:
      message = i18n.t('httpErrorFiveOThree')
      break
  }

  emitter.emit('toast', {
    message: message,
    title: title,
    variant: variant,
    autoHideDelay: 5000,
    appendToast: true
  })
}

/**
 * Sends a FORM to the given URL using authentication
 * @param {Object} param0 `{ url: String, formData: Object, success: Callback, error: { codes: [], callback: Callback } }`
 */
const apiForm = ({ url = null, formData, success = null, error = { codes: [], callback: handleError } }) => {
  const promise = axios.post(url, formData, {
    crossDomain: true,
    withCredentials: true,
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${getToken()}`
    }
  })

  promise.then(result => {
    const t = store.getters.storeToken

    // Check if the token is still valid. Renew it if so.
    if (t && ((new Date().getTime() - new Date(t.createdOn).getTime()) <= t.lifetime)) {
      t.createdOn = new Date().getTime()
      store.dispatch('setToken', t)
    }

    if (success) {
      success(result.data)
    }
  })

  promise.catch(err => {
    if (err.response) {
      // The request was made and the server responded with a status code that falls out of the range of 2xx
      // Log the user out if the result is forbidden and no error method has been provided
      // Otherwise, we assume that the calling method takes care of the error
      if (!error) {
        if (err.response.status === 401) {
          store.dispatch('setToken', null)
          // We're using the emitter here rather than directly accessing the router to prevent a circular dependency
          emitter.emit('route', { name: 'login' })
        } else if (process.env.NODE_ENV === 'development') {
          console.error(err)
        }
      } else if (error && error.callback) {
        if (error.codes.length === 0 || error.codes.includes(err.response.status)) {
          return error.callback(err.response)
        } else {
          return handleError(err.response)
        }
      } else if (process.env.NODE_ENV === 'development') {
        console.error(err)
      }
    } else if (err.request) {
      // The request was made but no response was received `err.request` is an instance of XMLHttpRequest in the browser
      if (err.request.textStatus === 'timeout') {
        emitter.emit('toast', {
          message: 'Request to the server timed out.',
          title: 'Error',
          variant: 'danger',
          autoHideDelay: 5000,
          appendToast: true
        })
      }
    } else {
      // Something happened in setting up the request that triggered an Error
      if (process.env.NODE_ENV === 'development') {
        console.error(err)
      }
    }

    throw err
  })

  return promise
}

/**
 * Sends an Axios request to the server using authentication
 * @param {Object} param0 `{ url: String, method: String, data: Object, dataType: String, contentType: String, success: Callback, error: { codes: [], callback: Callback } }`
 */
const apiAxios = ({ url = null, method = 'GET', data = null, dataType = 'json', contentType = 'application/json; charset=utf-8', success = null, error = { codes: [], callback: handleError } }) => {
  let requestData = null
  let requestParams = null

  // Stringify the data object for non-GET requests
  if (data !== null || data !== undefined) {
    if (method === 'GET') {
      requestParams = data
    } else {
      requestData = data
    }
  }

  const promise = axios({
    url: url,
    method: method,
    data: requestData,
    params: requestParams,
    crossDomain: true,
    responseType: dataType,
    withCredentials: true,
    headers: {
      'Content-Type': contentType,
      Authorization: `Bearer ${getToken()}`
    }
  })

  promise.then(result => {
    const t = store.getters.storeToken

    // Check if the token is still valid. Renew it if so.
    if (t && ((new Date().getTime() - new Date(t.createdOn).getTime()) <= t.lifetime)) {
      t.createdOn = new Date().getTime()
      store.dispatch('setToken', t)
    }

    if (success) {
      if (dataType === 'blob' && result.headers && result.headers['content-disposition']) {
        const filename = result.headers['content-disposition']
          .split(';')
          .map(p => p.trim())
          .filter(p => p.indexOf('filename') === 0)
          .map(p => p.replace('filename=', ''))

        if (filename && filename.length > 0) {
          result.data.filename = filename[0]
        }
      }

      success(result.data)
    }
  })

  promise.catch(err => {
    if (err.response) {
      // The request was made and the server responded with a status code that falls out of the range of 2xx
      // Log the user out if the result is forbidden and no error method has been provided
      // Otherwise, we assume that the calling method takes care of the error
      if (!error) {
        if (err.response.status === 401) {
          store.dispatch('setToken', null)
          // We're using the emitter here rather than directly accessing the router to prevent a circular dependency
          emitter.emit('route', { name: 'login' })
        } else if (process.env.NODE_ENV === 'development') {
          console.error(err)
        }
      } else if (error && error.callback) {
        if (error.codes.length === 0 || error.codes.includes(err.response.status)) {
          return error.callback(err.response)
        } else {
          return handleError(err.response)
        }
      } else if (process.env.NODE_ENV === 'development') {
        console.error(err)
      }
    } else if (err.request) {
      // The request was made but no response was received `err.request` is an instance of XMLHttpRequest in the browser
      if (err.request.textStatus === 'timeout') {
        emitter.emit('toast', {
          message: 'Request to the server timed out.',
          title: 'Error',
          variant: 'danger',
          autoHideDelay: 5000,
          appendToast: true
        })
      }
    } else {
      // Something happened in setting up the request that triggered an Error
      if (process.env.NODE_ENV === 'development') {
        console.error(err)
      }
    }

    throw err
  })

  return promise
}

export {
  MAX_JAVA_INTEGER,
  getToken,
  handleError,
  apiAxios,
  apiForm
}

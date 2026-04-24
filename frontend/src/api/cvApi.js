import http from './axiosClient'

export const getCvsApi = () => http.get('/cvs')
export const createCvApi = (data) => http.post('/cvs', data)
export const getCvByIdApi = (id) => http.get(`/cvs/${id}`)
export const deleteCvApi = (id) => http.delete(`/cvs/${id}`)

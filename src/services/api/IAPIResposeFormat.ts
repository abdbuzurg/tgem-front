export default interface IAPIResposeFormat<T> {
  data: T,
  error: string
  success: boolean
  permission: boolean
}

export interface IAPIRequestFormat<T>{
  requestURL: string
  data: T
}

import Resource from "../interfaces/resource"
import IAPIResposeFormat from "./IAPIResposeFormat"
import axiosClient from "./axiosClient"

const URL = '/resource'

export async function getAllResources(): Promise<Resource[]> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<Resource[]>>(`${URL}/`)
  const response = responseRaw.data
  if (response.permission && response.success) {
    return response.data
  } else{
    throw new Error(response.error)
  }
}

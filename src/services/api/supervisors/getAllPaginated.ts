import Tbl_Supervisor from "../../interfaces/supervisors"
import IAPIResposeFormat from "../IAPIResposeFormat"
import axiosClient from "../axiosClient"
import { ENTRY_LIMIT } from "../constants"

export interface SupervisorsGetAllResponse {
  data: Tbl_Supervisor[]
  count: number
  page: number
}


export default async function getAllSupervisorPaginated({pageParam = 1}): Promise<SupervisorsGetAllResponse> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<SupervisorsGetAllResponse>>(`/tbl_supervisor/all?page=${pageParam}&limit=${ENTRY_LIMIT}`)
  const responseData = responseRaw.data
  if (responseData.success) {
    return {...responseData.data, page: pageParam}
  } else {
    throw new Error(responseData.error)
  }
}
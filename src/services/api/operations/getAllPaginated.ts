import { IOperation } from "../../interfaces/operation"
import IAPIResposeFormat from "../IAPIResposeFormat"
import axiosClient from "../axiosClient"
import { ENTRY_LIMIT } from "../constants"

export interface OperationGetAllResponse {
  data: IOperation[]
  count: number
  page: number
}

export default async function getPaginatedOperations({pageParam = 1}): Promise<OperationGetAllResponse> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<OperationGetAllResponse>>(`/operation/paginated?page=${pageParam}&limit=${ENTRY_LIMIT}`)
  const responseData = responseRaw.data
  if (responseData.success) {
    return {...responseData.data, page: pageParam}
  } else {
    throw new Error(responseData.error)
  }
}
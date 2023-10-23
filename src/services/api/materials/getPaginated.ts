import Material from "../../interfaces/material"
import IAPIResposeFormat from "../IAPIResposeFormat"
import axiosClient from "../axiosClient"
import { ENTRY_LIMIT } from "../constants"

export interface MaterialsGetAllResponse {
  data: Material[]
  count: number
  page: number
}


export default async function getPaginatedMaterials({pageParam = 1}): Promise<MaterialsGetAllResponse> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<MaterialsGetAllResponse>>(`/material/paginated?page=${pageParam}&limit=${ENTRY_LIMIT}`)
  const responseData = responseRaw.data
  if (responseData.success) {
    return {...responseData.data, page: pageParam}
  } else {
    throw new Error(responseData.error)
  }
}
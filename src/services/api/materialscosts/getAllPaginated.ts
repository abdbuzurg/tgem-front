import { IMaterialCostView } from "../../interfaces/materialCost"
import IAPIResposeFormat from "../IAPIResposeFormat"
import axiosClient from "../axiosClient"
import { ENTRY_LIMIT } from "../constants"
import { MaterialCostSearchParameteres } from "../materialCost"

export interface MaterialCostGetAllResponse {
  data: IMaterialCostView[]
  count: number
  page: number
}

export default async function getPaginatedMaterialCost({pageParam = 1}, searchParameters: MaterialCostSearchParameteres): Promise<MaterialCostGetAllResponse> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<MaterialCostGetAllResponse>>(`/material-cost/paginated?page=${pageParam}&limit=${ENTRY_LIMIT}&materialName=${searchParameters.materialName}`)
  const responseData = responseRaw.data
  if (responseData.success) {
    return {...responseData.data, page: pageParam}
  } else {
    throw new Error(responseData.error)
  }
}

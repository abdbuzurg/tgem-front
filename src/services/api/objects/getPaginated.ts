import { IObject } from "../../interfaces/objects";
import IAPIResposeFormat from "../IAPIResposeFormat";
import axiosClient from "../axiosClient";
import { ENTRY_LIMIT } from "../constants";

export interface IObjectPaginated extends Omit<IObject, "supervisorWorkerID"> {
  supervisorName: string
}

export interface IObjectGetAllResponse {
  data: IObjectPaginated[]
  count: number
  page: number
}

export default async function getPaginatedObjects({pageParam = 1}): Promise<IObjectGetAllResponse> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<IObjectGetAllResponse>>(`/object/paginated?page=${pageParam}&limit=${ENTRY_LIMIT}`)
  const response = responseRaw.data
  if (response.permission && response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}
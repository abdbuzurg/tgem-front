import IWorker from "../../interfaces/worker";
import IAPIResposeFormat from "../IAPIResposeFormat";
import axiosClient from "../axiosClient";
import { ENTRY_LIMIT } from "../constants";

export interface WorkerPaginatedData {
  data: IWorker[]
  count: number
  page: number
}

export default async function getPaginatedWorker({pageParam = 1}):Promise<WorkerPaginatedData> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<WorkerPaginatedData>>(`/worker/paginated?page=${pageParam}&limit=${ENTRY_LIMIT}`)
  const response = responseRaw.data
  if (response.success && response.permission) {
    return {...response.data, page: pageParam}
  } else {
    throw new Error(response.error)
  }
} 
import IWorker from "../interfaces/worker"
import IAPIResposeFormat from "./IAPIResposeFormat"
import axiosClient from "./axiosClient"
import { ENTRY_LIMIT } from "./constants"

export async function getWorkerByJobTitle(jobTitle: string): Promise<IWorker[]> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<IWorker[]>>(`/worker/job-title/${jobTitle}`)
  const response = responseRaw.data
  if (response.permission && response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}

export async function createWorker(data: IWorker):Promise<IWorker> {
  const responseRaw = await axiosClient.post<IAPIResposeFormat<IWorker>>("/worker/", data)
  const response = responseRaw.data
  if (response.permission && response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}

export async function deleteWorker(key: string) {
  const responseRaw = await axiosClient.delete<IAPIResposeFormat<IWorker[]>>(`/worker/${key}`)
  const response = responseRaw.data
  return response.success
}

export async function getAllWorkers(): Promise<IWorker[]> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<IWorker[]>>("/worker/all")
  const response = responseRaw.data
  if (response.success && response.permission) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}

export interface WorkerPaginatedData {
  data: IWorker[]
  count: number
  page: number
}

export async function getPaginatedWorker({pageParam = 1}):Promise<WorkerPaginatedData> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<WorkerPaginatedData>>(`/worker/paginated?page=${pageParam}&limit=${ENTRY_LIMIT}`)
  const response = responseRaw.data
  if (response.success && response.permission) {
    return {...response.data, page: pageParam}
  } else {
    throw new Error(response.error)
  }
}

export async function updateWorker(data: IWorker):Promise<IWorker> {
  const responseRaw = await axiosClient.patch<IAPIResposeFormat<IWorker>>("/worker/", data)
  const response = responseRaw.data
  if (response.permission && response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}

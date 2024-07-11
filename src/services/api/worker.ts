import fileDownload from "js-file-download"
import IWorker from "../interfaces/worker"
import IAPIResposeFormat from "./IAPIResposeFormat"
import axiosClient from "./axiosClient"
import { ENTRY_LIMIT } from "./constants"

const URL = "/worker"

export async function getWorkerByJobTitle(jobTitle: string): Promise<IWorker[]> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<IWorker[]>>(`${URL}/job-title/${jobTitle}`)
  const response = responseRaw.data
  if (response.permission && response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}

export async function createWorker(data: IWorker): Promise<IWorker> {
  const responseRaw = await axiosClient.post<IAPIResposeFormat<IWorker>>(`${URL}/`, data)
  const response = responseRaw.data
  if (response.permission && response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}

export async function deleteWorker(key: string) {
  const responseRaw = await axiosClient.delete<IAPIResposeFormat<IWorker[]>>(`${URL}/${key}`)
  const response = responseRaw.data
  return response.success
}

export async function getAllWorkers(): Promise<IWorker[]> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<IWorker[]>>(`${URL}/all`)
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

export async function getPaginatedWorker({ pageParam = 1 }): Promise<WorkerPaginatedData> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<WorkerPaginatedData>>(`${URL}/paginated?page=${pageParam}&limit=${ENTRY_LIMIT}`)
  const response = responseRaw.data
  if (response.success && response.permission) {
    return { ...response.data, page: pageParam }
  } else {
    throw new Error(response.error)
  }
}

export async function updateWorker(data: IWorker): Promise<IWorker> {
  const responseRaw = await axiosClient.patch<IAPIResposeFormat<IWorker>>(`${URL}/`, data)
  const response = responseRaw.data
  if (response.permission && response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}

export async function getWorkerTemplateDocument(): Promise<boolean> {
  const response = await axiosClient.get(`${URL}/document/template`, { responseType: "blob" })
  if (response.status == 200) {
    fileDownload(response.data, "Шаблон для импорта Рабочего Персонала.xlsx")
    return true
  } else {
    throw new Error(response.statusText)
  }
}

export async function importWorker(data: File): Promise<boolean> {
  const formData = new FormData()
  formData.append("file", data)
  const responseRaw = await axiosClient.post(`${URL}/document/import`, formData, {
    headers: {
      "Content-Type": `multipart/form-data; boundary=WebAppBoundary`,
    }
  })
  if (responseRaw.status == 200) {
    return true
  } else {
    throw new Error(responseRaw.data)
  }
}

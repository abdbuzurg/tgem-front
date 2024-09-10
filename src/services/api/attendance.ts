import IAPIResposeFormat from "./IAPIResposeFormat"
import axiosClient from "./axiosClient"

const URL = "/worker-attendance"

export async function createWorkerAttendance(data: File): Promise<boolean> {
  const formData = new FormData()
  formData.append("file", data)
  const responseRaw = await axiosClient.post<IAPIResposeFormat<null>>(`${URL}/`, formData, {
    headers: {
      "Content-Type": `multipart/form-data; boundary=WebAppBoundary`,
    }
  })
  const response = responseRaw.data
  if (response.success) {
    return true
  } else {
    throw new Error(response.error)
  }
}

export interface WorkerAttendancePaginated {
  id: number
  workerName: string
  companyWorkerID: string
  start: string
  end: string
}

export interface WorkerAttendancePaginatedResponse {
  data: WorkerAttendancePaginated[]
  count: number
  page: number
}

export default async function getPaginatedWorkerAttendance({pageParam = 1}): Promise<WorkerAttendancePaginatedResponse> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<WorkerAttendancePaginatedResponse>>(`${URL}/paginated`)
  const responseData = responseRaw.data
  if (responseData.success) {
    return {...responseData.data, page: pageParam}
  } else {
    throw new Error(responseData.error)
  }
}

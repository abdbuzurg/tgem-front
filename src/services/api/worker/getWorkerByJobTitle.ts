import Worker from "../../interfaces/worker"
import IAPIResposeFormat from "../IAPIResposeFormat"
import axiosClient from "../axiosClient"

export default async function getWorkerByJobTitle(jobTitle: string):Promise<Worker[]> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<Worker[]>>(`/worker/job-title/${jobTitle}`)
  const response = responseRaw.data
  if (response.success && response.permission) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}
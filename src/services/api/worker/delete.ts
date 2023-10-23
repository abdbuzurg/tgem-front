import IWorker from "../../interfaces/worker"
import IAPIResposeFormat from "../IAPIResposeFormat"
import axiosClient from "../axiosClient"

export default async function deleteWorker(key: string) {
  const responseRaw = await axiosClient.delete<IAPIResposeFormat<IWorker[]>>(`/worker/${key}`)
  const response = responseRaw.data
  return response.success
}
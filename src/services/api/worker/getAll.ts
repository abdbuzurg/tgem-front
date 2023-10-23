import IWorker from "../../interfaces/worker";
import IAPIResposeFormat from "../IAPIResposeFormat";
import axiosClient from "../axiosClient";

export default async function getAllWorkers(): Promise<IWorker[]> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<IWorker[]>>("/worker/all")
  const response = responseRaw.data
  if (response.success && response.permission) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}
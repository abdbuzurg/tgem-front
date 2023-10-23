import IWorker from "../../interfaces/worker";
import IAPIResposeFormat from "../IAPIResposeFormat";
import axiosClient from "../axiosClient";

export default async function createWorker(data: IWorker):Promise<IWorker> {
  const responseRaw = await axiosClient.post<IAPIResposeFormat<IWorker>>("/worker/", data)
  const response = responseRaw.data
  if (response.permission && response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}
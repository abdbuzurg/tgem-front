import IWorker from "../../interfaces/worker";
import IAPIResposeFormat from "../IAPIResposeFormat";
import axiosClient from "../axiosClient";

export default async function updateWorker(data: IWorker):Promise<IWorker> {
  const responseRaw = await axiosClient.patch<IAPIResposeFormat<IWorker>>("/worker/", data)
  const response = responseRaw.data
  if (response.permission && response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}
import { IOperation } from "../../interfaces/operation";
import IAPIResposeFormat from "../IAPIResposeFormat";
import axiosClient from "../axiosClient";

export default async function getOperationByKey(key: number): Promise<IOperation> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<IOperation>>(`/operation/${key}`)
  const response = responseRaw.data
  if (response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}
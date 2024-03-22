import { IOperation } from "../../interfaces/operation";
import IAPIResposeFormat from "../IAPIResposeFormat";
import axiosClient from "../axiosClient";

export default async function createOperation(data: IOperation): Promise<IOperation> {
  const responseRaw = await axiosClient.post<IAPIResposeFormat<IOperation>>(`/operation/`, data)
  const response = responseRaw.data
  if (response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}
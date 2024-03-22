import { IOperation } from "../../interfaces/operation";
import IAPIResposeFormat from "../IAPIResposeFormat";
import axiosClient from "../axiosClient";

export default async function getAllOperations(): Promise<IOperation[]> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<IOperation[]>>("/operation/all")
  const response = responseRaw.data
  if (response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}
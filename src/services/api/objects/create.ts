import { IObject } from "../../interfaces/objects";
import IAPIResposeFormat from "../IAPIResposeFormat";
import axiosClient from "../axiosClient";

export default async function createObject(data: any): Promise<any> {
  const responseRaw = await axiosClient.post<IAPIResposeFormat<IObject>>("/object/", data)
  const response = responseRaw.data
  if (response.permission && response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}
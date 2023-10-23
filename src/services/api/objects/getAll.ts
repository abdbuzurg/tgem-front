import { IObject } from "../../interfaces/objects";
import IAPIResposeFormat from "../IAPIResposeFormat";
import axiosClient from "../axiosClient";

export default async function getAllObjects(): Promise<IObject[]> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<IObject[]>>("/object/all")
  const response = responseRaw.data
  if (response.permission && response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}
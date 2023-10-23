import { IObject } from "../../interfaces/objects";
import IAPIResposeFormat from "../IAPIResposeFormat";
import axiosClient from "../axiosClient";

export default async function updateObject(data: IObject): Promise<IObject> {
  const responseRaw = await axiosClient.patch<IAPIResposeFormat<IObject>>("/object/", data)
  const response = responseRaw.data
  if (response.permission && response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}
import Material from "../../interfaces/material";
import IAPIResposeFormat from "../IAPIResposeFormat";
import axiosClient from "../axiosClient";

export default async function getMaterialByKey(key: number): Promise<Material> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<Material>>(`/material/${key}`)
  const response = responseRaw.data
  if (response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}
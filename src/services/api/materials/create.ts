import Material from "../../interfaces/material";
import IAPIResposeFormat from "../IAPIResposeFormat";
import axiosClient from "../axiosClient";

export default async function createMaterial(data: Material): Promise<Material> {
  const responseRaw = await axiosClient.post<IAPIResposeFormat<Material>>(`/material/`, data)
  const response = responseRaw.data
  if (response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}
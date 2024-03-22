import { IMaterialCost } from "../../interfaces/materialCost";
import IAPIResposeFormat from "../IAPIResposeFormat";
import axiosClient from "../axiosClient";

export default async function updateMaterialCost(data: IMaterialCost): Promise<IMaterialCost> {
  const responseRaw = await axiosClient.patch<IAPIResposeFormat<IMaterialCost>>(`/material-cost/`, data)
  const response = responseRaw.data
  if (response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}
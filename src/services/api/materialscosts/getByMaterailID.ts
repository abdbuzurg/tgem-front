import { IMaterialCost } from "../../interfaces/materialCost";
import IAPIResposeFormat from "../IAPIResposeFormat";
import axiosClient from "../axiosClient";

export default async function getMaterailCostByMaterialID(materialID: number): Promise<IMaterialCost[]> {
  if (materialID == 0) {
    return []
  }
  const responseRaw = await axiosClient.get<IAPIResposeFormat<IMaterialCost[]>>(`/material-cost/material-id/${materialID}`)
  const response = responseRaw.data
  if (response.permission && response.success) {
    return response.data
  }  else {
    throw new Error(response.error)
  }
}
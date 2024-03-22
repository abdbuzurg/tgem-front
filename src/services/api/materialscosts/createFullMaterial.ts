import Material from "../../interfaces/material";
import { IMaterialCost } from "../../interfaces/materialCost";
import IAPIResposeFormat from "../IAPIResposeFormat";
import axiosClient from "../axiosClient";

export interface FullMaterailData {
  details: Material
  cost: IMaterialCost
}

export default async function createFullMaterial(data: FullMaterailData):Promise<boolean> {
  const responseRaw = await axiosClient.post<IAPIResposeFormat<boolean>>("/material-cost/full-material", data)
  const response = responseRaw.data
  if (response.permission && response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}
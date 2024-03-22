import { IMaterialCostView } from "../../interfaces/materialCost";
import IAPIResposeFormat from "../IAPIResposeFormat";
import axiosClient from "../axiosClient";

export default async function getAllMaterialCost(): Promise<IMaterialCostView[]> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<IMaterialCostView[]>>("/operation/all")
  const response = responseRaw.data
  if (response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}
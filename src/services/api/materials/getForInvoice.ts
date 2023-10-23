import IAPIResposeFormat from "../IAPIResposeFormat"
import axiosClient from "../axiosClient"

export interface MaterialForInvoice {
  key_material: number
  name_material: string
  unit: string
}

export async function getMaterialsForInvoice(): Promise<MaterialForInvoice[]>{
  const responseRaw = await axiosClient.get<IAPIResposeFormat<MaterialForInvoice[]>>(`/material/warehouse`)
  const response = responseRaw.data
  if (response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}
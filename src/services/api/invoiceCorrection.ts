import IAPIResposeFormat from "./IAPIResposeFormat";
import axiosClient from "./axiosClient";
import { InvoiceObjectFullDataItem, InvoiceObjectPaginatedView } from "./invoiceObject";

const URL = "/invoice-correction"

export async function getAllInvoiceObjectsForCorrect(): Promise<InvoiceObjectPaginatedView[]>{
  const responseRaw = await axiosClient.get<IAPIResposeFormat<InvoiceObjectPaginatedView[]>>(`${URL}/`)
  const response = responseRaw.data
  if (response.success && response.permission) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}

export async function getInvoiceMaterialsForCorrect(invoiceID: number): Promise<InvoiceObjectFullDataItem[]>{
  const responseRaw = await axiosClient.get<IAPIResposeFormat<InvoiceObjectFullDataItem[]>>(`${URL}/invoice-materials/${invoiceID}/all`)
  const response = responseRaw.data
  if (response.success && response.permission) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}

export async function getTotalAmounByTeamNumber(materialID: number, teamNumber: string): Promise<number>{
  const responseRaw = await axiosClient.get<IAPIResposeFormat<number>>(`${URL}/total-amount/${materialID}/team/${teamNumber}`)
  const response = responseRaw.data
  if (response.success && response.permission) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}

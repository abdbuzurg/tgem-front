import IAPIResposeFormat from "./IAPIResposeFormat";
import axiosClient from "./axiosClient";
import {  InvoiceObjectPaginatedView } from "./invoiceObject";

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

export interface InvoiceCorrectionMaterial {
  invoiceMaterialID: number
  materialName: string
  materialCost: number
  materialAmount: number
}

export async function getInvoiceMaterialsForCorrect(invoiceID: number): Promise<InvoiceCorrectionMaterial[]>{
  const responseRaw = await axiosClient.get<IAPIResposeFormat<InvoiceCorrectionMaterial[]>>(`${URL}/materials/${invoiceID}`)
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

export async function getSerialNumbersOfMaterialInTeam(materialID: number, teamNumber: string): Promise<string[]> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<string[]>>(`${URL}/serial-number/material/${materialID}/teams/${teamNumber}`)
  const response = responseRaw.data
  if (response.permission && response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}

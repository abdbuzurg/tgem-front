import { IInvoiceObject } from "../interfaces/invoiceObject";
import IAPIResposeFormat from "./IAPIResposeFormat";
import axiosClient from "./axiosClient";

const URL = "/invoice-correction"

export interface InvoiceCorrectionPaginatedView {
  id: number
  deliveryCode: string
  supervisorName: string
  objectName: string
  teamID: number
  teamNumber: string
  dateOfInvoice: Date
}

export async function getAllInvoiceObjectsForCorrect(): Promise<InvoiceCorrectionPaginatedView[]> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<InvoiceCorrectionPaginatedView[]>>(`${URL}/`)
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
  materialID: number
  materialAmount: number
  materialUnit: string
  notes: string
}

export async function getInvoiceMaterialsForCorrect(invoiceID: number): Promise<InvoiceCorrectionMaterial[]> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<InvoiceCorrectionMaterial[]>>(`${URL}/materials/${invoiceID}`)
  const response = responseRaw.data
  if (response.success && response.permission) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}

export async function getTotalAmounByTeamNumber(materialID: number, teamNumber: string): Promise<number> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<number>>(`${URL}/total-amount/${materialID}/team/${teamNumber}`)
  const response = responseRaw.data
  if (response.success && response.permission) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}

export async function getSerialNumbersOfMaterialInTeam(materialID: number, teamID: number): Promise<string[]> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<string[]>>(`${URL}/serial-number/material/${materialID}/teams/${teamID}`)
  const response = responseRaw.data
  if (response.permission && response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}

export interface InvoiceCorrectionMaterialMutation {
  details: {
    id: number
    dateOfCorrection: Date
  },
  items: InvoiceCorrectionMaterial[]
}

export async function createInvoiceCorrection(data: InvoiceCorrectionMaterialMutation): Promise<IInvoiceObject> {
  const responseRaw = await axiosClient.post<IAPIResposeFormat<IInvoiceObject>>(`${URL}/`, data)
  const response = responseRaw.data
  if (response.permission && response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}

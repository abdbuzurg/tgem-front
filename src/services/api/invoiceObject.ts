import { InvoiceMaterialViewWithSerialNumbers,  InvoiceMaterialViewWithoutSerialNumbers } from "../interfaces/invoiceMaterial"
import { IInvoiceObject } from "../interfaces/invoiceObject"
import Material from "../interfaces/material"
import { TeamDataForSelect } from "../interfaces/teams"
import IAPIResposeFormat from "./IAPIResposeFormat"
import axiosClient from "./axiosClient"
import { ENTRY_LIMIT } from "./constants"

const URL = "/invoice-object"

export async function getTeamMaterials(teamID: number): Promise<Material[]> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<Material[]>>(`${URL}/materials/team/${teamID}`)
  const response = responseRaw.data
  if (response.permission && response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}

export async function getSerialNumbersOfMaterial(materialID: number, teamID: number): Promise<string[]> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<string[]>>(`${URL}/serial-number/material/${materialID}/teams/${teamID}`)
  const response = responseRaw.data
  if (response.permission && response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}

export interface InvoiceObjectCreateItems {
  materialID: number
  amount: number
  serialNumbers: string[]
  notes: string
}

export interface InvoiceObjectCreate {
  details: IInvoiceObject
  items: InvoiceObjectCreateItems[]
}

export async function createInvoiceObject(data: InvoiceObjectCreate): Promise<boolean> {
  const responseRaw = await axiosClient.post<IAPIResposeFormat<boolean>>(`${URL}/`, data)
  const response = responseRaw.data
  if (response.success && response.permission) {
    return true
  } else {
    throw new Error(response.error)
  }
}

export async function getMaterialAmount(materialID: number, teamID: number): Promise<number> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<number>>(`${URL}/material/${materialID}/team/${teamID}`)
  const response = responseRaw.data
  if (response.permission && response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}

export interface InvoiceObjectPaginatedView {
  id: number
  deliveryCode: string
  supervisorName: string
  objectName: string
  teamNumber: string
  dateOfInvoice: Date
}

export interface InvoiceObjectPaginated {
  data: InvoiceObjectPaginatedView[]
  count: number
  page: number
}

export async function getInvoiceObjectPaginated({ pageParam = 1 }): Promise<InvoiceObjectPaginated> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<InvoiceObjectPaginated>>(`${URL}/paginated?page=${pageParam}&limit=${ENTRY_LIMIT}`)
  const response = responseRaw.data
  if (response.success && response.permission) {
    return { ...response.data, page: pageParam }
  } else {
    throw new Error(response.error)
  }
}

export interface InvoiceObjectFullDataItem {
  id: number
  materialName: string
  amount: number
  notes: string
}

export interface InvoiceObjectFullData {
  details: InvoiceObjectPaginatedView
  items: InvoiceObjectFullDataItem[]
}

export interface InvoiceObjectDescriptiveData {
  invoiceData: InvoiceObjectPaginatedView
  materialsWithSN: InvoiceMaterialViewWithSerialNumbers[],
  materialsWithoutSN: InvoiceMaterialViewWithoutSerialNumbers[]
}

export async function getInvoiceObjectDescriptiveDataByID(id: number): Promise<InvoiceObjectDescriptiveData> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<InvoiceObjectDescriptiveData>>(`${URL}/${id}`)
  const response = responseRaw.data
  if (response.success && response.permission) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}

export async function getTeamsFromObjectID(objectID: number): Promise<TeamDataForSelect[]> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<TeamDataForSelect[]>>(`${URL}/object/${objectID}`)
  const response = responseRaw.data
  if (response.success && response.permission) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}

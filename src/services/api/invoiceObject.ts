import { InvoiceMaterialViewWithSerialNumbers,  InvoiceMaterialViewWithoutSerialNumbers } from "../interfaces/invoiceMaterial"
import { IInvoiceObject } from "../interfaces/invoiceObject"
import Material from "../interfaces/material"
import { TeamDataForSelect } from "../interfaces/teams"
import IAPIResposeFormat from "./IAPIResposeFormat"
import axiosClient from "./axiosClient"
import { ENTRY_LIMIT } from "./constants"

const URL = "/invoice-object"

export async function getTeamMaterials(teamID: number): Promise<Material[]> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<Material[]>>(`${URL}/team-materials/${teamID}`)
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

export interface InvoiceObjectOperationsCreate {
  operationID: number
  amount: number
  notes: string
}

export interface InvoiceObjectCreate {
  details: IInvoiceObject
  items: InvoiceObjectCreateItems[]
  operations: InvoiceObjectOperationsCreate[]
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

export interface InvoiceObjectView {
  id: number
  deliveryCode: string
  supervisorName: string
  objectName: string
  objectType: string
  teamNumber: string
  dateOfInvoice: Date
  confirmedByOperator: boolean
}

export interface InvoiceObject {
  data: InvoiceObjectView[]
  count: number
  page: number
}

export async function getInvoiceObject({ pageParam = 1 }): Promise<InvoiceObject> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<InvoiceObject>>(`${URL}/paginated?page=${pageParam}&limit=${ENTRY_LIMIT}`)
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
  details: InvoiceObjectView
  items: InvoiceObjectFullDataItem[]
}

export interface InvoiceObjectDescriptiveData {
  invoiceData: InvoiceObjectView
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

export interface InvoiceObjectTeamMaterialData {
  materialID: number
  materialName: string
  materialUnit: string
  hasSerialNumber: boolean
  amount: number
}

export async function getMaterialsDataFromTeam(teamID: number): Promise<InvoiceObjectTeamMaterialData[]> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<InvoiceObjectTeamMaterialData[]>>(`${URL}/team-materials/${teamID}`)
  const response = responseRaw.data
  if (response.success && response.permission) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}

export interface InvoiceObjectOperations{
  operationID: number
  operationName: string
  materialID: number
  materialName: string
}

export async function getOperationsBasedOnTeamID(teamID: number): Promise<InvoiceObjectOperations[]> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<InvoiceObjectOperations[]>>(`${URL}/available-operations-for-team/${teamID}`)
  const response = responseRaw.data
  if (response.success && response.permission) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}

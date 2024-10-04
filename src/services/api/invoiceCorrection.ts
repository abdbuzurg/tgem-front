import fileDownload from "js-file-download";
import { IInvoiceObject } from "../interfaces/invoiceObject";
import IReactSelectOptions from "../interfaces/react-select";
import IAPIResposeFormat from "./IAPIResposeFormat";
import axiosClient from "./axiosClient";
import { ObjectDataForSelect } from "../interfaces/objects";
import { ENTRY_LIMIT } from "./constants";

const URL = "/invoice-correction"

export interface InvoiceCorrectionPaginated {
  data: InvoiceCorrectionPaginatedView[]
  count: number
  page: number
}

export interface InvoiceCorrectionPaginatedView {
  id: number
  deliveryCode: string
  supervisorName: string
  objectName: string
  objectType: string
  teamID: number
  teamNumber: string
  dateOfInvoice: Date
}

export async function getPaginatedInvoiceCorrection({pageParam = 1}): Promise<InvoiceCorrectionPaginated> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<InvoiceCorrectionPaginated>>(`${URL}/paginated?page=${pageParam}&limit=${ENTRY_LIMIT}`)
  const responseData = responseRaw.data
  if (responseData.success) {
    return {...responseData.data, page: pageParam}
  } else {
    throw new Error(responseData.error)
  }
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
  materialAvailableAmount: number
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
  operations: InvoiceCorrectionOperation[]
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

export async function getInvoiceCorrectionUniqueObjects(): Promise<ObjectDataForSelect[]> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<ObjectDataForSelect[]>>(`${URL}/unique/object`)
  const response = responseRaw.data
  if (response.permission && response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}

export async function getInvoiceCorrectionUniqueTeams(): Promise<IReactSelectOptions<number>[]> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<IReactSelectOptions<number>[]>>(`${URL}/unique/team`)
  const response = responseRaw.data
  if (response.permission && response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}

export interface InvoiceCorrectionReportFilter {
  teamID: number
  objectID: number
  dateTo: Date | null
  dateFrom: Date | null
}

export async function buildInvoiceCorrectionReport(filter: InvoiceCorrectionReportFilter): Promise<boolean> {
  const responseRaw = await axiosClient.post(`${URL}/report`, filter, { responseType: "blob", })
  if (responseRaw.status == 200) {
    const date = new Date()
    const fileName = `Отчет Расхода ${date}`
    fileDownload(responseRaw.data, `${fileName}.xlsx`)
    return true
  } else {
    throw new Error(responseRaw.data)
  }
}

export interface InvoiceCorrectionOperation {
  operationID: number
  operationName: string
  materialName: string
  amount: number
}

export async function getOperationsForCorrect(invoiceID: number): Promise<InvoiceCorrectionOperation[]> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<InvoiceCorrectionOperation[]>>(`${URL}/operations/${invoiceID}`)
  const response = responseRaw.data
  if (response.success && response.permission) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}


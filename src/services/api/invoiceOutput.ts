import fileDownload from "js-file-download"
import { IInvoiceOutput, IInvoiceOutputView } from "../interfaces/invoiceOutput"
import IAPIResposeFormat from "./IAPIResposeFormat"
import axiosClient from "./axiosClient"
import { ENTRY_LIMIT } from "./constants"

const URL = "/output"

export interface InvoiceOutputPagianted {
  data: IInvoiceOutputView[]
  count: number
  page: number
}

export async function getPaginatedInvoiceOutput({ pageParam = 1}): Promise<InvoiceOutputPagianted> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<InvoiceOutputPagianted>>(`${URL}/paginated?page=${pageParam}&limit=${ENTRY_LIMIT}`)
  const response = responseRaw.data
  if (response.success && response.permission) {
    return {...response.data, page: pageParam}
  } else {
    throw new Error(response.error)
  }
}

export async function deleteInvoiceOutput(id: number): Promise<boolean> {
  const responseRaw = await axiosClient.delete<IAPIResposeFormat<string>>(`${URL}/${id}`)
  const response = responseRaw.data
  if (response.success && response.permission) {
    return true
  } else {
    throw new Error(response.error)
  }
}

export interface InvoiceOutputItem {
  materialID: number
  amount: number
  serialNumbers: string[]
}

export interface InvoiceOutputMutation {
  details: IInvoiceOutput
  items: InvoiceOutputItem[]
}

export async function createInvoiceOutput(data: InvoiceOutputMutation): Promise<InvoiceOutputMutation> {
  const responseRaw = await axiosClient.post<IAPIResposeFormat<InvoiceOutputMutation>>(`${URL}/`, data)
  const response = responseRaw.data
  if (response.permission && response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}

export async function updateInvoiceOutput(data: InvoiceOutputMutation):Promise<InvoiceOutputMutation> {
  const responseRaw = await axiosClient.patch<IAPIResposeFormat<InvoiceOutputMutation>>(`${URL}/`, data)
  const response = responseRaw.data
  if (response.permission && response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}

export async function getInvoiceOutputDocument(deliveryCode: string):Promise<boolean>{
  console.log("kek")
  const responseRaw = await axiosClient.get(`http://127.0.0.1:8080${URL}/document/${deliveryCode}`, { responseType: "blob" })
  if (responseRaw.status == 200) {
    fileDownload(responseRaw.data, `${deliveryCode}.xlsx`)
    return true
  } else {
    throw new Error(responseRaw.data)
  }
}

export async function sendInvoiceOutputConfirmationExcel(id: number, data: File): Promise<boolean> {
  const formData = new FormData()
  formData.append("file", data)
  const responseRaw = await axiosClient.post(`http://127.0.0.1:8080${URL}/confirm/${id}`, formData, {
    headers: {
      "Content-Type": `multipart/form-data; boundary=WebAppBoundary`,
    }
  })
  if (responseRaw.status == 200) {
    return true
  } else {
    throw new Error(responseRaw.data)
  }
}

export interface InvoiceObjectUnconfirmed {
  id: number
  teamLeaderName: string
  teamNumber: string
  objectName: string
}

export async function getUncormedInvoiceObjects(): Promise<InvoiceObjectUnconfirmed[]> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<InvoiceObjectUnconfirmed[]>>(`${URL}/object`)
  const response = responseRaw.data
  if (response.permission && response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}

export async function confirmationByObject(id: number): Promise<boolean> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<boolean>>(`${URL}/object/confirm/${id}`)
  const response = responseRaw.data
  if (response.permission && response.success) {
    return true
  } else {
    throw new Error(response.error)
  }
} 

export async function getAllUniqueCode(): Promise<string[]> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<string[]>>(`${URL}/unique/code`)
  const response = responseRaw.data
  if (response.permission || response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}

export async function getAllUniqueDistrict(): Promise<string[]> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<string[]>>(`${URL}/unique/district`)
  const response = responseRaw.data
  if (response.permission || response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}

export async function getAllUniqueWarehouseManager(): Promise<string[]> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<string[]>>(`${URL}/unique/warehouse-manager`)
  const response = responseRaw.data
  if (response.permission || response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}

export async function getAllUniqueRecieved(): Promise<string[]> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<string[]>>(`${URL}/unique/recieved`)
  const response = responseRaw.data
  if (response.permission || response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}

export async function getAllUniqueObject(): Promise<string[]> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<string[]>>(`${URL}/unique/object`)
  const response = responseRaw.data
  if (response.permission || response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}

export async function getAllUniqueTeam(): Promise<string[]> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<string[]>>(`${URL}/unique/team`)
  const response = responseRaw.data
  if (response.permission || response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}

export interface InvoiceOutputReportFilter {
  code: string
  warehouseManager: string
  recieved: string
  district: string
  object: string
  team: string
  dateFrom: Date | null
  dateTo: Date | null
}

export async function buildReport(filter: InvoiceOutputReportFilter): Promise<boolean> {
  const responseRaw = await axiosClient.post(`http://127.0.0.1:8080${URL}/report`, filter, { responseType: "blob", })
  if (responseRaw.status == 200) {
    const fileName = "Отчет"
    fileDownload(responseRaw.data, `${fileName}.xlsx`)
    return true
  } else {
    throw new Error(responseRaw.data)
  }
}


export async function getAmountInWarehouse(materialID: number):Promise<number> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<number>>(`${URL}/material/${materialID}/total-amount`)
  const response = responseRaw.data
  if (response.permission && response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}

export async function getSerialNumberCodesByMaterialID(materialID: number):Promise<string[]> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<string[]>>(`${URL}/serial-number/material/${materialID}`)
  const response = responseRaw.data
  if (response.permission && response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}




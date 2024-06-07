import fileDownload from "js-file-download"
import { IInvoiceInput, IInvoiceInputView } from "../interfaces/invoiceInput"
import { InvoiceMaterial, InvoiceMaterialViewWithSerialNumbers, InvoiceMaterialViewWithoutSerialNumbers, } from "../interfaces/invoiceMaterial"
import IAPIResposeFormat from "./IAPIResposeFormat"
import axiosClient from "./axiosClient"
import { ENTRY_LIMIT } from "./constants"
import { IMaterialCost } from "../interfaces/materialCost"

const URL = "/input"

export interface InvoiceInputPagianted {
  data: IInvoiceInputView[]
  count: number
  page: number
}

export async function getPaginatedInvoiceInput({ pageParam = 1 }): Promise<InvoiceInputPagianted> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<InvoiceInputPagianted>>(`${URL}/paginated?page=${pageParam}&limit=${ENTRY_LIMIT}`)
  const response = responseRaw.data
  if (response.success && response.permission) {
    return { ...response.data, page: pageParam }
  } else {
    throw new Error(response.error)
  }
}

export async function deleteInvoiceInput(id: number): Promise<boolean> {
  const responseRaw = await axiosClient.delete<IAPIResposeFormat<string>>(`${URL}/${id}`)
  const response = responseRaw.data
  if (response.success && response.permission) {
    return true
  } else {
    throw new Error(response.error)
  }
}

export interface InvoiceInputMaterial {
  materialData: InvoiceMaterial
  serialNumbers: string[]
}

export interface InvoiceInputMutation {
  details: IInvoiceInput
  items: InvoiceInputMaterial[]
}

export async function createInvoiceInput(data: InvoiceInputMutation): Promise<InvoiceInputMutation> {
  const responseRaw = await axiosClient.post<IAPIResposeFormat<InvoiceInputMutation>>(`${URL}/`, data)
  const response = responseRaw.data
  if (response.permission && response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}

export async function updateInvoiceInput(data: InvoiceInputMutation): Promise<InvoiceInputMutation> {
  const responseRaw = await axiosClient.patch<IAPIResposeFormat<InvoiceInputMutation>>(`${URL}/`, data)
  const response = responseRaw.data
  if (response.permission && response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}

export async function getInvoiceInputDocument(deliveryCode: string): Promise<boolean> {
  const responseRaw = await axiosClient.get(`http://127.0.0.1:8080${URL}/document/${deliveryCode}`, { responseType: "blob", })
  if (responseRaw.status == 200) {
    fileDownload(responseRaw.data, `${deliveryCode}.xlsx`)
    return true
  } else {
    throw new Error(responseRaw.data)
  }
}

export async function sendInvoiceInputConfirmationExcel(id: number, data: File): Promise<boolean> {
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

export async function getAllUniqueCode(): Promise<string[]> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<string[]>>(`${URL}/unique/code`)
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

export async function getAllUniqueReleased(): Promise<string[]> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<string[]>>(`${URL}/unique/released`)
  const response = responseRaw.data
  if (response.permission || response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}

export interface InvoiceInputReportFilter {
  code: string
  warehouseManager: string
  released: string
  dateFrom: Date | null
  dateTo: Date | null
}

export async function buildReport(filter: InvoiceInputReportFilter): Promise<boolean> {
  const responseRaw = await axiosClient.post(`http://127.0.0.1:8080${URL}/report`, filter, { responseType: "blob", })
  if (responseRaw.status == 200) {
    const fileName = "Отчет"
    fileDownload(responseRaw.data, `${fileName}.xlsx`)
    return true
  } else {
    throw new Error(responseRaw.data)
  }
}

export async function createNewMaterialCostFromInvoiceInput(data: IMaterialCost): Promise<boolean> {
  const responseRaw = await axiosClient.post<IAPIResposeFormat<string[]>>(`${URL}/material-cost/new`, data)
  const response = responseRaw.data
  if (response.permission && response.success) {
    return true
  } else {
    throw new Error(response.error)
  }
}

export interface CreateFullMaterial {
  category: string
  code: string
  name: string
  unit: string
  notes: string
  article: string
  hasSerialNumber: boolean
  costPrime: number
  costM19: number
  costWithCustomer: number
}

export async function createNewMaterialFromInvoiceInput(data: CreateFullMaterial): Promise<boolean> {
  const responseRaw = await axiosClient.post<IAPIResposeFormat<string[]>>(`${URL}/material/new`, data)
  const response = responseRaw.data
  if (response.permission && response.success) {
    return true
  } else {
    throw new Error(response.error)
  }
}

export async function getInvoiceInputMaterilsWithoutSerialNumbersByID(id: number): Promise<InvoiceMaterialViewWithoutSerialNumbers[]> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<InvoiceMaterialViewWithoutSerialNumbers[]>>(`${URL}/${id}/materials/without-serial-number`)
  const response = responseRaw.data
  if (response.permission && response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}

export async function getInvoiceInputMaterilsWithSerialNumbersByID(id: number): Promise<InvoiceMaterialViewWithSerialNumbers[]> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<InvoiceMaterialViewWithSerialNumbers[]>>(`${URL}/${id}/materials/with-serial-number`)
  const response = responseRaw.data
  if (response.permission && response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}

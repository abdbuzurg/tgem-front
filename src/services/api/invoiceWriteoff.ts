import fileDownload from "js-file-download"
import { IInvoiceWriteOff, IInvoiceWriteOffMaterials, IInvoiceWriteOffView } from "../interfaces/invoiceWriteOff"
import IAPIResposeFormat from "./IAPIResposeFormat"
import axiosClient from "./axiosClient"
import { ENTRY_LIMIT } from "./constants"
import { InvoiceMaterialViewWithoutSerialNumbers } from "../interfaces/invoiceMaterial"

const URL = "/invoice-writeoff"

export interface InvoiceWriteOffPagianted {
  data: IInvoiceWriteOffView[]
  count: number
  page: number
}

export async function getPaginatedInvoiceWriteOff({ pageParam = 1}, writeOffType: string): Promise<InvoiceWriteOffPagianted> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<InvoiceWriteOffPagianted>>(`${URL}/paginated?page=${pageParam}&limit=${ENTRY_LIMIT}&writeOffType=${writeOffType}`)
  const response = responseRaw.data
  if (response.success && response.permission) {
    return {...response.data, page: pageParam}
  } else {
    throw new Error(response.error)
  }
}

export async function deleteInvoiceWriteOff(id: number): Promise<boolean> {
  const responseRaw = await axiosClient.delete<IAPIResposeFormat<string>>(`${URL}/${id}`)
  const response = responseRaw.data
  if (response.success && response.permission) {
    return true
  } else {
    throw new Error(response.error)
  }
}

export interface InvoiceWriteOffItem {
  materialCostID: number
  amount: number
  notes: string
}

export interface InvoiceWriteOffMutation {
  details: IInvoiceWriteOff
  items: InvoiceWriteOffItem[]
}

export async function createInvoiceWriteOff(data: InvoiceWriteOffMutation): Promise<InvoiceWriteOffMutation> {
  const responseRaw = await axiosClient.post<IAPIResposeFormat<InvoiceWriteOffMutation>>(`${URL}/`, data)
  const response = responseRaw.data
  if (response.permission && response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}

export async function updateInvoiceWriteOff(data: InvoiceWriteOffMutation):Promise<InvoiceWriteOffMutation> {
  const responseRaw = await axiosClient.patch<IAPIResposeFormat<InvoiceWriteOffMutation>>(`${URL}/`, data)
  const response = responseRaw.data
  if (response.permission && response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}

export async function getInvoiceWriteOffMaterilsWithoutSerialNumbersByID(id: number): Promise<InvoiceMaterialViewWithoutSerialNumbers[]> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<InvoiceMaterialViewWithoutSerialNumbers[]>>(`${URL}/${id}/materials/without-serial-number`)
  const response = responseRaw.data
  if (response.permission && response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}

export async function getInvoiceWriteOffMaterialsForEdit(id: number): Promise<IInvoiceWriteOffMaterials[]> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<IInvoiceWriteOffMaterials[]>>(`${URL}/invoice-materials/${id}`)
  const response = responseRaw.data
  if (response.permission && response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}

export interface InvoiceWriteOffConfirmationData {
  id: number
  file: File
}

export async function sendInvoiceWriteOffConfirmationExcel(data: InvoiceWriteOffConfirmationData): Promise<boolean> {
  const formData = new FormData()
  formData.append("file", data.file)
  const responseRaw = await axiosClient.post(`${URL}/confirm/${data.id}`, formData, {
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

export async function getInvoiceWriteOffDocument(deliveryCode: string): Promise<boolean> {
  const responseRaw = await axiosClient.get(`${URL}/document/${deliveryCode}`, { responseType: "blob", })
  if (responseRaw.status == 200) {
    const contentType: string = responseRaw.headers["content-type"]
    const extension = contentType.split("/")[1]
    fileDownload(responseRaw.data, `${deliveryCode}.${extension}`)
    return true
  } else {
    throw new Error(responseRaw.data)
  }
}

import fileDownload from "js-file-download"
import { IInvoiceWriteOff, IInvoiceWriteOffView } from "../interfaces/invoiceWriteOff"
import IAPIResposeFormat from "./IAPIResposeFormat"
import axiosClient from "./axiosClient"
import { ENTRY_LIMIT } from "./constants"

const URL = "/invoice/writeoff"

export interface InvoiceWriteOffPagianted {
  data: IInvoiceWriteOffView[]
  count: number
  page: number
}

export async function getPaginatedInvoiceWriteOff({ pageParam = 1}): Promise<InvoiceWriteOffPagianted> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<InvoiceWriteOffPagianted>>(`${URL}/paginated?page=${pageParam}&limit=${ENTRY_LIMIT}`)
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


export async function getInvoiceWriteOffDocument(deliveryCode: string):Promise<boolean>{
  console.log("kek")
  const responseRaw = await axiosClient.get(`http://127.0.0.1:8080${URL}/raw-document/${deliveryCode}`, { responseType: "blob" })
  if (responseRaw.status == 200) {
    fileDownload(responseRaw.data, `${deliveryCode}.xlsx`)
    return true
  } else {
    throw new Error(responseRaw.data)
  }
}
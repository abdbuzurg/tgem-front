import fileDownload from "js-file-download"
import { IInvoiceReturn, IInvoiceReturnView } from "../interfaces/invoiceReturn"
import IAPIResposeFormat from "./IAPIResposeFormat"
import axiosClient from "./axiosClient"
import { ENTRY_LIMIT } from "./constants"

const URL = "/return"

export interface InvoiceReturnPagianted {
  data: IInvoiceReturnView[]
  count: number
  page: number
}

export async function getPaginatedInvoiceReturn({ pageParam = 1}): Promise<InvoiceReturnPagianted> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<InvoiceReturnPagianted>>(`${URL}/paginated?page=${pageParam}&limit=${ENTRY_LIMIT}`)
  const response = responseRaw.data
  if (response.success && response.permission) {
    return {...response.data, page: pageParam}
  } else {
    throw new Error(response.error)
  }
}

export async function deleteInvoiceReturn(id: number): Promise<boolean> {
  const responseRaw = await axiosClient.delete<IAPIResposeFormat<string>>(`${URL}/${id}`)
  const response = responseRaw.data
  if (response.success && response.permission) {
    return true
  } else {
    throw new Error(response.error)
  }
}

export interface InvoiceReturnItem {
  materialCostID: number
  amount: number
}

export interface InvoiceReturnMutation {
  details: IInvoiceReturn
  items: InvoiceReturnItem[]
}

export async function createInvoiceReturn(data: InvoiceReturnMutation): Promise<InvoiceReturnMutation> {
  const responseRaw = await axiosClient.post<IAPIResposeFormat<InvoiceReturnMutation>>(`${URL}/`, data)
  const response = responseRaw.data
  if (response.permission && response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}

export async function updateInvoiceReturn(data: InvoiceReturnMutation):Promise<InvoiceReturnMutation> {
  const responseRaw = await axiosClient.patch<IAPIResposeFormat<InvoiceReturnMutation>>(`${URL}/`, data)
  const response = responseRaw.data
  if (response.permission && response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}

export async function getInvoiceReturnDocument(deliveryCode: string):Promise<boolean>{
  const responseRaw = await axiosClient.get(`http://127.0.0.1:8080${URL}/document/${deliveryCode}`, { responseType: "blob" })
  if (responseRaw.status == 200) {
    fileDownload(responseRaw.data, `${deliveryCode}.xlsx`)
    return true
  } else {
    throw new Error(responseRaw.data)
  }
}

export async function sendInvoiceReturnConfirmationExcel(id: number, data: File): Promise<boolean> {
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

export async function getUniqueCode(): Promise<string[]>{
  const responseRaw = await axiosClient.get<IAPIResposeFormat<string[]>>(`${URL}/unique/code`)
  const response = responseRaw.data
  if (response.permission && response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}

export async function getUniqueTeam(): Promise<string[]>{
  const responseRaw = await axiosClient.get<IAPIResposeFormat<string[]>>(`${URL}/unique/team`)
  const response = responseRaw.data
  if (response.permission && response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}

export async function getUniqueObject(): Promise<string[]>{
  const responseRaw = await axiosClient.get<IAPIResposeFormat<string[]>>(`${URL}/unique/object`)
  const response = responseRaw.data
  if (response.permission && response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}

export interface InvoiceReturnReportFilter {
  code: string
  returnerType: "all" | "teams" | "objects"
  returner: string
  dateFrom: Date | null
  dateTo: Date | null
}

export async function buildReport(filter: InvoiceReturnReportFilter): Promise<boolean> {
  const responseRaw = await axiosClient.post(`http://127.0.0.1:8080${URL}/report`, filter, { responseType: "blob", })
  if (responseRaw.status == 200) {
    const fileName = "Отчет"
    fileDownload(responseRaw.data, `${fileName}.xlsx`)
    return true
  } else {
    throw new Error(responseRaw.data)
  }
}

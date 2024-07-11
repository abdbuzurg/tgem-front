import fileDownload from "js-file-download"
import IAPIResposeFormat from "./IAPIResposeFormat"
import axiosClient from "./axiosClient"
import { ENTRY_LIMIT } from "./constants"
import { InvoiceMaterialViewWithSerialNumbers, InvoiceMaterialViewWithoutSerialNumbers } from "../interfaces/invoiceMaterial"
import { IInvoiceOutputInProject, IInvoiceOutputInProjectView, IInvoiceOutputMaterials } from "../interfaces/invoiceOutputInProject"

const URL = "/output"

export interface InvoiceOutputInProjectPagianted {
  data: IInvoiceOutputInProjectView[]
  count: number
  page: number
}

export async function getPaginatedInvoiceOutputInProject({ pageParam = 1}): Promise<InvoiceOutputInProjectPagianted> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<InvoiceOutputInProjectPagianted>>(`${URL}/paginated?page=${pageParam}&limit=${ENTRY_LIMIT}`)
  const response = responseRaw.data
  if (response.success && response.permission) {
    return {...response.data, page: pageParam}
  } else {
    throw new Error(response.error)
  }
}

export async function deleteInvoiceOutputInProject(id: number): Promise<boolean> {
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

export interface InvoiceOutputInProjectMutation {
  details: IInvoiceOutputInProject
  items: InvoiceOutputItem[]
}

export async function createInvoiceOutputInProject(data: InvoiceOutputInProjectMutation): Promise<InvoiceOutputInProjectMutation> {
  const responseRaw = await axiosClient.post<IAPIResposeFormat<InvoiceOutputInProjectMutation>>(`${URL}/`, data)
  const response = responseRaw.data
  if (response.permission && response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}

export async function updateInvoiceOutputInProject(data: InvoiceOutputInProjectMutation):Promise<InvoiceOutputInProjectMutation> {
  const responseRaw = await axiosClient.patch<IAPIResposeFormat<InvoiceOutputInProjectMutation>>(`${URL}/`, data)
  const response = responseRaw.data
  if (response.permission && response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}

export async function getInvoiceOutputInProjectDocument(deliveryCode: string):Promise<boolean>{
  const responseRaw = await axiosClient.get(`${URL}/document/${deliveryCode}`, { responseType: "blob" })
  if (responseRaw.status == 200) {
    fileDownload(responseRaw.data, `${deliveryCode}.xlsx`)
    return true
  } else {
    throw new Error(responseRaw.data)
  }
}

export interface InvoiceOutputInProjectConfirmation {
  id: number
  file: File
}

export async function sendInvoiceOutputInProjectConfirmationExcel(data: InvoiceOutputInProjectConfirmation): Promise<boolean> {
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
  const responseRaw = await axiosClient.post(`${URL}/report`, filter, { responseType: "blob", })
  if (responseRaw.status == 200) {
    const date = new Date()
    const fileName = `Отчет Накладной Отпуск - ${date}`
    fileDownload(responseRaw.data, `${fileName}.xlsx`)
    return true
  } else {
    throw new Error(responseRaw.data)
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

export interface AvailableMaterial{
	id: number
	name: string
	unit: string
	hasSerialNumber: boolean
	amount: number
}

export async function getAvailableMaterialsInWarehouse():Promise<AvailableMaterial[]> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<AvailableMaterial[]>>(`${URL}/material/available-in-warehouse`)
  const response = responseRaw.data
  if (response.permission && response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}

export async function getInvoiceOutputMaterilsWithoutSerialNumbersByID(id: number): Promise<InvoiceMaterialViewWithoutSerialNumbers[]> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<InvoiceMaterialViewWithoutSerialNumbers[]>>(`${URL}/${id}/materials/without-serial-number`)
  const response = responseRaw.data
  if (response.permission && response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}

export async function getInvoiceOutputMaterilsWithSerialNumbersByID(id: number): Promise<InvoiceMaterialViewWithSerialNumbers[]> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<InvoiceMaterialViewWithSerialNumbers[]>>(`${URL}/${id}/materials/with-serial-number`)
  const response = responseRaw.data
  if (response.permission && response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}

export async function getInvoiceOutputInProjectMaterialsForEdit(id: number): Promise<IInvoiceOutputMaterials[]> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<IInvoiceOutputMaterials[]>>(`${URL}/invoice-materials/${id}`)
  const response = responseRaw.data
  if (response.permission && response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}



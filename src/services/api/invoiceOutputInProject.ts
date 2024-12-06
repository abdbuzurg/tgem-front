import fileDownload from "js-file-download"
import IAPIResposeFormat from "./IAPIResposeFormat"
import axiosClient from "./axiosClient"
import { ENTRY_LIMIT } from "./constants"
import { InvoiceMaterialViewWithSerialNumbers, InvoiceMaterialViewWithoutSerialNumbers } from "../interfaces/invoiceMaterial"
import { IInvoiceOutputInProject, IInvoiceOutputInProjectView, IInvoiceOutputMaterials } from "../interfaces/invoiceOutputInProject"
import IReactSelectOptions from "../interfaces/react-select"

const URL = "/output"

export interface InvoiceOutputInProjectPagianted {
  data: IInvoiceOutputInProjectView[]
  count: number
  page: number
}

export async function getPaginatedInvoiceOutputInProject({ pageParam = 1 }): Promise<InvoiceOutputInProjectPagianted> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<InvoiceOutputInProjectPagianted>>(`${URL}/paginated?page=${pageParam}&limit=${ENTRY_LIMIT}`)
  const response = responseRaw.data
  if (response.success && response.permission) {
    return { ...response.data, page: pageParam }
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

export async function updateInvoiceOutputInProject(data: InvoiceOutputInProjectMutation): Promise<InvoiceOutputInProjectMutation> {
  const responseRaw = await axiosClient.patch<IAPIResposeFormat<InvoiceOutputInProjectMutation>>(`${URL}/`, data)
  const response = responseRaw.data
  if (response.permission && response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}

export async function getInvoiceOutputInProjectDocument(deliveryCode: string, confirmation: boolean): Promise<boolean> {
  const responseRaw = await axiosClient.get(`${URL}/document/${deliveryCode}`, { responseType: "blob" })
  if (responseRaw.status == 200) {
    if (confirmation) {
      fileDownload(responseRaw.data, `${deliveryCode}.pdf`)
    } else {
      fileDownload(responseRaw.data, `${deliveryCode}.xlsx`)
    }
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
  if (responseRaw.data.success && responseRaw.data.permission) {
    if (typeof responseRaw.data == 'object') {
      const response: IAPIResposeFormat<string> = responseRaw.data
      if (response.success && response.permission) {
        return true
      } else {
        throw new Error(response.error)
      }
    }

    return true
  } else {
    throw new Error(responseRaw.data.error)
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

export async function getAllUniqueCode(): Promise<IReactSelectOptions<string>[]> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<IReactSelectOptions<string>[]>>(`${URL}/unique/code`)
  const response = responseRaw.data
  if (response.permission || response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}

export async function getAllUniqueDistrict(): Promise<IReactSelectOptions<number>[]> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<IReactSelectOptions<number>[]>>(`${URL}/unique/district`)
  const response = responseRaw.data
  if (response.permission || response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}

export async function getAllUniqueWarehouseManager(): Promise<IReactSelectOptions<number>[]> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<IReactSelectOptions<number>[]>>(`${URL}/unique/warehouse-manager`)
  const response = responseRaw.data
  if (response.permission || response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}

export async function getAllUniqueRecieved(): Promise<IReactSelectOptions<number>[]> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<IReactSelectOptions<number>[]>>(`${URL}/unique/recieved`)
  const response = responseRaw.data
  if (response.permission || response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}

export async function getAllUniqueTeam(): Promise<IReactSelectOptions<number>[]> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<IReactSelectOptions<number>[]>>(`${URL}/unique/team`)
  const response = responseRaw.data
  if (response.permission || response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}

export interface InvoiceOutputReportFilter {
  code: string
  warehouseManagerID: number
  recievedID: number
  districtID: number
  teamID: number
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

export async function getSerialNumberCodesByMaterialID(materialID: number): Promise<string[]> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<string[]>>(`${URL}/serial-number/material/${materialID}`)
  const response = responseRaw.data
  if (response.permission && response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}

export interface AvailableMaterial {
  id: number
  name: string
  unit: string
  hasSerialNumber: boolean
  amount: number
}

export async function getAvailableMaterialsInWarehouse(): Promise<AvailableMaterial[]> {
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

export async function importInvoiceOutput(file: File): Promise<boolean> {
  const formData = new FormData()
  formData.append("file", file)
  const responseRaw = await axiosClient.post(`${URL}/import`, formData, {
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



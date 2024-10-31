import fileDownload from "js-file-download"
import { IInvoiceInput, IInvoiceInputMaterials, IInvoiceInputView } from "../interfaces/invoiceInput"
import { InvoiceMaterial, InvoiceMaterialViewWithSerialNumbers, InvoiceMaterialViewWithoutSerialNumbers, } from "../interfaces/invoiceMaterial"
import IAPIResposeFormat from "./IAPIResposeFormat"
import axiosClient from "./axiosClient"
import { ENTRY_LIMIT } from "./constants"
import { IMaterialCost } from "../interfaces/materialCost"
import IReactSelectOptions from "../interfaces/react-select"

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
  const responseRaw = await axiosClient.get(`${URL}/document/${deliveryCode}`, { responseType: "blob", })
  if (responseRaw.status == 200) {
    if (typeof responseRaw.data == "object") {
      const response: IAPIResposeFormat<null> = responseRaw.data
      if (!response.success || !response.permission) {
        throw new Error(response.error)
      }

      return true
    }
    const contentType: string = responseRaw.headers["content-type"]
    const extension = contentType.split("/")[1]
    fileDownload(responseRaw.data, `${deliveryCode}.${extension}`)
    return true
  } else {
    throw new Error(responseRaw.data)
  }
}

export interface InvoiceInputConfirmationData {
  id: number
  file: File
}

export async function sendInvoiceInputConfirmationExcel(data: InvoiceInputConfirmationData): Promise<boolean> {
  const formData = new FormData()
  formData.append("file", data.file)
  const responseRaw = await axiosClient.post(`${URL}/confirm/${data.id}`, formData, {
    headers: {
      "Content-Type": `multipart/form-data; boundary=WebAppBoundary`,
    }
  })
  if (responseRaw.status == 200) {
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
    throw new Error(responseRaw.data)
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

export async function getAllUniqueWarehouseManager(): Promise<IReactSelectOptions<number>[]> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<IReactSelectOptions<number>[]>>(`${URL}/unique/warehouse-manager`)
  const response = responseRaw.data
  if (response.permission || response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}

export async function getAllUniqueReleased(): Promise<IReactSelectOptions<number>[]> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<IReactSelectOptions<number>[]>>(`${URL}/unique/released`)
  const response = responseRaw.data
  if (response.permission || response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}

export interface InvoiceInputReportFilter {
  code: string
  warehouseManagerID: number
  releasedID: number
  dateFrom: Date | null
  dateTo: Date | null
}

export async function buildReport(filter: InvoiceInputReportFilter): Promise<boolean> {
  const responseRaw = await axiosClient.post(`${URL}/report`, filter, { responseType: "blob", })
  if (responseRaw.status == 200) {
    const date = new Date()
    const fileName = `Отчет Накладной Приход ${date}`
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

export async function getInvoiceInputMaterialsForEdit(id: number): Promise<IInvoiceInputMaterials[]> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<IInvoiceInputMaterials[]>>(`${URL}/invoice-materials/${id}`)
  const response = responseRaw.data
  if (response.permission && response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}

export async function importInvoiceInput(file: File): Promise<boolean> {
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



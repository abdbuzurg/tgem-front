import IAPIResposeFormat from "./IAPIResposeFormat"
import axiosClient from "./axiosClient"

export interface InvoiceMaterialView {
  id: number
  materialName: string
  materialPrice: number
  invoiceID: number
  invoiceType: string
  amount: number
  notes: string
  unit: string
}

export default async function getInvoiceMaterialsByInvoice(invoiceType: string, invoiceID: number): Promise<InvoiceMaterialView[]> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<InvoiceMaterialView[]>>(`/invoice-materials/invoice/${invoiceType}/${invoiceID}`)
  const response = responseRaw.data
  if (response.success && response.permission) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}
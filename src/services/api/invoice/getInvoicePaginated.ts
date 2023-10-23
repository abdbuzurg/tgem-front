import IAPIResposeFormat from "../IAPIResposeFormat";
import axiosClient from "../axiosClient";

export interface InvoicePaginatedData {
  id: number
  deliveryCode: string
  warehouseManagerName: string
  releasedName: string
  objectName: string
  dateOfInvoice: string
}

export interface InvoicePaginatedDataResponse {
  data: InvoicePaginatedData[]
  count: number
  page: number
}

export default async function getInvoicePaginated(invoiceType: string, {pageParam = 1}): Promise<InvoicePaginatedDataResponse> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<InvoicePaginatedDataResponse>>(`/invoice/${invoiceType}/paginated`)
  const response = responseRaw.data
  if (response.success && response.permission) {
    return {...response.data, page: pageParam}
  } else {
    throw new Error(response.error)
  }
}

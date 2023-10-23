import { IInvoice } from "../../interfaces/invoice";
import IAPIResposeFormat from "../IAPIResposeFormat";
import axiosClient from "../axiosClient";

export default async function getByInvoiceID(invoiceType: string, id: number): Promise<IInvoice> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<IInvoice>>(`/invoice/${invoiceType}/${id}`)
  const response = responseRaw.data
  if (response.success && response.permission) {
    return response.data
  } else {
    throw new Error(response.error)
  }
} 
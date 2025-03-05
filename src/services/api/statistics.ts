import IAPIResposeFormat from "./IAPIResposeFormat"
import axiosClient from "./axiosClient"

const URL = "/statistics"

export interface PieChartStat {
  id: number
  value: number
  label: string
}

export async function invoiceCountStat(): Promise<PieChartStat[]> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<PieChartStat[]>>(`${URL}/invoice-count`)
  const response = responseRaw.data
  if (response.success || response.permission) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}

export async function invoiceInputCreatorStat(): Promise<PieChartStat[]> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<PieChartStat[]>>(`${URL}/invoice-input-creator`)
  const response = responseRaw.data
  if (response.success || response.permission) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}

export async function invoiceOutputCreatorStat(): Promise<PieChartStat[]> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<PieChartStat[]>>(`${URL}/invoice-output-creator`)
  const response = responseRaw.data
  if (response.success || response.permission) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}

export async function materialInInvoice(materialID: number): Promise<PieChartStat[]> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<PieChartStat[]>>(`${URL}/material/invoice/${materialID}`)
  const response = responseRaw.data
  if (response.success || response.permission) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}

export async function materialInLocation(materialID: number): Promise<PieChartStat[]> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<PieChartStat[]>>(`${URL}/material/location/${materialID}`)
  const response = responseRaw.data
  if (response.success || response.permission) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}

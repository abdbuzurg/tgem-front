import fileDownload from "js-file-download"
import IAPIResposeFormat from "./IAPIResposeFormat"
import axiosClient from "./axiosClient"

const URL = "/material-location"

export async function getAllUniqueTeams() {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<string[]>>(`${URL}/unique/team`)
  const response = responseRaw.data
  if (response.permission || response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}

export async function getAllUniqueObjects() {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<string[]>>(`${URL}/unique/object`)
  const response = responseRaw.data
  if (response.permission || response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}

export interface ReportBalanceFilter {
  type: string
  team: string
  object: string
}

export async function buildReportBalance(filter: ReportBalanceFilter): Promise<boolean> {
  const responseRaw = await axiosClient.post(`http://127.0.0.1:8080${URL}/report/balance`, filter, { responseType: "blob", })
  if (responseRaw.status == 200) {
    const fileName = "Отчет"
    fileDownload(responseRaw.data, `${fileName}.xlsx`)
    return true
  } else {
    throw new Error(responseRaw.data)
  }
}
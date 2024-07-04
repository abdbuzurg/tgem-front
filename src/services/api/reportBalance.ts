import fileDownload from "js-file-download"
import IAPIResposeFormat from "./IAPIResposeFormat"
import axiosClient from "./axiosClient"
import { TeamDataForSelect } from "../interfaces/teams"
import { ObjectDataForSelect } from "../interfaces/objects"

const URL = "/material-location"

export async function getAllUniqueTeams(): Promise<TeamDataForSelect[]> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<TeamDataForSelect[]>>(`${URL}/unique/team`)
  const response = responseRaw.data
  if (response.permission || response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}

export async function getAllUniqueObjects(): Promise<ObjectDataForSelect[]> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<ObjectDataForSelect[]>>(`${URL}/unique/object`)
  const response = responseRaw.data
  if (response.permission || response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}

export interface ReportBalanceFilter {
  type: string
  teamID: number
  objectID: number
}

export async function buildReportBalance(filter: ReportBalanceFilter): Promise<boolean> {
  const responseRaw = await axiosClient.post(`${URL}/report/balance`, filter, { responseType: "blob", })
  if (responseRaw.status == 200) {
    const fileName = "Отчет Остатка"
    fileDownload(responseRaw.data, `${fileName}.xlsx`)
    return true
  } else {
    throw new Error(responseRaw.data)
  }
}

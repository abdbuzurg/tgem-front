import fileDownload from "js-file-download"
import { ITeam, TeamDataForSelect } from "../interfaces/teams"
import IAPIResposeFormat from "./IAPIResposeFormat"
import axiosClient from "./axiosClient"
import { ENTRY_LIMIT } from "./constants"

const URL = "/team"

export interface TeamMutation {
  company: string,
  id: number,
  leaderIDs: number[],
  mobileNumber: string,
  number: string,
}

export async function createTeam(data: TeamMutation): Promise<ITeam> {
  const responseRaw = await axiosClient.post<IAPIResposeFormat<ITeam>>(`${URL}/`, data)
  const response = responseRaw.data
  if (response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}

export async function deleteTeam(key: number) {
  const responseRaw = await axiosClient.delete<IAPIResposeFormat<boolean>>(`${URL}/${key}`)
  const response = responseRaw.data
  if (response.success) {
    return response.success
  } else {
    throw new Error(response.error)
  }
}

export async function getAllTeams(): Promise<ITeam[]> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<ITeam[]>>(`${URL}/all`)
  const response = responseRaw.data
  if (response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}

export interface TeamGetAllResponse {
  data: TeamPaginated[]
  count: number
  page: number
}

export interface TeamPaginated extends Omit<ITeam, "leaderWorkerID">{
  leaderNames: string[]
  objects: string[]
}

export async function getPaginatedTeams({pageParam = 1}): Promise<TeamGetAllResponse> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<TeamGetAllResponse>>(`${URL}/paginated?page=${pageParam}&limit=${ENTRY_LIMIT}`)
  const responseData = responseRaw.data
  if (responseData.success) {
    return {...responseData.data, page: pageParam}
  } else {
    throw new Error(responseData.error)
  }
}

export async function getTeamByKey(key: number): Promise<ITeam> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<ITeam>>(`${URL}/${key}`)
  const response = responseRaw.data
  if (response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}

export async function updateTeam(data: TeamMutation): Promise<ITeam> {
  const responseRaw = await axiosClient.patch<IAPIResposeFormat<ITeam>>(`${URL}/`, data)
  const response = responseRaw.data
  if (response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}

export async function getTeamTemplateDocument(): Promise<boolean> {
  const response = await axiosClient.get(`${URL}/document/template`, { responseType: "blob" })
  if (response.status == 200) {
    fileDownload(response.data, "Шаблон для импорта Бригад.xlsx")
    return true
  } else {
    throw new Error(response.statusText)
  }
}

export async function importTeam(data: File): Promise<boolean> {
  const formData = new FormData()
  formData.append("file", data)
  const responseRaw = await axiosClient.post(`${URL}/document/import`, formData, {
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

export async function getAllTeamsForSelect(): Promise<TeamDataForSelect[]> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<TeamDataForSelect[]>>(`${URL}/all/for-select`)
  const response = responseRaw.data
  if (response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}


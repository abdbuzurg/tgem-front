import fileDownload from "js-file-download"
import { ITeam, TeamDataForSelect } from "../interfaces/teams"
import IAPIResposeFormat from "./IAPIResposeFormat"
import axiosClient from "./axiosClient"
import { ENTRY_LIMIT } from "./constants"
import isCorrectResponseFormat from "../lib/typeGuardForResponse"

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
}

export interface TeamSearchParameters {
  number: string
  leaderID: number
  mobileNumber: string
  company: string
}

export async function getPaginatedTeams({pageParam = 1}, searchParameters: TeamSearchParameters): Promise<TeamGetAllResponse> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<TeamGetAllResponse>>(`${URL}/paginated?page=${pageParam}&limit=${ENTRY_LIMIT}&number=${searchParameters.number}&leaderID=${searchParameters.leaderID}&mobileNumber=${searchParameters.mobileNumber}&company=${searchParameters.company}`)
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
    if (typeof responseRaw.data == 'object') {
      const response: IAPIResposeFormat<string> = responseRaw.data
      if (!response.success) {
        throw new Error(response.error)
      } else {
        return true
      }
    } else {
      return true
    }
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

export async function exportTeam(): Promise<boolean> {
  const responseRaw = await axiosClient.get(`${URL}/document/export`, { responseType: "blob" })
  if (isCorrectResponseFormat<null>(responseRaw.data)) {
    const response = responseRaw.data as IAPIResposeFormat<null>
    throw new Error(response.error)
  } else {
    if (responseRaw.status == 200) {
      fileDownload(responseRaw.data, "Эспорт Материалов.xlsx")
      return true
    } else {
      throw new Error(responseRaw.statusText)
    }
  }
}

export async function getAllUniqueNumber(): Promise<string[]> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<string[]>>(`${URL}/unique/team-number`)
  const response = responseRaw.data
  if (response.success && response.permission) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}

export async function getAllUniqueMobileNumber(): Promise<string[]> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<string[]>>(`${URL}/unique/mobile-number`)
  const response = responseRaw.data
  if (response.success && response.permission) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}

export async function getAllUniqueCompany(): Promise<string[]> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<string[]>>(`${URL}/unique/team-company`)
  const response = responseRaw.data
  if (response.success && response.permission) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}

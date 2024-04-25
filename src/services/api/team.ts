import { ITeam } from "../interfaces/teams"
import IAPIResposeFormat from "./IAPIResposeFormat"
import axiosClient from "./axiosClient"
import { ENTRY_LIMIT } from "./constants"

const URL = "/team"

export interface TeamMutation {
  company: string,
  id: number,
  leaderWorkerID: number,
  mobileNumber: string,
  number: string,
  objects: number[]
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
  leaderName: string
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

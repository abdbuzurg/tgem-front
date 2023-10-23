import { ITeam } from "../../interfaces/teams"
import IAPIResposeFormat from "../IAPIResposeFormat"
import axiosClient from "../axiosClient"
import { ENTRY_LIMIT } from "../constants"

export interface TeamGetAllResponse {
  data: TeamPaginated[]
  count: number
  page: number
}

export interface TeamPaginated extends Omit<ITeam, "leaderWorkerID">{
  leaderName: string
}


export default async function getPaginatedTeams({pageParam = 1}): Promise<TeamGetAllResponse> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<TeamGetAllResponse>>(`/team/paginated?page=${pageParam}&limit=${ENTRY_LIMIT}`)
  const responseData = responseRaw.data
  if (responseData.success) {
    return {...responseData.data, page: pageParam}
  } else {
    throw new Error(responseData.error)
  }
}
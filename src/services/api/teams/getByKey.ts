import { ITeam } from "../../interfaces/teams";
import IAPIResposeFormat from "../IAPIResposeFormat";
import axiosClient from "../axiosClient";

export default async function getTeamByKey(key: number): Promise<ITeam> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<ITeam>>(`/team/${key}`)
  const response = responseRaw.data
  if (response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}
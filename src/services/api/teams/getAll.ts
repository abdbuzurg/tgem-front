import { ITeam } from "../../interfaces/teams";
import IAPIResposeFormat from "../IAPIResposeFormat";
import axiosClient from "../axiosClient";

export default async function getAllTeams(): Promise<ITeam[]> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<ITeam[]>>("/team/all")
  const response = responseRaw.data
  if (response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}
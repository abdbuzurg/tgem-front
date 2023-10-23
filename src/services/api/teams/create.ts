import { ITeam } from "../../interfaces/teams";
import IAPIResposeFormat from "../IAPIResposeFormat";
import axiosClient from "../axiosClient";

export default async function createTeam(data: ITeam): Promise<ITeam> {
  const responseRaw = await axiosClient.post<IAPIResposeFormat<ITeam>>(`/team/`, data)
  const response = responseRaw.data
  if (response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}
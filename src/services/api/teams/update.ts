import { ITeam } from "../../interfaces/teams";
import IAPIResposeFormat from "../IAPIResposeFormat";
import axiosClient from "../axiosClient";

export default async function updateTeam(data: ITeam): Promise<ITeam> {
  const responseRaw = await axiosClient.patch<IAPIResposeFormat<ITeam>>(`/team/`, data)
  const response = responseRaw.data
  if (response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}
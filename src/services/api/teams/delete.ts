import IAPIResposeFormat from "../IAPIResposeFormat";
import axiosClient from "../axiosClient";

export default async function deleteTeam(key: number) {
  const responseRaw = await axiosClient.delete<IAPIResposeFormat<boolean>>(`/team/${key}`)
  const response = responseRaw.data
  if (response.success) {
    return response.success
  } else {
    throw new Error(response.error)
  }
}
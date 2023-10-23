import IUsers from "../../interfaces/users";
import IAPIResposeFormat from "../IAPIResposeFormat";
import axiosClient from "../axiosClient";

export default async function deleteUser(key: string) {
  const responseRaw = await axiosClient.delete<IAPIResposeFormat<IUsers[]>>(`/users/${key}`)
  const response = responseRaw.data
  return response.success
}
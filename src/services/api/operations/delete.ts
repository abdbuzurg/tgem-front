import IAPIResposeFormat from "../IAPIResposeFormat";
import axiosClient from "../axiosClient";

export default async function deleteOperation(key: number) {
  const responseRaw = await axiosClient.delete<IAPIResposeFormat<boolean>>(`/operation/${key}`)
  const response = responseRaw.data
  if (response.success) {
    return response.success
  } else {
    throw new Error(response.error)
  }
}
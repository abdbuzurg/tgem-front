import IAPIResposeFormat from "../IAPIResposeFormat";
import axiosClient from "../axiosClient";

export default async function deleteObject(key: number) {
  const responseRaw = await axiosClient.delete<IAPIResposeFormat<boolean>>(`/object/${key}`)
  const response = responseRaw.data
  if (response.success) {
    return response.success
  } else {
    throw new Error(response.error)
  }
}
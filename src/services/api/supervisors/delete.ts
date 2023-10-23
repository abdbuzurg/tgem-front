import IAPIResposeFormat from "../IAPIResposeFormat";
import axiosClient from "../axiosClient";

export default async function deleteSupervisor(key: number): Promise<boolean> {
  const responseRaw = await axiosClient.delete<IAPIResposeFormat<undefined>>(`/tbl_supervisor/${key}`)
  const response = responseRaw.data
  if (response.success) {
    return true
  } else {
    throw new Error(response.error)
  }
}
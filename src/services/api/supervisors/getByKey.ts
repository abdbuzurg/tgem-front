import Tbl_Supervisor from "../../interfaces/supervisors";
import IAPIResposeFormat from "../IAPIResposeFormat";
import axiosClient from "../axiosClient";

export default async function getByKeySupervisor(key: number):Promise<Tbl_Supervisor> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<Tbl_Supervisor>>(`/tbl_supervisor/${key}`)
  const response = responseRaw.data
  if (response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}
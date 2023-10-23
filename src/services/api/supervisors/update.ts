import Tbl_Supervisor from "../../interfaces/supervisors";
import IAPIResposeFormat from "../IAPIResposeFormat";
import axiosClient from "../axiosClient";

export default async function updateSupervisor(data: Tbl_Supervisor): Promise<Tbl_Supervisor> {
  const responseRaw = await axiosClient.patch<IAPIResposeFormat<Tbl_Supervisor>>("/tbl_supervisor/", data)
  const response = responseRaw.data
  if (response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}
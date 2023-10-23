import Tbl_Supervisor from "../../interfaces/supervisors";
import IAPIResposeFormat from "../IAPIResposeFormat";
import axiosClient from "../axiosClient";

export default async function getAllSupervisors() {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<Tbl_Supervisor[]>>("/tbl_supervisor/")
  const response = responseRaw.data
  if (response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}
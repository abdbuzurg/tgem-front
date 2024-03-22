import Project from "../interfaces/project"
import IAPIResposeFormat from "./IAPIResposeFormat"
import axiosClient from "./axiosClient"

const URL = "/project"

export async function GetAllProjects(): Promise<Project[]> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<Project[]>>(`${URL}/all`)
  const response = responseRaw.data
  if (response.success && response.permission) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}
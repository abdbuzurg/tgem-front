import Project from "../interfaces/project"
import IAPIResposeFormat from "./IAPIResposeFormat"
import axiosClient from "./axiosClient"
import { ENTRY_LIMIT } from "./constants"

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

export interface ProjectPaginatedData {
  data: Project[]
  count: number
  page: number
}

export async function getProjectsPaginated({pageParam = 1}): Promise<ProjectPaginatedData> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<ProjectPaginatedData>>(`${URL}/paginated?page=${pageParam}&limit=${ENTRY_LIMIT}`)
  const response = responseRaw.data
  if (response.permission && response.success) {
    return {...response.data, page: pageParam}
  } else {
    throw new Error(response.error)
  }
}

export async function deleteProject(id: number): Promise<boolean>{
  const responseRaw = await axiosClient.delete<IAPIResposeFormat<string>>(`${URL}/${id}`, )
  const response = responseRaw.data
  if (response.permission && response.success && response.data == "deleted") {
    return true
  } else {
    throw new Error(response.error)
  }
}

export async function createProject(data: Project): Promise<Project>{
  const responseRaw = await axiosClient.post<IAPIResposeFormat<Project>>(`${URL}/`, data)
  const response = responseRaw.data
  if (response.permission && response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}

export async function updateProject(data: Project): Promise<Project>{
  const responseRaw = await axiosClient.patch<IAPIResposeFormat<Project>>(`${URL}/`, data)
  const response = responseRaw.data
  if (response.permission && response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}



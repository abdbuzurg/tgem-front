import { IDistrict } from "../interfaces/district";
import IAPIResposeFormat from "./IAPIResposeFormat";
import axiosClient from "./axiosClient";
import { ENTRY_LIMIT } from "./constants";

export async function getAllDistricts():Promise<IDistrict[]> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<IDistrict[]>>("/district/all")
  const response = responseRaw.data
  if (response.permission && response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}

export interface DistrictsPaginatedData {
  data: IDistrict[]
  count: number
  page: number
}

export async function getDistrictsPaginated({pageParam = 1}): Promise<DistrictsPaginatedData> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<DistrictsPaginatedData>>(`/district/paginated?page=${pageParam}&limit=${ENTRY_LIMIT}`)
  const response = responseRaw.data
  if (response.permission && response.success) {
    return {...response.data, page: pageParam}
  } else {
    throw new Error(response.error)
  }
}

export async function createDistrict(data: IDistrict): Promise<IDistrict>{
  const responseRaw = await axiosClient.post<IAPIResposeFormat<IDistrict>>(`/district/`, data)
  const response = responseRaw.data
  if (response.permission && response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}

export async function updateDistrict(data: IDistrict): Promise<IDistrict>{
  const responseRaw = await axiosClient.patch<IAPIResposeFormat<IDistrict>>(`/district/`, data)
  const response = responseRaw.data
  if (response.permission && response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}

export async function deleteDistrict(id: number): Promise<boolean>{
  const responseRaw = await axiosClient.delete<IAPIResposeFormat<string>>(`/district/${id}`, )
  const response = responseRaw.data
  if (response.permission && response.success && response.data == "deleted") {
    return true
  } else {
    throw new Error(response.error)
  }
}




import IAPIResposeFormat from "../IAPIResposeFormat";
import axiosClient from "../axiosClient";

interface UniqueColumnData {
  kod_material: string[]
  name_material: string[]
  cat_material: string[]
}

export default async function getMaterialCategories():Promise<string[]> {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<UniqueColumnData>>("/material/unique-column-data")
  const response = responseRaw.data
  if (response.success) {
    return response.data.cat_material
  } else {
    throw new Error(response.error)
  }
}
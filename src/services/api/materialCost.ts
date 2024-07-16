import fileDownload from "js-file-download"
import axiosClient from "./axiosClient"
import IAPIResposeFormat from "./IAPIResposeFormat"
import isCorrectResponseFormat from "../lib/typeGuardForResponse"

const URL = "/material-cost"

export async function getMaterialCostTemplateDocument(): Promise<boolean> {
  const response = await axiosClient.get(`${URL}/document/template`, { responseType: "blob" })
  if (response.status == 200) {
    fileDownload(response.data, "Шаблон для импорта ценников для материалов.xlsx")
    return true
  } else {
    throw new Error(response.statusText)
  }
}

export async function importMaterialCost(data: File): Promise<boolean> {
  const formData = new FormData()
  formData.append("file", data)
  const responseRaw = await axiosClient.post<IAPIResposeFormat<null>>(`${URL}/document/import`, formData, {
    headers: {
      "Content-Type": `multipart/form-data; boundary=WebAppBoundary`,
    }
  })
  const response = responseRaw.data
  if (response.success) {
    return true
  } else {
    throw new Error(response.error)
  }
}

export async function exportMaterialCosts(): Promise<boolean> {
  const responseRaw = await axiosClient.get(`${URL}/document/export`, { responseType: "blob" })
  if (isCorrectResponseFormat<null>(responseRaw.data)) {
    const response = responseRaw.data as IAPIResposeFormat<null>
    throw new Error(response.error)
  } else {
    if (responseRaw.status == 200) {
      fileDownload(responseRaw.data, "Эспорт Материалов.xlsx")
      return true
    } else {
      throw new Error(responseRaw.statusText)
    }
  }
}


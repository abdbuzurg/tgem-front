import fileDownload from "js-file-download"
import axiosClient from "./axiosClient"

const URL = "/main-reports"

export async function projectProgressReport(): Promise<boolean> {
  const responseRaw = await axiosClient.get(`${URL}/project-progress`, { responseType: "blob", })
  if (responseRaw.status == 200) {
    fileDownload(responseRaw.data, "Прогресс Реализации Проекта.xlsx")
    return true
  } else {
    throw new Error("Неизветсная ошибка при создании отсчета")
  }
}

export async function analysisOfRemainingMaterials(): Promise<boolean> {
  const responseRaw = await axiosClient.get(`${URL}/analysis-of-remaining-materials`, { responseType: "blob", })
  if (responseRaw.status == 200) {
    fileDownload(responseRaw.data, "Аналитика Остатка Материалов.xlsx")
    return true
  } else {
    throw new Error("Неизветсная ошибка при создании отсчета")
  }
}

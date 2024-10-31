import { useMutation } from "@tanstack/react-query"
import toast from "react-hot-toast"
import { analysisOfRemainingMaterials, projectProgressReport } from "../services/api/mainReports"

const mainReportTitles = [
  "Прогресс Реализации Проекта",
  "Аналитика Остатка Материалов"
]

export default function MainReports() {

  const projectProgressReportMutation = useMutation<boolean, Error>({
    mutationFn: projectProgressReport,
  })

  const analysisOfRemainingMaterialsMutation = useMutation<boolean, Error>({
    mutationFn: analysisOfRemainingMaterials,
  })

  const getReport = (val: string) => {
    const loadingToast = toast.loading("Идет формирование отсчета...")
    switch (val) {
      case "Прогресс Реализации Проекта":
        projectProgressReportMutation.mutate(undefined, {
          onSuccess: () => {
            toast.dismiss(loadingToast)
            toast.success("Отсчет готов к скачиванию")
          },
          onError: (err: Error) => {
            toast.dismiss(loadingToast)
            toast.error(`Ошибка при создании отсчета: ${err.message}`)
          }
        })
        break
      case "Аналитика Остатка Материалов":
        analysisOfRemainingMaterialsMutation.mutate(undefined, {
          onSuccess: () => {
            toast.dismiss(loadingToast)
            toast.success("Отсчет готов к скачиванию")
          },
          onError: (err: Error) => {
            toast.dismiss(loadingToast)
            toast.error(`Ошибка при создании отсчета: ${err.message}`)
          }
        })
        break
    }
  }
  return (
    <div className="py-1 px-2">
      <span className="font-bold text-2xl">Отсчетность</span>
      <div className="grid grid-cols-4 gap-2 px-2 py-2">
        {mainReportTitles.map(val => (
          <div
            className="bg-gray-800 text-white text-xl py-3 px-6 rounded cursor-pointer hover:bg-gray-900 text-center align-middle"
            onClick={() => getReport(val)}
          >{val}</div>
        ))}
      </div>
    </div>
  )
}

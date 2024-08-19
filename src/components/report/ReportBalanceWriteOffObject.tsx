import Modal from "../Modal";
import { useMutation, useQuery } from "@tanstack/react-query";
import LoadingDots from "../UI/loadingDots";
import { ReportWriteOffBalanceFilter, buildWriteOffBalanceReport } from "../../services/api/materialLocation";
import { useEffect, useState } from "react";
import IReactSelectOptions from "../../services/interfaces/react-select";
import { getAllUniqueObjects } from "../../services/api/reportBalance";
import Select from 'react-select'
import { ObjectDataForSelect } from "../../services/interfaces/objects";
import { objectTypeIntoRus } from "../../services/lib/objectStatuses";

interface Props {
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>
}

export default function ReportBalanceWriteOffObject({ setShowModal }: Props) {

  const [filter, setFilter] = useState<ReportWriteOffBalanceFilter>({
    writeOffType: "writeoff-object",
    locationID: 0,
  })
  //Submit filter
  const buildReportBalanceMutation = useMutation({
    mutationFn: () => buildWriteOffBalanceReport(filter)
  })

  //Object Logic
  const [selectedObject, setSelectedObject] = useState<IReactSelectOptions<number>>({ label: "", value: 0 })
  const [objects, setObjects] = useState<IReactSelectOptions<number>[]>([])
  const objectsQuery = useQuery<ObjectDataForSelect[], Error, ObjectDataForSelect[]>({
    queryKey: ["balance-report-unique-objects"],
    queryFn: getAllUniqueObjects,
  })
  useEffect(() => {
    if (objectsQuery.data && objectsQuery.isSuccess) {
      setObjects([...objectsQuery.data.map<IReactSelectOptions<number>>((value) => ({
        label: `${value.objectName} (${objectTypeIntoRus(value.objectType)})`,
        value: value.id,
      }))])
    }
  }, [objectsQuery.data])

  const onCreateReportClick = () => {
    buildReportBalanceMutation.mutate()
  }

  return (
    <Modal setShowModal={setShowModal}>
      <div className="py-2">
        <p className="text-2xl font-bold">Отчет остатка списанных материалов с объектов</p>
      </div>
      <div className="px-2 flex flex-col space-y-2 pb-2">
        <span className="text-xl font-semibold">Параметры</span>
        <div className="flex flex-col space-y-1">
          <label htmlFor="teams">Имя объекта</label>
          <Select
            id="objects"
            className="basic-single"
            classNamePrefix="select"
            isSearchable={true}
            isClearable={true}
            menuPosition="fixed"
            name={"objects"}
            placeholder={""}
            value={selectedObject}
            options={objects}
            onChange={(value) => {
              setSelectedObject(value ?? { label: "", value: 0 })
              setFilter({
                ...filter,
                locationID: value?.value ?? 0,
              })
            }}
          />
        </div>
        <div className="flex">
          <div
            onClick={() => onCreateReportClick()}
            className="text-center text-white py-2.5 px-5 rounded-lg bg-gray-700 hover:bg-gray-800 hover:cursor-pointer"
          >
            {buildReportBalanceMutation.isLoading ? <LoadingDots height={30} /> : "Создать Отчет"}
          </div>
        </div>
      </div>
    </Modal>
  )
}

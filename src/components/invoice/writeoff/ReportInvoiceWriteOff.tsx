import Modal from "../../Modal"
import Select from 'react-select'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { InvoiceWriteOffReportParameters, buildWriteOffReport } from "../../../services/api/invoiceWriteoff";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import IReactSelectOptions from "../../../services/interfaces/react-select";
import { TeamDataForSelect } from "../../../services/interfaces/teams";
import { getAllUniqueObjects, getAllUniqueTeams } from "../../../services/api/reportBalance";
import { ObjectDataForSelect } from "../../../services/interfaces/objects";
import { objectTypeIntoRus } from "../../../services/lib/objectStatuses";
import LoadingDots from "../../UI/loadingDots";
import Button from "../../UI/button";
import toast from "react-hot-toast";
import writeOffTypeToRus from "../../../services/lib/writeOffTypeToRus";

interface Props {
  setShowReportModal: React.Dispatch<React.SetStateAction<boolean>>
  writeOffType: "writeoff-warehouse" | "loss-warehouse" | "loss-team" | "loss-object" | "writeoff-object"
}
export default function ReportInvoiceWriteOff({
  setShowReportModal,
  writeOffType,
}: Props) {

  const [filter, setFilter] = useState<InvoiceWriteOffReportParameters>({
    writeOffType: writeOffType,
    writeOffLocationID: 0,
    dateFrom: null,
    dateTo: null,
  })

  //Teams Logic
  const [selectedTeam, setSelectedTeam] = useState<IReactSelectOptions<number>>({ label: "", value: 0 })
  const [teams, setTeams] = useState<IReactSelectOptions<number>[]>([])
  const teamsQuery = useQuery<TeamDataForSelect[], Error, TeamDataForSelect[]>({
    queryKey: ["balance-report-unique-teams"],
    queryFn: getAllUniqueTeams,
    enabled: writeOffType == "loss-team",
  })
  useEffect(() => {
    if (teamsQuery.data && teamsQuery.isSuccess) {
      setTeams([...teamsQuery.data.map<IReactSelectOptions<number>>((value) => ({
        label: `${value.teamNumber} (${value.teamLeaderName})`,
        value: value.id
      }))])
    }
  }, [teamsQuery.data])

  //Object Logic
  const [selectedObject, setSelectedObject] = useState<IReactSelectOptions<number>>({ label: "", value: 0 })
  const [objects, setObjects] = useState<IReactSelectOptions<number>[]>([])
  const objectsQuery = useQuery<ObjectDataForSelect[], Error, ObjectDataForSelect[]>({
    queryKey: ["balance-report-unique-objects"],
    queryFn: getAllUniqueObjects,
    enabled: writeOffType == "loss-object" || writeOffType == "writeoff-object",
  })
  useEffect(() => {
    if (objectsQuery.data && objectsQuery.isSuccess) {
      setObjects([...objectsQuery.data.map<IReactSelectOptions<number>>((value) => ({
        label: `${value.objectName} (${objectTypeIntoRus(value.objectType)})`,
        value: value.id,
      }))])
    }
  }, [objectsQuery.data])

  const buildInvoiceWriteOffReport = useMutation({
    mutationFn: () => buildWriteOffReport(filter)
  })

  const onCreateReportClick = () => {

    if (filter.dateFrom && filter.dateTo) {
      toast.error("Неправильно указан диапазон дат")
      return
    }

    buildInvoiceWriteOffReport.mutate()
  }

  return (
    <Modal setShowModal={setShowReportModal}>
      <div className="py-2">
        <p className="text-2xl font-bold">Отсчет списания - {writeOffTypeToRus(writeOffType)}</p>
      </div>
      <div className="px-2 flex flex-col space-y-2 pb-2">
        <span className="text-xl font-semibold">Параметры</span>
        {(writeOffType == "loss-object" || writeOffType == "writeoff-object") &&
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
                  writeOffLocationID: value?.value ?? 0,
                })
              }}
            />
          </div>
        }
        {writeOffType == "loss-team" &&
          <div className="flex flex-col space-y-1">
            <label htmlFor="teams">Номер Бригады</label>
            <Select
              id="teams"
              className="basic-single"
              classNamePrefix="select"
              isSearchable={true}
              isClearable={true}
              menuPosition="fixed"
              name={"teams"}
              placeholder={""}
              value={selectedTeam}
              options={teams}
              onChange={(value) => {
                setSelectedTeam(value ?? { label: "", value: 0 })
                setFilter({
                  ...filter,
                  writeOffLocationID: value?.value ?? 0,
                })
              }}
            />
          </div>
        }
        <div className="felx flex-col space-y-1">
          <label htmlFor="rangeDate">Диапозон Дат</label>
          <div className="flex space-x-2">
            <div className="py-[4px] px-[8px] border-[#cccccc] border rounded-[4px]">
              <DatePicker
                name="dateOfInvoice"
                className="outline-none w-full"
                dateFormat={"dd-MM-yyyy"}
                selected={filter.dateFrom}
                onChange={(date: Date | null) =>
                  setFilter({ ...filter, dateFrom: date ?? new Date() })
                }
              />
            </div>
            <div className="py-[4px] px-[8px] border-[#cccccc] border rounded-[4px]">
              <DatePicker
                name="dateOfInvoice"
                className="outline-none w-full"
                dateFormat={"dd-MM-yyyy"}
                selected={filter.dateTo}
                onChange={(date: Date | null) =>
                  setFilter({ ...filter, dateTo: date ?? new Date() })
                }
              />
            </div>
            <div>
              <Button
                onClick={() =>
                  setFilter({
                    ...filter,
                    dateFrom: null,
                    dateTo: null
                  })
                }
                text="X"
                buttonType="default"
              />
            </div>
          </div>
        </div>
        <div className="flex">
          <div
            onClick={() => onCreateReportClick()}
            className="text-center text-white py-2.5 px-5 rounded-lg bg-gray-700 hover:bg-gray-800 hover:cursor-pointer"
          >
            {buildInvoiceWriteOffReport.isLoading ? <LoadingDots height={30} /> : "Создать Отчет"}
          </div>
        </div>
      </div>
    </Modal>
  )
}

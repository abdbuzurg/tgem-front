import { useEffect, useState } from "react";
import Modal from "../Modal";
import IReactSelectOptions from "../../services/interfaces/react-select";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ReportBalanceFilter, buildReportBalance, getAllUniqueObjects, getAllUniqueTeams } from "../../services/api/reportBalance";
import Select from 'react-select'
import LoadingDots from "../UI/loadingDots";

interface Props {
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>
}

export default function ReportBalance({ setShowModal }: Props) {
  const [reportBalanceType, setReportBalanceType] = useState<"warehouse" | "teams" | "objects" | string>("warehouse")
  const [filter, setFilter] = useState<ReportBalanceFilter>({
    object: "",
    team: "",
    type: "warehouse",
  })

  const onRadioSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setReportBalanceType(e.target.value)
    setFilter({ ...filter, type: e.target.value })
  }

  //Teams Logic
  const [teams, setTeams] = useState<IReactSelectOptions<string>[]>([])
  const teamsQuery = useQuery<string[], Error, string[]>({
    queryKey: ["balance-report-unique-teams"],
    queryFn: getAllUniqueTeams,
    enabled: reportBalanceType == "team"
  })
  useEffect(() => {
    if (teamsQuery.data && teamsQuery.isSuccess) {
      setTeams([...teamsQuery.data.map<IReactSelectOptions<string>>((value) => ({ label: value, value: value }))])
    }
  }, [teamsQuery.data])

  //Object Logic
  const [objects, setObjects] = useState<IReactSelectOptions<string>[]>([])
  const objectsQuery = useQuery<string[], Error, string[]>({
    queryKey: ["balance-report-unique-objects"],
    queryFn: getAllUniqueObjects,
    enabled: reportBalanceType == "object"
  })
  useEffect(() => {
    if (objectsQuery.data && objectsQuery.isSuccess) {
      setObjects([...objectsQuery.data.map<IReactSelectOptions<string>>((value) => ({ label: value, value: value }))])
    }
  }, [objectsQuery.data])

  //Submit filter
  const buildReportBalanceMutation = useMutation({
    mutationFn: () => buildReportBalance(filter)
  })

  const onCreateReportClick = () => {
    buildReportBalanceMutation.mutate()
  }

  return (
    <Modal setShowModal={setShowModal}>
      <div className="py-2">
        <p className="text-2xl font-bold">Отчет остатка</p>
      </div>
      <div className="px-2 flex flex-col space-y-2 pb-2">
        <span className="text-xl font-semibold">Параметры</span>
        <div className="flex flex-col space-y-1">
          <p>Тип баланса</p>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <input id="warehouse" name="reportBalanceType" type="radio" value="warehouse" onChange={(e) => onRadioSelect(e)} defaultChecked />
              <label htmlFor="warehouse">Склад</label>
            </div>
            <div className="flex items-center space-x-2">
              <input id="teams" name="reportBalanceType" type="radio" value="team" onChange={(e) => onRadioSelect(e)} />
              <label htmlFor="teams">Бригады</label>
            </div>
            <div className="flex items-center space-x-2">
              <input id="objects" name="reportBalanceType" type="radio" value="object" onChange={(e) => onRadioSelect(e)} />
              <label htmlFor="objects">Объект</label>
            </div>
          </div>
        </div>
        {reportBalanceType == "team" &&
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
              value={{ value: filter.team, label: filter.team }}
              options={teams}
              onChange={(value: null | IReactSelectOptions<string>) => setFilter({ ...filter, team: value?.value ?? "" })}
            />
          </div>
        }
        {reportBalanceType == "object" &&
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
              value={{ value: filter.object, label: filter.object }}
              options={objects}
              onChange={(value: null | IReactSelectOptions<string>) => setFilter({ ...filter, object: value?.value ?? "" })}
            />
          </div>
        }
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

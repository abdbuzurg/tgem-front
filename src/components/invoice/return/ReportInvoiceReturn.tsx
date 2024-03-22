import { useEffect, useState } from "react"
import { InvoiceReturnReportFilter, buildReport, getUniqueCode, getUniqueObject, getUniqueTeam } from "../../../services/api/invoiceReturn"
import IReactSelectOptions from "../../../services/interfaces/react-select"
import Modal from "../../Modal"
import Select from 'react-select'
import { useQuery } from "@tanstack/react-query"
import Button from "../../UI/button"
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"; 
import ErrorModal from "../../errorModal"

interface Props {
  setShowReportModal: React.Dispatch<React.SetStateAction<boolean>>
}

export default function ReportInvoiceReturn({ setShowReportModal }: Props) {
  
  // Filter Data
  const [filter, setFilter] = useState<InvoiceReturnReportFilter>({
    code: "",
    dateFrom: null,
    dateTo: null,
    returner: "",
    returnerType: "all"
  })

  //Code logic
  const [codes, setCodes] = useState<IReactSelectOptions<string>[]>([])
  const codeQuery = useQuery<string[], Error, string[]>({
    queryKey: ["invoice-return-codes"],
    queryFn: getUniqueCode,
  })
  useEffect(() => {
    if (codeQuery.isSuccess && codeQuery.data) {
      setCodes(codeQuery.data.map<IReactSelectOptions<string>>(value => ({label: value, value: value})))
    }
  }, [codeQuery.data])

  //Team logic
  const [teams, setTeams] = useState<IReactSelectOptions<string>[]>([])
  const teamsQuery = useQuery<string[], Error, string[]>({
    queryKey: ["invoice-return-teams"],
    queryFn: getUniqueTeam,
    enabled: filter.returnerType == "teams"
  })  
  useEffect(() => { 
    if (teamsQuery.isSuccess && teamsQuery.data) {
      setTeams(teamsQuery.data.map<IReactSelectOptions<string>>(value => ({label: value, value: value})))
    }
  }, [teamsQuery.data])

  //Object logic
  const [objects, setObjects] = useState<IReactSelectOptions<string>[]>([])
  const objectsQuery = useQuery<string[], Error, string[]>({
    queryKey: ["invoice-retrun-objects"],
    queryFn: getUniqueObject,
    enabled: filter.returnerType == "objects"
  })
  useEffect(() => {
    if (objectsQuery.isSuccess && objectsQuery.data) {
      setObjects(objectsQuery.data.map<IReactSelectOptions<string>>(value => ({label: value, value: value})))
    }
  }, [objectsQuery.data])

  //Filter submission
  const [filterErrors, setFilterErrors] = useState({
    date: false,
  })
  const [showErrorsModal, setShowErrorsModal] = useState(false)

  const onCreateReportClick = () => {
    let errors = {
      date: false,
    }; 
    if (filter.dateFrom && filter.dateTo) {
      errors = {
        date: filter.dateFrom > filter.dateTo
      }
    }

    setFilterErrors(errors)
    const isThereError = Object.keys(errors).some((value) => {
      if (errors[value as keyof typeof errors]) {
        return true
      }
    })
    if (isThereError) {
      setShowErrorsModal(true)
      return
    }

    buildReport(filter)
  }

  return (
    <Modal setShowModal={setShowReportModal}>
      <div className="py-2">
        <p className="text-2xl font-bold">Отчет для накладной возврат</p>
      </div>
      <div className="px-2 flex flex-col space-y-2 pb-2">
        <span className="text-xl font-semibold">Параметры</span>
        <div className="flex flex-col space-y-1">
          <label htmlFor="returnType">Тип возврата</label>
          <div id="returnType" className="flex space-x-3">
            <div className="flex space-x-1">
              <input 
                type="radio" 
                name="returnType" 
                id="all" 
                value="all" 
                defaultChecked={true}
                onChange={() => setFilter({...filter, returnerType: "all"})}
              />
              <label htmlFor="all">Все</label>
            </div>
            <div className="flex space-x-1">
              <input 
                type="radio" 
                name="returnType" 
                id="teams" 
                value="teams"
                onChange={() => setFilter({...filter, returnerType: "teams"})}
              />
              <label htmlFor="teams">Бригады</label>
            </div>
            <div className="flex space-x-1">
              <input 
                type="radio" 
                name="returnType" 
                id="objects" 
                value="objects"   
                onChange={() => setFilter({...filter, returnerType: "objects"})}
              />
              <label htmlFor="objects">Объекты</label>
            </div>
          </div>
        </div>
        <div className="flex flex-col space-y-1">
          <label htmlFor="code">Код накладной</label>
          <Select
            id="code"
            className="basic-single"
            classNamePrefix="select"
            isSearchable={true}
            isClearable={true}
            menuPosition="fixed"
            name={"code"}
            placeholder={""}
            value={{value: filter.code, label: filter.code}}
            options={codes}
            onChange={(value: null | IReactSelectOptions<string>) => setFilter({...filter, code: value?.value ?? ""})}
          />
        </div>
        {filter.returnerType == "teams" && <div className="flex flex-col space-y-1">
            <label htmlFor="team">Бригады</label>
            <Select
              id="team"
              className="basic-single"
              classNamePrefix="select"
              isSearchable={true}
              isClearable={true}
              menuPosition="fixed"
              name={"team"}
              placeholder={""}
              value={{value: filter.returner, label: filter.returner}}
              options={teams}
              onChange={(value: null | IReactSelectOptions<string>) => setFilter({...filter, returner: value?.value ?? ""})}
            />
          </div>
        }
        {filter.returnerType == "objects" && <div className="flex flex-col space-y-1">
            <label htmlFor="object">Объект</label>
            <Select
              id="obecjt"
              className="basic-single"
              classNamePrefix="select"
              isSearchable={true}
              isClearable={true}
              menuPosition="fixed"
              name={"object"}
              placeholder={""}
              value={{value: filter.returner, label: filter.returner}}
              options={objects}
              onChange={(value: null | IReactSelectOptions<string>) => setFilter({...filter, returner: value?.value ?? ""})}
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
                onChange={(date: Date | null) => setFilter({...filter, dateFrom: date ?? new Date()})}
              />
            </div>
            <div className="py-[4px] px-[8px] border-[#cccccc] border rounded-[4px]">
              <DatePicker
                name="dateOfInvoice"
                className="outline-none w-full"
                dateFormat={"dd-MM-yyyy"}
                selected={filter.dateTo} 
                onChange={(date: Date | null) => setFilter({...filter, dateTo: date ?? new Date()})}
              />
            </div> 
            <div>
              <Button onClick={() => setFilter({...filter, dateFrom: null, dateTo: null})} text="X" buttonType="default"/>
            </div>
          </div>
        </div>
        <div>
          <Button onClick={() => onCreateReportClick()} buttonType="default" text="Создать отсчёт"/>
        </div>
      </div>
      {showErrorsModal && 
        <ErrorModal setShowModal={setShowErrorsModal}>
          {filterErrors.date && <span className="text-red-500 text-sm font-semibold">Неправильно указанный диапазон для дат. </span>}
          <span className="invisible">This is just make the modal look good. DO NOT TOUCH IT!!!!!</span>
        </ErrorModal>
      }
    </Modal>
  )
}
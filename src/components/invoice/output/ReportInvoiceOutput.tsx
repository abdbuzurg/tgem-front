import Modal from "../../Modal";
import Select from 'react-select'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Button from "../../UI/button";
import IReactSelectOptions from "../../../services/interfaces/react-select";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { InvoiceOutputReportFilter, buildReport, getAllUniqueCode, getAllUniqueRecieved, getAllUniqueDistrict, getAllUniqueTeam, getAllUniqueWarehouseManager } from "../../../services/api/invoiceOutputInProject";
import ErrorModal from "../../errorModal";
import LoadingDots from "../../UI/loadingDots";

interface Props {
  setShowReportModal: React.Dispatch<React.SetStateAction<boolean>>
}

export default function ReportInvoiceOutput({ setShowReportModal }: Props) {

  //Logic for all the districts
  const [districts, setDistricts] = useState<IReactSelectOptions<string>[]>([])
  const districtQuery = useQuery<string[], Error, string[]>({
    queryKey: ["invoice-output-districts"],
    queryFn: getAllUniqueDistrict
  })
  useEffect(() => {
    if (districtQuery.isSuccess && districtQuery.data) {
      setDistricts([...districtQuery.data.map<IReactSelectOptions<string>>((value) => ({ value: value, label: value }))])
    }
  }, [districtQuery.data])

  //Logic for All the codes(serial codes)
  const [codes, setCodes] = useState<IReactSelectOptions<string>[]>([])
  const codesQuery = useQuery<string[], Error, string[]>({
    queryKey: ["invoice-output-codes"],
    queryFn: getAllUniqueCode
  })
  useEffect(() => {
    if (codesQuery.isSuccess && codesQuery.data) {
      setCodes([...codesQuery.data.map<IReactSelectOptions<string>>((value) => ({ value: value, label: value }))])
    }
  }, [codesQuery.data])

  //Logic for all the warehouse managers
  const [warehouseManagers, setWarehouseManagers] = useState<IReactSelectOptions<string>[]>([])
  const warehouseManagersQuery = useQuery<string[], Error, string[]>({
    queryKey: ["invoice-output-warehouse-managers"],
    queryFn: getAllUniqueWarehouseManager
  })
  useEffect(() => {
    if (warehouseManagersQuery.isSuccess && warehouseManagersQuery.data) {
      setWarehouseManagers([...warehouseManagersQuery.data.map<IReactSelectOptions<string>>((value) => ({ value: value, label: value }))])
    }
  }, [warehouseManagersQuery.data])

  //Logic for all Released
  const [recieveds, setReceiveds] = useState<IReactSelectOptions<string>[]>([])
  const recievedsQuery = useQuery<string[], Error, string[]>({
    queryKey: ["invoice-output-recieveds"],
    queryFn: getAllUniqueRecieved
  })
  useEffect(() => {
    if (recievedsQuery.isSuccess && recievedsQuery.data) {
      setReceiveds([...recievedsQuery.data.map<IReactSelectOptions<string>>((value) => ({ value: value, label: value }))])
    }
  }, [recievedsQuery.data])

  //Logic for all Teams
  const [teams, setTeams] = useState<IReactSelectOptions<string>[]>([])
  const teamQuery = useQuery<string[], Error, string[]>({
    queryKey: ["invoice-output-teams"],
    queryFn: getAllUniqueTeam
  })
  useEffect(() => {
    if (teamQuery.isSuccess && teamQuery.data) {
      setTeams([...teamQuery.data.map<IReactSelectOptions<string>>((value) => ({ value: value, label: value }))])
    }
  }, [teamQuery.data])


  //Filter data 
  const [filter, setFilter] = useState<InvoiceOutputReportFilter>({
    code: "",
    dateFrom: null,
    dateTo: null,
    object: "",
    recieved: "",
    district: "",
    team: "",
    warehouseManager: "",
  })
  const [filterErrors, setFilterErrors] = useState({
    date: false,
  })

  const [showErrorsModal, setShowErrorsModal] = useState(false)

  //Submit filter

  const buildInvoiceOutputReport = useMutation({
    mutationFn: () => buildReport(filter)
  })

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

    buildInvoiceOutputReport.mutate()
  }

  return (
    <Modal setShowModal={setShowReportModal}>
      <div className="py-2">
        <p className="text-2xl font-bold">Отчет для накладной отпуск</p>
      </div>
      <div className="px-2 flex flex-col space-y-2 pb-2">
        <span className="text-xl font-semibold">Параметры</span>
        <div className="flex flex-col space-y-1">
          <label htmlFor="code">Номер накладной</label>
          <Select
            id="code"
            className="basic-single"
            classNamePrefix="select"
            isSearchable={true}
            isClearable={true}
            menuPosition="fixed"
            name={"code"}
            placeholder={""}
            value={{ value: filter.code, label: filter.code }}
            options={codes}
            onChange={(value: null | IReactSelectOptions<string>) => setFilter({ ...filter, code: value?.value ?? "" })}
          />
        </div>
        <div className="flex flex-col space-y-1">
          <label htmlFor="district">Район</label>
          <Select
            id="district"
            className="basic-single"
            classNamePrefix="select"
            isSearchable={true}
            isClearable={true}
            menuPosition="fixed"
            name={"district"}
            placeholder={""}
            value={{ label: filter.district, value: filter.district }}
            options={districts}
            onChange={(value: null | IReactSelectOptions<string>) => setFilter({ ...filter, district: value?.value ?? "" })}
          />
        </div>
        <div className="flex flex-col space-y-1">
          <label htmlFor="warehouseManager">Зав. Склад</label>
          <Select
            id="warehouseManager"
            className="basic-single"
            classNamePrefix="select"
            isSearchable={true}
            isClearable={true}
            menuPosition="fixed"
            name={"warehouseManager"}
            placeholder={""}
            value={{ label: filter.warehouseManager, value: filter.warehouseManager }}
            options={warehouseManagers}
            onChange={(value: null | IReactSelectOptions<string>) => setFilter({ ...filter, warehouseManager: value?.value ?? "" })}
          />
        </div>
        <div className="flex flex-col space-y-1">
          <label htmlFor="recieved">Составил</label>
          <Select
            id="recieved"
            className="basic-single"
            classNamePrefix="select"
            isSearchable={true}
            isClearable={true}
            menuPosition="fixed"
            name={"recieved"}
            placeholder={""}
            value={{ label: filter.recieved, value: filter.recieved }}
            options={recieveds}
            onChange={(value: null | IReactSelectOptions<string>) => setFilter({ ...filter, recieved: value?.value ?? "" })}
          />
        </div>
        <div className="flex flex-col space-y-1">
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
            value={{ label: filter.team, value: filter.team }}
            options={teams}
            onChange={(value: null | IReactSelectOptions<string>) => setFilter({ ...filter, team: value?.value ?? "" })}
          />
        </div>
        <div className="felx flex-col space-y-1">
          <label htmlFor="rangeDate">Диапозон Дат</label>
          <div className="flex space-x-2">
            <div className="py-[4px] px-[8px] border-[#cccccc] border rounded-[4px]">
              <DatePicker
                name="dateOfInvoice"
                className="outline-none w-full"
                dateFormat={"dd-MM-yyyy"}
                selected={filter.dateFrom}
                onChange={(date: Date | null) => setFilter({ ...filter, dateFrom: date ?? new Date() })}
              />
            </div>
            <div className="py-[4px] px-[8px] border-[#cccccc] border rounded-[4px]">
              <DatePicker
                name="dateOfInvoice"
                className="outline-none w-full"
                dateFormat={"dd-MM-yyyy"}
                selected={filter.dateTo}
                onChange={(date: Date | null) => setFilter({ ...filter, dateTo: date ?? new Date() })}
              />
            </div>
            <div>
              <Button onClick={() => setFilter({ ...filter, dateFrom: null, dateTo: null })} text="X" buttonType="default" />
            </div>
          </div>
        </div>
        <div className="flex">
          <div
            onClick={() => onCreateReportClick()}
            className="text-center text-white py-2.5 px-5 rounded-lg bg-gray-700 hover:bg-gray-800 hover:cursor-pointer"
          >
            {buildInvoiceOutputReport.isLoading ? <LoadingDots height={30} /> : "Создать Отчет"}
          </div>
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

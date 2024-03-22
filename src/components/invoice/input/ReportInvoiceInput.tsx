import Modal from "../../Modal";
import Select from 'react-select'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";  
import Button from "../../UI/button";
import IReactSelectOptions from "../../../services/interfaces/react-select";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { InvoiceInputReportFilter, buildReport, getAllUniqueCode, getAllUniqueReleased, getAllUniqueWarehouseManager } from "../../../services/api/invoiceInput";
import ErrorModal from "../../errorModal";
import toast from "react-hot-toast";

interface Props {
  setShowReportModal: React.Dispatch<React.SetStateAction<boolean>>
}

export default function ReportInvoiceInput({setShowReportModal}: Props) {
  
  //Logic for All the codes(serial codes)
  const [codes, setCodes] = useState<IReactSelectOptions<string>[]>([])
  const codesQuery = useQuery<string[], Error, string[]>({
    queryKey: ["invoice-input-codes"],
    queryFn: getAllUniqueCode
  })
  useEffect(() => {
    if (codesQuery.isSuccess && codesQuery.data) {
      setCodes([...codesQuery.data.map<IReactSelectOptions<string>>((value) => ({value: value, label: value}))])
    }
  }, [codesQuery.data])

  //Logic for all the warehouse managers
  const [warehouseManagers, setWarehouseManagers] = useState<IReactSelectOptions<string>[]>([])
  const warehouseManagersQuery = useQuery<string[], Error, string[]>({
    queryKey: ["invoice-input-warehouse-managers"],
    queryFn: getAllUniqueWarehouseManager
  })
  useEffect(() => {
    if (warehouseManagersQuery.isSuccess && warehouseManagersQuery.data) {
      setWarehouseManagers([...warehouseManagersQuery.data.map<IReactSelectOptions<string>>((value) => ({value: value, label: value}))])
    }
  }, [warehouseManagersQuery.data])

  //Logic for all Released
  const [releaseds, setReleaseds] = useState<IReactSelectOptions<string>[]>([])
  const releasedsQuery = useQuery<string[], Error, string[]>({
    queryKey: ["invoice-input-releaseds"],
    queryFn: getAllUniqueReleased
  })
  useEffect(() => {
    if (releasedsQuery.isSuccess && releasedsQuery.data) {
      setReleaseds([...releasedsQuery.data.map<IReactSelectOptions<string>>((value) => ({value: value, label: value}))])
    }
  }, [releasedsQuery.data])
  
  //Filter data 
  const [filter, setFilter] = useState<InvoiceInputReportFilter>({
    code: "",
    dateFrom: null,
    dateTo: null,
    released: "",
    warehouseManager: "",
  })

  //Submit filter
  const onCreateReportClick = () => {
    
    if (filter.dateFrom && filter.dateTo) {
      toast.error("Неправильно указан диапазон дат") 
      return
    }
    
    buildReport(filter)
  }

  return (
    <Modal setShowModal={setShowReportModal}>
      <div className="py-2">
        <p className="text-2xl font-bold">Отчет для накладной приход</p>
      </div>
      <div className="px-2 flex flex-col space-y-2 pb-2">
        <span className="text-xl font-semibold">Параметры</span>
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
            onChange={(value: null | IReactSelectOptions<string>) => 
              setFilter({...filter, code: value?.value ?? ""})
            }
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
            value={{label: filter.warehouseManager, value: filter.warehouseManager}}
            options={warehouseManagers}
            onChange={(value: null | IReactSelectOptions<string>) => setFilter({...filter, warehouseManager: value?.value ?? ""})}
          />
        </div>
        <div className="flex flex-col space-y-1">
          <label htmlFor="released">Составил</label>
          <Select
            id="released"
            className="basic-single" 
            classNamePrefix="select"
            isSearchable={true}
            isClearable={true}
            menuPosition="fixed"
            name={"released"}
            placeholder={""}
            value={{label: filter.released, value: filter.released}}
            options={releaseds}
            onChange={(value: null | IReactSelectOptions<string>) => 
              setFilter({...filter, released: value?.value ?? ""})
            }
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
                onChange={(date: Date | null) => 
                  setFilter({...filter, dateFrom: date ?? new Date()})
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
                  setFilter({...filter, dateTo: date ?? new Date()})
                }
              />
            </div> 
            <div>
              <Button 
                onClick={() => 
                  setFilter({
                    ...filter, 
                    dateFrom: null, 
                    dateTo: null})
                  } 
                text="X" 
                buttonType="default"
              />
            </div>
          </div>
        </div>
        <div>
          <Button onClick={() => onCreateReportClick()} buttonType="default" text="Создать отсчёт"/>
        </div>
      </div> 
    </Modal>
  )
}

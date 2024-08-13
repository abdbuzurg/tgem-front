import { Fragment, useEffect, useState } from "react"
import { IInvoiceWriteOff, IInvoiceWriteOffMaterials, IInvoiceWriteOffView } from "../../../services/interfaces/invoiceWriteOff"
import IReactSelectOptions from "../../../services/interfaces/react-select"
import { TeamDataForSelect } from "../../../services/interfaces/teams"
import { getAllTeamsForSelect } from "../../../services/api/team"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { IObject } from "../../../services/interfaces/objects"
import { getAllObjects } from "../../../services/api/object"
import { objectTypeIntoRus } from "../../../services/lib/objectStatuses"
import getAllMaterials from "../../../services/api/materials/getAll"
import Material from "../../../services/interfaces/material"
import { IMaterialCost } from "../../../services/interfaces/materialCost"
import getMaterailCostByMaterialID from "../../../services/api/materialscosts/getByMaterailID"
import toast from "react-hot-toast"
import { InvoiceWriteOffItem, InvoiceWriteOffMutation, getInvoiceWriteOffMaterialsForEdit, updateInvoiceWriteOff } from "../../../services/api/invoiceWriteoff"
import Modal from "../../Modal"
import LoadingDots from "../../UI/loadingDots"
import Select from 'react-select'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import IconButton from "../../IconButtons"
import { IoIosAddCircleOutline } from "react-icons/io"
import Input from "../../UI/Input"
import Button from "../../UI/button"

interface Props {
  setShowEditModal: React.Dispatch<React.SetStateAction<boolean>>
  writeOffType: "loss-object" | "loss-team" | "loss-warehouse" | "writeoff-warehouse",
  invoiceWriteOff: IInvoiceWriteOffView
}

export default function EditInvoiceWriteOff({
  setShowEditModal,
  writeOffType,
  invoiceWriteOff,
}: Props) {

  const [editInvoiceWriteOff, setEditInvoiceWriteOff] = useState<IInvoiceWriteOff>({
    id: invoiceWriteOff.id,
    projectID: invoiceWriteOff.projectID,
    releasedWorkerID: invoiceWriteOff.releasedWorkerID,
    writeOffType: writeOffType,
    writeOffLocationID: invoiceWriteOff.writeOffLocationID,
    dateOfInvoice: new Date(invoiceWriteOff.dateOfInvoice),
    confirmation: false,
    dateOfConfirmation: new Date(),
    deliveryCode: invoiceWriteOff.deliveryCode,
  })

  const [writeOffLocation, setWriteOffLocation] = useState<IReactSelectOptions<number>>({ label: "", value: 0 })
  const [availableLocations, setAvailableLocations] = useState<IReactSelectOptions<number>[]>([])

  const allTeamsQuery = useQuery<TeamDataForSelect[], Error, TeamDataForSelect[]>({
    queryKey: ["team-data-for-select"],
    queryFn: () => getAllTeamsForSelect(),
    enabled: writeOffType == "loss-team",
  })
  useEffect(() => {
    if (allTeamsQuery.isSuccess && allTeamsQuery.data) {
      setAvailableLocations(allTeamsQuery.data.map<IReactSelectOptions<number>>(val => ({
        label: val.teamNumber + " (" + val.teamLeaderName + ")",
        value: val.id,
      })))
    }
  }, [allTeamsQuery.data])

  const allObjectQuery = useQuery<IObject[], Error, IObject[]>({
    queryKey: ["all-objects"],
    queryFn: () => getAllObjects(),
    enabled: writeOffType == "loss-object",
  })
  useEffect(() => {
    if (allObjectQuery.isSuccess && allObjectQuery.data) {
      setAvailableLocations(allObjectQuery.data.map<IReactSelectOptions<number>>(val => ({
        label: val.name + " (" + objectTypeIntoRus(val.type) + ")",
        value: val.id,
      })))
    }
  }, [allObjectQuery.data])

  // Invoice materials information
  const [invoiceMaterials, setInvoiceMaterials] = useState<IInvoiceWriteOffMaterials[]>([])
  const invoiceMaterialsForEditQuery = useQuery<IInvoiceWriteOffMaterials[], Error, IInvoiceWriteOffMaterials[]>({
    queryKey: ["invoice-input-materials", invoiceWriteOff.id],
    queryFn: () => getInvoiceWriteOffMaterialsForEdit(invoiceWriteOff.id)
  })
  useEffect(() => {
    if (invoiceMaterialsForEditQuery.isSuccess && invoiceMaterialsForEditQuery.data) {
      setInvoiceMaterials(invoiceMaterialsForEditQuery.data)
    }
  }, [invoiceMaterialsForEditQuery.data])
  const [invoiceMaterial, setInvoiceMaterial] = useState<IInvoiceWriteOffMaterials>({
    materialID: 0,
    materialName: "",
    unit: "",
    amount: 0,
    materialCostID: 0,
    materialCost: 0,
    notes: "",
    hasSerialNumber: false,
    serialNumbers: [],
  })

  // MATERIAL SELECT LOGIC
  const materialQuery = useQuery<Material[], Error, Material[]>({
    queryKey: ["all-materials"],
    queryFn: getAllMaterials,
  })
  const [allMaterialData, setAllMaterialData] = useState<IReactSelectOptions<number>[]>([])
  const [selectedMaterial, setSelectedMaterial] = useState<IReactSelectOptions<number>>({ value: 0, label: "" })
  useEffect(() => {
    if (materialQuery.isSuccess && materialQuery.data) {
      setAllMaterialData([
        ...materialQuery
          .data
          .map<IReactSelectOptions<number>>((value) => ({ value: value.id, label: value.name })),
      ])
    }
  }, [materialQuery.data])
  const onMaterialSelect = (value: IReactSelectOptions<number> | null) => {
    setSelectedMaterialCost({ label: "", value: 0 })
    if (!value) {
      setSelectedMaterial({ label: "", value: 0 })
      setInvoiceMaterial({
        ...invoiceMaterial,
        unit: "",
        materialID: 0,
        materialName: "",
        hasSerialNumber: false,
      })
      return
    }
    setSelectedMaterial(value)
    if (materialQuery.data && materialQuery.isSuccess) {
      const material = materialQuery.data.find((material) => material.id == value.value)!
      setInvoiceMaterial({
        ...invoiceMaterial,
        unit: material.unit,
        materialID: material.id,
        materialName: material.name,
        hasSerialNumber: material.hasSerialNumber,
      })
    }
  }

  // MATERIAL COST SELECT LOGIC
  const materialCostQuery = useQuery<IMaterialCost[], Error>({
    queryKey: ["material-cost", invoiceMaterial.materialID],
    queryFn: () => getMaterailCostByMaterialID(invoiceMaterial.materialID),
  })
  const [allMaterialCostData, setAllMaterialCostData] = useState<IReactSelectOptions<number>[]>([])
  const [selectedMaterialCost, setSelectedMaterialCost] = useState<IReactSelectOptions<number>>({ label: "", value: 0 })
  useEffect(() => {
    if (materialCostQuery.isSuccess && materialCostQuery.data) {
      setAllMaterialCostData([...materialCostQuery.data.map<IReactSelectOptions<number>>((value) => ({ label: value.costM19.toString(), value: value.id }))])
      if (materialCostQuery.data.length == 1) {
        setSelectedMaterialCost({ label: materialCostQuery.data[0].costM19.toString(), value: materialCostQuery.data[0].id })
        setInvoiceMaterial({
          ...invoiceMaterial,
          materialCost: materialCostQuery.data[0].costM19,
          materialCostID: materialCostQuery.data[0].id,
        })
      }
    }
  }, [materialCostQuery.data])
  const onMaterialCostSelect = (value: IReactSelectOptions<number> | null) => {
    if (!value) {
      setSelectedMaterialCost({ label: "", value: 0 })
      setInvoiceMaterial({ ...invoiceMaterial, materialCostID: 0, materialCost: 0 })
      return
    }

    setSelectedMaterialCost(value)
    if (materialCostQuery.isSuccess && materialCostQuery.data) {
      const materialCost = materialCostQuery.data!.find((cost) => cost.id == value.value)!
      setInvoiceMaterial({ ...invoiceMaterial, materialCostID: materialCost.id, materialCost: materialCost.costM19 })
    }
  }

  //ADDING MATERIAL TO LIST LOGIC
  const onAddClick = () => {

    if (invoiceMaterial.materialID == 0) {
      toast.error("Не выбран материал")
      return
    }

    const index = invoiceMaterials.findIndex((value) => value.materialID == invoiceMaterial.materialID)
    if (index != -1) {
      if (invoiceMaterial.materialCost == invoiceMaterials[index].materialCost) {
        toast.error("Такой материал с такой ценой уже был выбран. Выберите другой ценник или же другой материл")
        return
      }
    }

    if (invoiceMaterial.materialCostID == 0) {
      toast.error("Не выбрана цена материала")
      return
    }

    if (invoiceMaterial.amount <= 0) {
      toast.error("Неправильно указано количество")
      return
    }

    if (invoiceMaterial.hasSerialNumber && invoiceMaterial.serialNumbers.length !== invoiceMaterial.amount) {
      toast.error("Количство материала не совпадает с количеством серийных намеров")
      return
    }

    setInvoiceMaterials([invoiceMaterial, ...invoiceMaterials])
    setInvoiceMaterial({
      amount: 0,
      materialCostID: 0,
      materialName: "",
      materialCost: 0,
      materialID: 0,
      notes: "",
      unit: "",
      hasSerialNumber: false,
      serialNumbers: [],
    })
    setSelectedMaterial({ label: "", value: 0 })
    setSelectedMaterialCost({ label: "", value: 0 })
  }

  // DELETE MATERIAL LOGIC
  const onDeleteClick = (index: number) => {
    setInvoiceMaterials(invoiceMaterials.filter((_, i) => i != index))
  }

  //SUBMIT THE INVOICE LOGIC
  const queryClient = useQueryClient()
  const updateInvoiceWriteOffMutation = useMutation<InvoiceWriteOffMutation, Error, InvoiceWriteOffMutation>({
    mutationFn: updateInvoiceWriteOff,
    onSuccess: () => {
      queryClient.invalidateQueries(["invoice-writeoff", writeOffType])
      setShowEditModal(false)
    }
  })

  const onMutationSubmit = () => {

    if (!editInvoiceWriteOff.dateOfInvoice) {
      toast.error("Дата не выбрана")
      return
    }

    if (invoiceMaterials.length == 0) {
      toast.error("Накладная не имеет материалов")
      return
    }

    updateInvoiceWriteOffMutation.mutate({
      details: editInvoiceWriteOff,
      items: invoiceMaterials.map<InvoiceWriteOffItem>(val => ({
        materialCostID: val.materialCostID,
        amount: val.amount,
        notes: val.notes,
      }))
    })
  }

  return (
    <Modal setShowModal={setShowEditModal} bigModal>
      <div className="mb-2">
        <h3 className="text-2xl font-medium text-gray-800">
          Добавление накладной
        </h3>
      </div>
      <div className="flex flex-col w-full max-h-[85vh] ">
        <div className="flex flex-col">
          <p className="text-xl font-semibold text-gray-800">Детали накладной</p>
          <div className="flex space-x-2 items-center w-full">
            {(allTeamsQuery.isFetching || allObjectQuery.isFetching) &&
              <div className="flex h-full w-[200px] items-center">
                <LoadingDots height={40} />
              </div>
            }
            {(allTeamsQuery.isSuccess || allObjectQuery.isSuccess) &&
              <div className="flex flex-col space-y-1">
                <label htmlFor="warehouse-manager">
                  {writeOffType == "loss-team" && "Бригада"}
                  {writeOffType == "loss-object" && "Объект"}
                </label>
                <div className="w-[200px]">
                  <Select
                    className="basic-single"
                    classNamePrefix="select"
                    isSearchable={true}
                    isClearable={true}
                    name="warehouse-manager"
                    placeholder={""}
                    value={writeOffLocation}
                    options={availableLocations}
                    onChange={(value) => {
                      setWriteOffLocation(value ?? { label: "", value: 0 })
                      setEditInvoiceWriteOff({
                        ...editInvoiceWriteOff,
                        writeOffLocationID: value?.value ?? 0,
                      })
                    }}
                  />
                </div>
              </div>
            }
            <div className="flex flex-col space-y-1">
              <label htmlFor="dateOfInvoice">Дата накладной</label>
              <div className="py-[4px] px-[8px] border-[#cccccc] border rounded-[4px]">
                <DatePicker
                  name="dateOfInvoice"
                  className="outline-none w-full"
                  dateFormat={"dd-MM-yyyy"}
                  selected={editInvoiceWriteOff.dateOfInvoice}
                  onChange={(date) => setEditInvoiceWriteOff({ ...editInvoiceWriteOff, dateOfInvoice: date ?? new Date(+0) })}
                />
              </div>
            </div>
          </div>
          <div className="mt-4 flex">
            <div
              onClick={() => onMutationSubmit()}
              className="text-white py-2.5 px-5 rounded-lg bg-gray-700 hover:bg-gray-800 hover:cursor-pointer"
            >
              {updateInvoiceWriteOffMutation.isLoading
                ?
                <LoadingDots height={30} />
                :
                "Опубликовать"
              }
            </div>
          </div>
        </div>
        <div>
          <div className="flex space-x-2 items-center justify-between">
            <p className="text-xl font-semibold text-gray-800">Материалы наклданой</p>

          </div>
          <div className="grid grid-cols-6 text-sm font-bold shadow-md text-left mt-2 w-full border-box">
            {/* table head START */}
            <div className="px-4 py-3">
              <span>Наименование</span>
            </div>
            <div className="px-4 py-3">
              <span>Ед.Изм.</span>
            </div>
            <div className="px-4 py-3">
              <span>Количество</span>
            </div>
            <div className="px-4 py-3">
              <span>Цена</span>
            </div>
            <div className="px-4 py-3">
              <span>Примичание</span>
            </div>
            <div className="px-4 py-3"></div>
            {/* table head END */}
          </div>
          <div className="grid grid-cols-6 text-sm text-left mt-2 w-full border-box items-center">
            {materialQuery.isLoading &&
              <div className="px-4 py-3">
                <LoadingDots height={36} />
              </div>
            }
            {materialQuery.isSuccess &&
              <div className="px-4 py-3">
                <Select
                  className="basic-single"
                  classNamePrefix="select"
                  isSearchable={true}
                  isClearable={true}
                  menuPosition="fixed"
                  name={"materials"}
                  placeholder={""}
                  value={selectedMaterial}
                  options={allMaterialData}
                  onChange={(value) => onMaterialSelect(value)}
                />
              </div>
            }
            <div className="px-4 py-3 flex items-center">{invoiceMaterial.unit}</div>
            <div className="px-4 py-3">
              <Input
                name="amount"
                value={invoiceMaterial.amount}
                type="number"
                onChange={(e) => setInvoiceMaterial((prev) => ({ ...prev, amount: e.target.valueAsNumber }))}
              />
            </div>
            {materialCostQuery.isLoading &&
              <div className="px-4 py-3">
                <LoadingDots height={36} />
              </div>
            }
            {materialCostQuery.isSuccess &&
              <div className="px-4 py-3">
                <Select
                  className="basic-single"
                  classNamePrefix="select"
                  isSearchable={true}
                  isClearable={true}
                  menuPosition="fixed"
                  name={"materials-costs"}
                  placeholder={""}
                  value={selectedMaterialCost}
                  options={allMaterialCostData}
                  onChange={(value) => onMaterialCostSelect(value)}
                />
              </div>
            }
            <div className="px-4 py-3">
              <Input
                name="notes"
                value={invoiceMaterial.notes}
                type="text"
                onChange={(e) => setInvoiceMaterial((prev) => ({ ...prev, notes: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-2 text-center justify-items-center">
              {/* {invoiceMaterial.hasSerialNumber && */}
              {/*   <div> */}
              {/*     <IconButton */}
              {/*       icon={<FaBarcode */}
              {/*         size="25px" */}
              {/*         title={`Привязать серийные номера`} />} */}
              {/*       onClick={() => setShowSerialNumberAddModal(true)} */}
              {/*     /> */}
              {/*   </div> */}
              {/* } */}
              <div className="text-center">
                <IconButton
                  icon={<IoIosAddCircleOutline
                    size="25px"
                    title={`Привязать серийные номера`} />}
                  onClick={() => onAddClick()}
                />
              </div>
            </div>
          </div>
          {invoiceMaterials.length > 0 &&
            <div className="grid grid-cols-6 text-sm text-left mt-2 w-full border-box overflow-y-auto max-h-[35vh]">
              {invoiceMaterials.map((value, index) =>
                <Fragment key={index}>
                  <div className="px-4 py-3">{value.materialName}</div>
                  <div className="px-4 py-3">{value.unit}</div>
                  <div className="px-4 py-3">{value.amount}</div>
                  <div className="px-4 py-3">{value.materialCost}</div>
                  <div className="px-4 py-3">{value.notes}</div>
                  <div className="px-4 py-3 flex items-center">
                    <Button buttonType="delete" onClick={() => onDeleteClick(index)} text="Удалить" />
                  </div>
                </Fragment>
              )}
            </div>
          }
        </div>
      </div>
    </Modal>
  )
}

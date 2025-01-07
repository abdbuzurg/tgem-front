import Modal from "../../Modal";
import Select from 'react-select'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { IInvoiceInput, IInvoiceInputMaterials, IInvoiceInputView } from "../../../services/interfaces/invoiceInput";
import IReactSelectOptions from "../../../services/interfaces/react-select";
import { Fragment, useEffect, useState } from "react";
import IWorker from "../../../services/interfaces/worker";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getWorkerByJobTitle } from "../../../services/api/worker";
import Button from "../../UI/button";
import LoadingDots from "../../UI/loadingDots";
import Material from "../../../services/interfaces/material";
import getAllMaterials from "../../../services/api/materials/getAll";
import { IMaterialCost } from "../../../services/interfaces/materialCost";
import getMaterailCostByMaterialID from "../../../services/api/materialscosts/getByMaterailID";
import toast from "react-hot-toast";
import SerialNumberAddModal from "./SerialNumerAddModal";
import IconButton from "../../IconButtons";
import { IoIosAddCircleOutline } from "react-icons/io";
import { FaBarcode } from "react-icons/fa";
import AddNewMaterialModal from "./AddNewMaterialModal";
import Input from "../../UI/Input";
import { InvoiceInputMaterial, InvoiceInputMutation, getInvoiceInputMaterialsForEdit, updateInvoiceInput } from "../../../services/api/invoiceInput";

interface Props {
  setShowEditModal: React.Dispatch<React.SetStateAction<boolean>>
  invoiceInput: IInvoiceInputView
}

export default function EditInvoiceInput({
  setShowEditModal,
  invoiceInput,
}: Props) {

  const [editInvoiceInput, setEditInvoiceInput] = useState<IInvoiceInput>({
    projectID: 0,
    dateOfInvoice: invoiceInput.dateOfInvoice,
    deliveryCode: invoiceInput.deliveryCode,
    id: invoiceInput.id,
    notes: invoiceInput.notes,
    releasedWorkerID: 0,
    warehouseManagerWorkerID: 0,
    confirmation: false,
  })

  // SELECT WAREHOUSE MANAGER LOGIC
  const [selectedWarehouseManager, setSelectedWarehouseManager] = useState<IReactSelectOptions<number>>({ label: "", value: 0 })
  const [allWarehouseManagers, setAllWarehouseManagers] = useState<IReactSelectOptions<number>[]>([])
  const warehouseManagerQuery = useQuery<IWorker[], Error, IWorker[]>({
    queryKey: [`worker-warehouse-manager`],
    queryFn: () => getWorkerByJobTitle("Заведующий складом"),
  })
  useEffect(() => {
    if (warehouseManagerQuery.isSuccess && warehouseManagerQuery.data) {
      setAllWarehouseManagers(warehouseManagerQuery.data.map<IReactSelectOptions<number>>((val) => ({
        label: val.name,
        value: val.id,
      })))

      const alreadyWarehouseManager = warehouseManagerQuery.data.find((val) => val.name = invoiceInput.warehouseManagerName)!
      setSelectedWarehouseManager({
        label: alreadyWarehouseManager.name,
        value: alreadyWarehouseManager.id,
      })
      setEditInvoiceInput({
        ...editInvoiceInput,
        warehouseManagerWorkerID: alreadyWarehouseManager.id,
      })
    }
  }, [warehouseManagerQuery.data])

  // Invoice materials information
  const [invoiceMaterials, setInvoiceMaterials] = useState<IInvoiceInputMaterials[]>([])
  const invoiceMaterialsForEditQuery = useQuery<IInvoiceInputMaterials[], Error, IInvoiceInputMaterials[]>({
    queryKey: ["invoice-input-materials", invoiceInput.id],
    queryFn: () => getInvoiceInputMaterialsForEdit(invoiceInput.id)
  })
  useEffect(() => {
    if (invoiceMaterialsForEditQuery.isSuccess && invoiceMaterialsForEditQuery.data) {
      setInvoiceMaterials(invoiceMaterialsForEditQuery.data)
    }
  }, [invoiceMaterialsForEditQuery.data])

  const [invoiceMaterial, setInvoiceMaterial] = useState<IInvoiceInputMaterials>({
    amount: 0,
    materialID: 0,
    materialName: "",
    notes: "",
    materialCostID: 0,
    materialCost: 0,
    unit: "",
    hasSerialNumber: false,
    serialNumbers: []
  })

  // LOGIC OF ADDING NEW MATERIAL
  const [showAddNewMaterialDetaisModal, setShowAddNewMaterialDetailsModal] = useState(false)
  useEffect(() => {
    materialCostQuery.refetch()
    materialQuery.refetch()
  }, [showAddNewMaterialDetaisModal])

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
  //Serial number add modal logic   
  const [showSerialNumberAddModal, setShowSerialNumberAddModal] = useState(false)
  const addSerialNumbersToInvoice = (serialNumbers: string[]) => {
    setShowSerialNumberAddModal(false)
    setInvoiceMaterial({
      ...invoiceMaterial,
      serialNumbers: serialNumbers,
    })
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

  //EDIT SUBMIT
  const queryClient = useQueryClient()
  const updateInvoiceInputMutation = useMutation<InvoiceInputMutation, Error, InvoiceInputMutation>({
    mutationFn: updateInvoiceInput,
    onSuccess: () => {
      queryClient.invalidateQueries(["invoice-input"])
      setShowEditModal(false)
    }
  })

  const onEditMutationSubmit = () => {

    if (editInvoiceInput.warehouseManagerWorkerID == 0) {
      toast.error("Заведующий складом не выбран")
      return
    }

    if (!editInvoiceInput.dateOfInvoice) {
      toast.error("Дата не выбрана")
      return
    }

    if (invoiceMaterials.length == 0) {
      toast.error("Накладная не имеет материалов")
      return
    }

    updateInvoiceInputMutation.mutate({
      details: editInvoiceInput,
      items: [
        ...invoiceMaterials.map<InvoiceInputMaterial>((value) => ({
          materialData: {
            id: 0,
            amount: value.amount,
            invoiceID: 0,
            invoiceType: "input",
            materialCostID: value.materialCostID,
            notes: value.notes,
          },
          serialNumbers: value.serialNumbers,
        }))
      ],
    })

  }

  return (
    <Modal setShowModal={setShowEditModal} bigModal>
      <div className="mb-2">
        <h3 className="text-2xl font-medium text-gray-800">
          Изменение накладной {editInvoiceInput.deliveryCode}
        </h3>
      </div>
      <div className="flex flex-col w-full max-h-[85vh] ">
        <div className="flex flex-col">
          <p className="text-xl font-semibold text-gray-800">Детали накладной</p>
          <div className="flex space-x-2 items-center w-full">
            {warehouseManagerQuery.isLoading &&
              <div className="flex h-full w-[200px] items-center">
                <LoadingDots height={40} />
              </div>
            }
            {warehouseManagerQuery.isSuccess &&
              <div className="flex flex-col space-y-1">
                <label htmlFor="Заведующий складом">Зав. Склад</label>
                <div className="w-[200px]">
                  <Select
                    className="basic-single"
                    classNamePrefix="select"
                    isSearchable={true}
                    isClearable={true}
                    name="Заведующий складом"
                    placeholder={""}
                    value={selectedWarehouseManager}
                    options={allWarehouseManagers}
                    onChange={(value) => {
                      setSelectedWarehouseManager(value ?? { label: "", value: 0 })
                      setEditInvoiceInput({
                        ...editInvoiceInput,
                        warehouseManagerWorkerID: value?.value ?? 0,
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
                  selected={editInvoiceInput.dateOfInvoice}
                  onChange={(date) => setEditInvoiceInput({ ...editInvoiceInput, dateOfInvoice: date ?? new Date(+0) })}
                />
              </div>
            </div>
          </div>
          <div className="mt-4 flex">
            <div
              onClick={() => onEditMutationSubmit()}
              className="text-white py-2.5 px-5 rounded-lg bg-gray-700 hover:bg-gray-800 hover:cursor-pointer"
            >
              {updateInvoiceInputMutation.isLoading ? <LoadingDots height={30} /> : "Опубликовать Изменение"}
            </div>
          </div>
        </div>
        <div>
          <div className="flex space-x-2 items-center justify-between">
            <p className="text-xl font-semibold text-gray-800">Материалы наклданой</p>
            <div>
              <Button text="Добавить новые данные" onClick={() => setShowAddNewMaterialDetailsModal(true)} />
            </div>
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
              {invoiceMaterial.hasSerialNumber &&
                <div>
                  <IconButton
                    icon={<FaBarcode
                      size="25px"
                      title={`Привязать серийные номера`} />}
                    onClick={() => setShowSerialNumberAddModal(true)}
                  />
                </div>
              }
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
          {invoiceMaterialsForEditQuery.isLoading &&
            <div className="grid grid-cols-6 text-sm text-left mt-2 w-full border-box overflow-y-auto max-h-[35vh]">
              <div className="px-4 py-3 col-span-6">
                <LoadingDots height={30} />
              </div>
            </div>
          }
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
        {showAddNewMaterialDetaisModal && <AddNewMaterialModal setShowModal={setShowAddNewMaterialDetailsModal} />}
        {showSerialNumberAddModal &&
          <SerialNumberAddModal
            setShowModal={setShowSerialNumberAddModal}
            availableSerialNumber={invoiceMaterial.serialNumbers}
            addSerialNumbersToInvoice={addSerialNumbersToInvoice}
          />}
      </div>
    </Modal>
  )
} 

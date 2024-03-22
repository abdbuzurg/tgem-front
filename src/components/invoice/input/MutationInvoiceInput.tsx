import Modal from "../../Modal";
import Select from 'react-select'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import AddNewMaterialModal from "./AddNewMaterialModal";
import Button from "../../UI/button";
import WorkerSelect from "../../WorkerSelect";
import { Fragment, useEffect, useState } from "react";
import IReactSelectOptions from "../../../services/interfaces/react-select";
import Input from "../../UI/Input";
import { IInvoiceInput, IInvoiceInputMaterials } from "../../../services/interfaces/invoiceInput";
import getAllMaterials from "../../../services/api/materials/getAll";
import Material from "../../../services/interfaces/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { IMaterialCost } from "../../../services/interfaces/materialCost";
import getMaterailCostByMaterialID from "../../../services/api/materialscosts/getByMaterailID";
import { InvoiceInputMaterial, InvoiceInputMutation, createInvoiceInput } from "../../../services/api/invoiceInput";
import ErrorModal from "../../errorModal";
import SerialNumberAddModal from "./SerialNumerAddModal";
import toast from "react-hot-toast";

interface Props {
  setShowMutationModal: React.Dispatch<React.SetStateAction<boolean>>
  mutationType: "create" | "update"
}

export default function MutationInvoiceInput({
  setShowMutationModal,
  mutationType,
}: Props) {

  // Main invoice information
  const [mutationData, setMutationData] = useState<IInvoiceInput>({
    projectID: 1,
    dateOfAdd: new Date(),
    dateOfEdit: new Date(),
    dateOfInvoice: new Date(),
    deliveryCode: "",
    id: 0,
    notes: "",
    operatorAddWorkerID: 0,
    operatorEditWorkerID: 0,
    releasedWorkerID: 0,
    warehouseManagerWorkerID: 0,
    confirmation: false,
  })

  // SELECT LOGIC FOR MAIN INFORMATION IN INVOICE
  const [selectedWarehouseManagerWorkerID, setSelectedWarehouseManagerWorkerID] = useState<IReactSelectOptions<number>>({ label: "", value: 0 })
  const [selectedReleasedWorkerID, setSelectedReleasedWorkerID] = useState<IReactSelectOptions<number>>({ label: "", value: 0 })

  useEffect(() => {
    setMutationData({
      ...mutationData,
      releasedWorkerID: selectedReleasedWorkerID.value,
      warehouseManagerWorkerID: selectedWarehouseManagerWorkerID.value
    })
  }, [selectedReleasedWorkerID, selectedWarehouseManagerWorkerID])

  // Invoice materials information
  const [invoiceMaterials, setInvoiceMaterials] = useState<IInvoiceInputMaterials[]>([])
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
    materailCostQuery.refetch()
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
        ...materialQuery.data.map<IReactSelectOptions<number>>((value) => ({ value: value.id, label: value.name }))
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
  const materailCostQuery = useQuery<IMaterialCost[], Error>({
    queryKey: ["material-cost", invoiceMaterial.materialID],
    queryFn: () => getMaterailCostByMaterialID(invoiceMaterial.materialID),
  })
  const [allMaterialCostData, setAllMaterialCostData] = useState<IReactSelectOptions<number>[]>([])
  const [selectedMaterialCost, setSelectedMaterialCost] = useState<IReactSelectOptions<number>>({ label: "", value: 0 })
  useEffect(() => {
    if (materailCostQuery.isSuccess && materailCostQuery.data) {
      setAllMaterialCostData([...materailCostQuery.data.map<IReactSelectOptions<number>>((value) => ({ label: value.costM19.toString(), value: value.id }))])
      if (materailCostQuery.data.length == 1) {
        setSelectedMaterialCost({ label: materailCostQuery.data[0].costM19.toString(), value: materailCostQuery.data[0].id })
        setInvoiceMaterailErrors({ ...invoiceMaterialErrors, materialCostID: false })
        setInvoiceMaterial({
          ...invoiceMaterial,
          materialCost: materailCostQuery.data[0].costM19,
          materialCostID: materailCostQuery.data[0].id,
        })
      }
    }
  }, [materailCostQuery.data])
  const onMaterialCostSelect = (value: IReactSelectOptions<number> | null) => {
    if (!value) {
      setSelectedMaterialCost({ label: "", value: 0 })
      setInvoiceMaterial({ ...invoiceMaterial, materialCostID: 0, materialCost: 0 })
      return
    }

    setSelectedMaterialCost(value)
    if (materailCostQuery.isSuccess && materailCostQuery.data) {
      const materialCost = materailCostQuery.data!.find((cost) => cost.id == value.value)!
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
      toast("Не выбран материал")
      return
    }

    if (invoiceMaterials.findIndex((value) => value.materialID == invoiceMaterial.materialID) != -1) {
      toast("Такой материал уже был выбран")
      return
    }

    if (invoiceMaterial.materialCostID == 0) {
      toast("Не выбрана цена материала")
      return
    }

    if (invoiceMaterial.amount <= 0) {
      toast("Неправильно указано количество")
      return
    }

    if (invoiceMaterial.serialNumbers.length !== invoiceMaterial.amount) {
      toast("Количство материала не совпадает с количеством серийных намеров")
      return
    }

    setInvoiceMaterials([...invoiceMaterials, invoiceMaterial])
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
  const createMaterialMutation = useMutation<InvoiceInputMutation, Error, InvoiceInputMutation>({
    mutationFn: createInvoiceInput,
    onSettled: () => {
      queryClient.invalidateQueries(["invoice-input"])
      setShowMutationModal(false)
    }
  })
  // const updateMaterialMutation = useMutation<InvoiceInputMutation, Error, InvoiceInputMutation>({
  //   mutationFn: updateInvoiceInput,
  //   onSettled: () => {
  //     queryClient.invalidateQueries(["invoice-input"])
  //     setShowMutationModal(false)
  //   }
  // })

  const onMutationSubmit = () => {

    if (mutationData.warehouseManagerWorkerID == 0) {
      toast.error("Заведующий складом не выбран")
      return
    }

    if (mutationData.releasedWorkerID == 0) {
      toast.error("Выпускающий накладную не был выбран")
      return
    }

    if (!mutationData.dateOfInvoice) {
      toast.error("Дата не выбрана")
      return
    }

    if (invoiceMaterials.length == 0) {
      toast.error("Накладная не имеет материалов")
      return
    }

    switch (mutationType) {
      case "create":
        createMaterialMutation.mutate({
          details: mutationData,
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
        return
      case "update":
        // updateMaterialMutation.mutate(mutationData)
        return

      default:
        throw new Error("Неправильная операция была выбрана")
    }
  }

  return (
    <Modal setShowModal={setShowMutationModal} bigModal>
      <div className="mb-2">
        <h3 className="text-2xl font-medium text-gray-800">
          {mutationType == "create" && "Добавление накладной"}
          {mutationType == "update" && "Изменение накладной"}
        </h3>
      </div>
      <div className="flex flex-col w-full max-h-[85vh] ">
        <div className="flex flex-col">
          <p className="text-xl font-semibold text-gray-800">Детали накладной</p>
          <div className="flex space-x-2 items-center w-full">
            <WorkerSelect
              title="Зав. Складом"
              jobTitle="Заведующий складом"
              selectedWorkerID={selectedWarehouseManagerWorkerID}
              setSelectedWorkerID={setSelectedWarehouseManagerWorkerID}
            />
            <WorkerSelect
              title="Составил"
              jobTitle="Заведующий складом"
              selectedWorkerID={selectedReleasedWorkerID}
              setSelectedWorkerID={setSelectedReleasedWorkerID}
            />
            <div className="flex flex-col space-y-1">
              <label htmlFor="dateOfInvoice">Дата накладной</label>
              <div className="py-[4px] px-[8px] border-[#cccccc] border rounded-[4px]">
                <DatePicker
                  name="dateOfInvoice"
                  className="outline-none w-full"
                  dateFormat={"dd-MM-yyyy"}
                  selected={mutationData.dateOfInvoice}
                  onChange={(date) => setMutationData({ ...mutationData, dateOfInvoice: date ?? new Date(+0) })}
                />
              </div>
            </div>
          </div>
          <div className="mt-4">
            <Button text="Опубликовать" onClick={() => onMutationSubmit()} />
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
          <div className="grid grid-cols-6 text-sm text-left mt-2 w-full border-box">
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
            <div className="px-4 py-3 flex items-center">{invoiceMaterial.unit}</div>
            <div className="px-4 py-3">
              <Input
                name="amount"
                value={invoiceMaterial.amount}
                type="number"
                onChange={(e) => setInvoiceMaterial((prev) => ({ ...prev, amount: +e.target.value }))}
              />
            </div>
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
            <div className="px-4 py-3">
              <Input
                name="notes"
                value={invoiceMaterial.notes}
                type="text"
                onChange={(e) => setInvoiceMaterial((prev) => ({ ...prev, notes: e.target.value }))}
              />
            </div>
            <div className="flex items-center space-x-2">
              {invoiceMaterial.hasSerialNumber && <Button onClick={() => setShowSerialNumberAddModal(true)} text="Серийные номера" />}
              <Button onClick={() => onAddClick()} text="Добавить" />
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
        {showAddNewMaterialDetaisModal && <AddNewMaterialModal setShowModal={setShowAddNewMaterialDetailsModal} />}        
        {showSerialNumberAddModal && 
          <SerialNumberAddModal 
            setShowModal={setShowSerialNumberAddModal} 
            availableSerialNumber={invoiceMaterial.serialNumbers} 
            addSerialNumbersToInvoice={addSerialNumbersToInvoice} 
          />}
      </divf>
    </Modal>
  )
}

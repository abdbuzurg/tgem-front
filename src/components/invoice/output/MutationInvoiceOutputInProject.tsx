import { Fragment, useEffect, useState } from "react";
import DistrictSelect from "../../DistrictSelect";
import Modal from "../../Modal";
import ObjectSelect from "../../ObjectSelect";
import WorkerSelect from "../../WorkerSelect";
import IReactSelectOptions from "../../../services/interfaces/react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from 'react-select'
import Button from "../../UI/button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Input from '../../UI/Input'
import SerialNumberSelectModal from "./SerialNumberSelectModal";
import toast from "react-hot-toast";
import IconButton from "../../IconButtons";
import { FaBarcode } from "react-icons/fa";
import { IoIosAddCircleOutline } from "react-icons/io";
import { IInvoiceOutputInProject, IInvoiceOutputMaterials } from "../../../services/interfaces/invoiceOutputInProject";
import { AvailableMaterial, InvoiceOutputInProjectMutation, InvoiceOutputItem, createInvoiceOutputInProject, getAvailableMaterialsInWarehouse } from "../../../services/api/invoiceOutputInProject";
import { getTeamsByObjectID } from "../../../services/api/object";
import {  TeamDataForSelect } from "../../../services/interfaces/teams";

interface Props {
  setShowMutationModal: React.Dispatch<React.SetStateAction<boolean>>
  mutationType: "create" | "update"
}
export default function MutationInvoiceOutputInProject({ mutationType, setShowMutationModal }: Props) {
  const queryClient = useQueryClient()

  // MAIN INVOICE INFORMATION
  const [mutationData, setMutationData] = useState<IInvoiceOutputInProject>({
    dateOfInvoice: new Date(),
    deliveryCode: "",
    districtID: 0,
    id: 0,
    notes: "",
    objectID: 0,
    projectID: 0,
    recipientWorkerID: 0,
    releasedWorkerID: 0,
    teamID: 0,
    warehouseManagerWorkerID: 0,
    confirmation: false,
  })

  // ALL SELECTABLE IN MAIN INVOICE INFORMATION
  const [selectedWarehouseManagerWorkerID, setSelectedWarehouseManagerWorkerID] = useState<IReactSelectOptions<number>>({ label: "", value: 0 })
  const [selectedRecipientWorkerID, setSelectedRecipientWorkerID] = useState<IReactSelectOptions<number>>({ label: "", value: 0 })
  const [selectedObjectID, setSelectedObjectID] = useState<IReactSelectOptions<number>>({ label: "", value: 0 })
  const [selectedDistrictID, setSelectedDistrictID] = useState<IReactSelectOptions<number>>({ label: "", value: 0 })
  const [selectedTeamID, setSelectedTeamID] = useState<IReactSelectOptions<number>>({ label: "", value: 0 })
  useEffect(() => {
    if (selectedObjectID.value == 0) {
      setAllTeamsInObject([])
      setSelectedTeamID({label: "", value: 0})
    }
    setMutationData({
      ...mutationData,
      warehouseManagerWorkerID: selectedWarehouseManagerWorkerID.value,
      recipientWorkerID: selectedRecipientWorkerID.value,
      objectID: selectedObjectID.value,
      teamID: selectedTeamID.value,
      districtID: selectedDistrictID.value,
    })
  }, [
    selectedDistrictID,
    selectedObjectID,
    selectedRecipientWorkerID,
    selectedTeamID,
    selectedWarehouseManagerWorkerID
  ])

  const [allTeamsInObject, setAllTeamsInObject] = useState<IReactSelectOptions<number>[]>([])
  const allTeamsInObjectQuery = useQuery<TeamDataForSelect[], Error, TeamDataForSelect[]>({
    queryKey: ["teams-in-object", selectedObjectID.value],
    queryFn: () => getTeamsByObjectID(selectedObjectID.value),
    enabled: selectedObjectID.value != 0,
  })
  useEffect(() => {
    if (allTeamsInObjectQuery.data && allTeamsInObjectQuery.isSuccess) {
      setAllTeamsInObject(allTeamsInObjectQuery.data.map<IReactSelectOptions<number>>((val) => ({
        label: val.teamNumber + " (" + val.teamLeaderName + ")",
        value: val.id,
      })))
    }
  }, [allTeamsInObjectQuery.data])

  //INVOICE MATERIAL DATA
  const [invoiceMaterials, setInvoiceMaterials] = useState<IInvoiceOutputMaterials[]>([])
  const [invoiceMaterial, setInvoiceMaterial] = useState<IInvoiceOutputMaterials>({
    amount: 0,
    materialName: "",
    unit: "",
    warehouseAmount: 0,
    materialID: 0,
    notes: "",
    hasSerialNumber: false,
    serialNumbers: [],
  })

  //MATERIAL SELECT LOGIC
  const materialQuery = useQuery<AvailableMaterial[], Error, AvailableMaterial[]>({
    queryKey: ["available-materials"],
    queryFn: getAvailableMaterialsInWarehouse,
  })

  const [allMaterialData, setAllMaterialData] = useState<IReactSelectOptions<number>[]>([])
  const [selectedMaterial, setSelectedMaterial] = useState<IReactSelectOptions<number>>({ value: 0, label: "" })

  useEffect(() => {
    if (materialQuery.isSuccess && materialQuery.data) {
      setAllMaterialData([
        ...materialQuery.data.map<IReactSelectOptions<number>>((value) => ({
          value: value.id,
          label: value.name
        }))
      ])
    }
  }, [materialQuery.data])

  const onMaterialSelect = (value: IReactSelectOptions<number> | null) => {
    if (!value) {
      setSelectedMaterial({ label: "", value: 0 })
      setInvoiceMaterial({
        ...invoiceMaterial,
        unit: "",
        materialID: 0,
        materialName: "",
        warehouseAmount: 0,
        hasSerialNumber: false,
        serialNumbers: [],
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
        warehouseAmount: material.amount,
        hasSerialNumber: material.hasSerialNumber,
        serialNumbers: [],
      })
    }
  }
  //Serial Number modal logic 
  const [showSerialNumberSelectModal, setShowSerialNumberSelectModal] = useState(false)
  const addSerialNumbersToInvoice = (serialNumbers: string[]) => {
    setShowSerialNumberSelectModal(false)
    setInvoiceMaterial({
      ...invoiceMaterial,
      serialNumbers: serialNumbers,
    })
  }

  //ADD MATERIAL LOGIC
  const onAddClick = () => {

    const materialExistIndex = invoiceMaterials.findIndex((value) =>
      value.materialID == invoiceMaterial.materialID
    )
    if (materialExistIndex !== -1) {
      toast.error("Данный материал уже в списке. Используйте другой")
      return
    }

    if (invoiceMaterial.materialID == 0) {
      toast.error("Не выбран материал")
      return
    }

    if (invoiceMaterial.amount <= 0) {
      toast.error("Неправильно указано количество материала")
      return
    }

    if (invoiceMaterial.amount > invoiceMaterial.warehouseAmount) {
      toast.error("Указаное количество привышает доступное количество на складе")
      return
    }

    if (invoiceMaterial.hasSerialNumber && invoiceMaterial.amount != invoiceMaterial.serialNumbers.length) {
      toast.error("Указанное количество материалов и количество добавленных серийных номеров не совпадают")
      return
    }

    setInvoiceMaterials([invoiceMaterial, ...invoiceMaterials,])
    setSelectedMaterial({ label: "", value: 0 })
    setInvoiceMaterial({
      amount: 0,
      materialName: "",
      unit: "",
      warehouseAmount: 0,
      materialID: 0,
      notes: "",
      hasSerialNumber: false,
      serialNumbers: [],
    })
  }

  //DELETE MATERIAL LOGIC
  const onDeleteClick = (index: number) => {
    setInvoiceMaterials(invoiceMaterials.filter((_, i) => i != index))
  }

  // SUBMIT INVOICE LOGIC
  const createInvoiceOutputMutation = useMutation<InvoiceOutputInProjectMutation, Error, InvoiceOutputInProjectMutation>({
    mutationFn: createInvoiceOutputInProject,
    onSettled: () => {
      queryClient.invalidateQueries(["invoice-output-in-project"])
      setShowMutationModal(false)
    }
  })

  const onMutationSubmit = () => {

    if (mutationData.warehouseManagerWorkerID == 0) {
      toast.error("Не указан заведующий складом")
      return
    }

    if (mutationData.districtID == 0) {
      toast.error("Не указан район")
      return
    }

    if (mutationData.objectID == 0) {
      toast.error("Не указан объект")
      return
    }

    if (mutationData.recipientWorkerID == 0) {
      toast.error("Не указан получатель")
      return
    }

    if (mutationData.teamID == 0) {
      toast.error("Не указана бригада")
      return
    }

    if (invoiceMaterials.length == 0) {
      toast.error("Накладная должна иметь хотя бы 1 материал")
      return
    }

    switch (mutationType) {
      case "create":
        console.log(invoiceMaterials)
        createInvoiceOutputMutation.mutate({
          details: mutationData,
          items: [
            ...invoiceMaterials.map<InvoiceOutputItem>((value) => ({
              materialID: value.materialID,
              amount: value.amount,
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
      <div className="flex flex-col w-full max-h-[80vh]">
        <div className="flex flex-col space-y-2">
          <p className="text-xl font-semibold text-gray-800">Детали накладной</p>
          <div className="flex space-x-2 items-center w-full">
            <DistrictSelect
              selectedDistrictID={selectedDistrictID}
              setSelectedDistrictID={setSelectedDistrictID}
            />
            <WorkerSelect
              title="Зав. Складом"
              jobTitle="Заведующий складом"
              selectedWorkerID={selectedWarehouseManagerWorkerID}
              setSelectedWorkerID={setSelectedWarehouseManagerWorkerID}
            />
            <WorkerSelect
              title="Получатель"
              jobTitle="Бригадир"
              selectedWorkerID={selectedRecipientWorkerID}
              setSelectedWorkerID={setSelectedRecipientWorkerID}
            />
          </div>
          <div className="flex space-x-2 items-center w-full">
            <ObjectSelect
              selectedObjectID={selectedObjectID}
              setSelectedObjectID={setSelectedObjectID}
            />
            <div className="flex flex-col space-y-1">
              <label htmlFor={"teams"}>Бригады</label>
              <div className="w-[200px]">
                <Select
                  className="basic-single"
                  classNamePrefix="select"
                  isSearchable={true}
                  isClearable={true}
                  menuPosition="fixed"
                  name={"teams"}
                  placeholder={""}
                  value={selectedTeamID}
                  options={allTeamsInObject}
                  onChange={(value) => setSelectedTeamID({
                    label: value!.label ?? "",
                    value: value!.value ?? 0,
                  })}
                />
              </div>
            </div>
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
          <div className="grid grid-cols-6 text-sm font-bold shadow-md text-left mt-2 w-full border-box">
            {/* table head START */}
            <div className="px-4 py-3">
              <span>Наименование</span>
            </div>
            <div className="px-4 py-3">
              <span>Ед.Изм.</span>
            </div>
            <div className="px-4 py-3">
              <span>На складе</span>
            </div>
            <div className="px-4 py-3">
              <span>Количество</span>
            </div>
            <div className="px-4 py-3">
              <span>Примичание</span>
            </div>
            <div className="px-4 py-3"></div>
            {/* table head END */}
          </div>
          <div className="grid grid-cols-6 text-sm text-left mt-2 w-full border-box ">
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
            <div className="px-4 py-3 flex items-center">{invoiceMaterial.warehouseAmount}</div>
            <div className="px-4 py-3">
              <Input
                name="amount"
                value={invoiceMaterial.amount}
                type="number"
                onChange={(e) => setInvoiceMaterial((prev) => ({ ...prev, amount: e.target.valueAsNumber }))}
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
            <div className="grid grid-cols-2 gap-2 text-center items-center">
              {invoiceMaterial.hasSerialNumber &&
                <div>
                  <IconButton
                    icon={<FaBarcode
                      size="25px"
                      title={`Привязать серийные номера`} />}
                    onClick={() => setShowSerialNumberSelectModal(true)}
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
          <div className="grid grid-cols-6 text-sm text-left mt-2 w-full border-box overflow-y-scroll max-h-[30vh]">
            {invoiceMaterials.map((value, index) =>
              <Fragment key={index}>
                <div className="px-4 py-3">{value.materialName}</div>
                <div className="px-4 py-3">{value.unit}</div>
                <div className="px-4 py-3">{value.warehouseAmount}</div>
                <div className="px-4 py-3">{value.amount}</div>
                <div className="px-4 py-3">{value.notes}</div>
                <div className="px-4 py-3 flex items-center">
                  <Button buttonType="delete" onClick={() => onDeleteClick(index)} text="Удалить" />
                </div>
              </Fragment>
            )}
          </div>
        </div>
      </div>
      {showSerialNumberSelectModal && <SerialNumberSelectModal
        addSerialNumbersToInvoice={addSerialNumbersToInvoice}
        materialID={invoiceMaterial.materialID}
        setShowModal={setShowSerialNumberSelectModal}
        alreadySelectedSerialNumers={invoiceMaterial.serialNumbers}
      />
      }
    </Modal>
  )
}

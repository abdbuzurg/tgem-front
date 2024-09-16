import Modal from "../../Modal";
import IReactSelectOptions from "../../../services/interfaces/react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from 'react-select'
import { Fragment, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllDistricts } from "../../../services/api/district";
import { IDistrict } from "../../../services/interfaces/district";
import { IInvoiceOutputInProject, IInvoiceOutputInProjectView, IInvoiceOutputMaterials } from "../../../services/interfaces/invoiceOutputInProject";
import IWorker from "../../../services/interfaces/worker";
import { getAllWorkers, getWorkerByJobTitle } from "../../../services/api/worker";
import { TeamDataForSelect } from "../../../services/interfaces/teams";
import { getAllTeamsForSelect } from "../../../services/api/team";
import Button from "../../UI/button";
import { AvailableMaterial, InvoiceOutputInProjectMutation, InvoiceOutputItem, getAvailableMaterialsInWarehouse, getInvoiceOutputInProjectMaterialsForEdit, updateInvoiceOutputInProject } from "../../../services/api/invoiceOutputInProject";
import toast from "react-hot-toast";
import Input from "../../UI/Input";
import IconButton from "../../IconButtons";
import { FaBarcode } from "react-icons/fa";
import { IoIosAddCircleOutline } from "react-icons/io";
import SerialNumberSelectModal from "./SerialNumberSelectModal";
import LoadingDots from "../../UI/loadingDots";

interface Props {
  setShowEditModal: React.Dispatch<React.SetStateAction<boolean>>
  invoiceOutputInProject: IInvoiceOutputInProjectView,
}

export default function EditInvoiceOutputInProject({
  setShowEditModal,
  invoiceOutputInProject,
}: Props) {

  const [editInvoiceOutputInProject, setEditInvoiceOutputInProject] = useState<IInvoiceOutputInProject>({
    id: invoiceOutputInProject.id,
    projectID: 0,
    warehouseManagerWorkerID: 0,
    releasedWorkerID: 0,
    districtID: 0,
    teamID: 0,
    recipientWorkerID: 0,
    deliveryCode: invoiceOutputInProject.deliveryCode,
    notes: invoiceOutputInProject.notes,
    dateOfInvoice: new Date(invoiceOutputInProject.dateOfInvoice),
    confirmation: false,
  })

  // DISTRICT LOGIC
  const [selectedDistrict, setSelectedDistrict] = useState<IReactSelectOptions<number>>({ label: "", value: 0 })
  const [allDistricts, setAllDistricts] = useState<IReactSelectOptions<number>[]>([])
  const allDistrictsQuery = useQuery<IDistrict[], Error, IDistrict[]>({
    queryKey: ["all-districts"],
    queryFn: getAllDistricts,
  })
  useEffect(() => {
    if (allDistrictsQuery.isSuccess && allDistrictsQuery.data) {
      setAllDistricts(allDistrictsQuery.data.map<IReactSelectOptions<number>>(val => ({
        label: val.name,
        value: val.id,
      })))

      const alreadySelectedDistrict = allDistrictsQuery.data.find(val => val.name == invoiceOutputInProject.districtName)!
      setEditInvoiceOutputInProject((prev) => ({
        ...prev,
        districtID: alreadySelectedDistrict.id
      }))

      setSelectedDistrict({
        label: alreadySelectedDistrict.name,
        value: alreadySelectedDistrict.id,
      })

    }
  }, [allDistrictsQuery.data])

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

      const alreadyWarehouseManager = warehouseManagerQuery.data.find((val) => val.name = invoiceOutputInProject.warehouseManagerName)!
      setEditInvoiceOutputInProject(prev => ({
        ...prev,
        warehouseManagerWorkerID: alreadyWarehouseManager.id,
      }))
      setSelectedWarehouseManager({
        label: alreadyWarehouseManager.name,
        value: alreadyWarehouseManager.id,
      })

    }
  }, [warehouseManagerQuery.data])

  // SELECT RECIPIENT LOGIC
  const [selectedRecipient, setSelectedRecipient] = useState<IReactSelectOptions<number>>({ label: "", value: 0 })
  const [allRecipients, setAllRecipients] = useState<IReactSelectOptions<number>[]>([])
  const recipientsQuery = useQuery<IWorker[], Error, IWorker[]>({
    queryKey: [`all-workers`],
    queryFn: getAllWorkers,
  })
  useEffect(() => {
    if (recipientsQuery.isSuccess && recipientsQuery.data) {
      setAllRecipients(recipientsQuery.data.map<IReactSelectOptions<number>>((val) => ({
        label: val.name,
        value: val.id,
      })))

      const alreadyRecipient = recipientsQuery.data.find((val) => val.name = invoiceOutputInProject.recipientName)!
      setSelectedRecipient({
        label: alreadyRecipient.name,
        value: alreadyRecipient.id,
      })
      setEditInvoiceOutputInProject(prev => ({
        ...prev,
        recipientWorkerID: alreadyRecipient.id,
      }))
    }
  }, [recipientsQuery.data])

  //TEAM SELECT LOGIC
  const [selectedTeam, setSelectedTeam] = useState<IReactSelectOptions<number>>({ label: "", value: 0 })
  const [allTeams, setAllTeams] = useState<IReactSelectOptions<number>[]>([])
  const allTeamsQuery = useQuery<TeamDataForSelect[], Error, TeamDataForSelect[]>({
    queryKey: ["all-teams-for-select"],
    queryFn: getAllTeamsForSelect,
  })
  useEffect(() => {
    if (allTeamsQuery.data && allTeamsQuery.isSuccess) {
      setAllTeams(allTeamsQuery.data.map<IReactSelectOptions<number>>((val) => ({
        label: val.teamNumber + " (" + val.teamLeaderName + ")",
        value: val.id,
      })))

      const alreadyTeam = allTeamsQuery.data.find((val) => val.teamNumber = invoiceOutputInProject.teamName)!
      console.log(alreadyTeam, invoiceOutputInProject)
      setSelectedTeam({
        label: alreadyTeam.teamNumber + " (" + alreadyTeam.teamLeaderName + ")",
        value: alreadyTeam.id,
      })
      setEditInvoiceOutputInProject(prev => ({
        ...prev,
        teamID: alreadyTeam.id,
      }))
    }
  }, [allTeamsQuery.data])

  //INVOICE MATERIAL DATA
  const [invoiceMaterials, setInvoiceMaterials] = useState<IInvoiceOutputMaterials[]>([])
  const invoiceMaterialsQuery = useQuery<IInvoiceOutputMaterials[], Error, IInvoiceOutputMaterials[]>({
    queryKey: ["invoice-output-materials", invoiceOutputInProject.id],
    queryFn: () => getInvoiceOutputInProjectMaterialsForEdit(invoiceOutputInProject.id)
  })
  useEffect(() => {
    if (invoiceMaterialsQuery.isSuccess && invoiceMaterialsQuery.data) {
      const realData: IInvoiceOutputMaterials[] = []
      invoiceMaterialsQuery.data.forEach((val) => {
        if (realData.includes(val)) {
          const index = realData.findIndex(value => value.materialName == val.materialName)
          realData[index].amount + val.amount
        } else {
          realData.push(val)
        }
      })

      setInvoiceMaterials(realData)
    }
  }, [invoiceMaterialsQuery.data])
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

  //EDIT SUBMIT
  const queryClient = useQueryClient()
  const updateInvoiceOutputInProjectMutation = useMutation<InvoiceOutputInProjectMutation, Error, InvoiceOutputInProjectMutation>({
    mutationFn: updateInvoiceOutputInProject,
    onSuccess: () => {
      queryClient.invalidateQueries(["invoice-output-in-project"])
      setShowEditModal(false)
    },
    onError: (err) => {
      toast.error(`Ошибка при изменение накладной: ${err.message}`)
    }
  })

  const onEditMutationSubmit = () => {
    if (editInvoiceOutputInProject.warehouseManagerWorkerID == 0) {
      toast.error("Не указан заведующий складом")
      return
    }

    if (editInvoiceOutputInProject.districtID == 0) {
      toast.error("Не указан район")
      return
    }

    if (editInvoiceOutputInProject.recipientWorkerID == 0) {
      toast.error("Не указан получатель")
      return
    }

    if (editInvoiceOutputInProject.teamID == 0) {
      toast.error("Не указана бригада")
      return
    }

    if (invoiceMaterials.length == 0) {
      toast.error("Накладная должна иметь хотя бы 1 материал")
      return
    }

    updateInvoiceOutputInProjectMutation.mutate({
      details: editInvoiceOutputInProject,
      items: [
        ...invoiceMaterials.map<InvoiceOutputItem>((value) => ({
          materialID: value.materialID,
          amount: value.amount,
          serialNumbers: value.serialNumbers,
        }))
      ],
    })
    return

  }

  return (
    <Modal setShowModal={setShowEditModal} bigModal>
      <div className="mb-2">
        <h3 className="text-2xl font-medium text-gray-800">
          Изменение накладной {editInvoiceOutputInProject.deliveryCode}
        </h3>
      </div>
      <div className="flex flex-col w-full max-h-[80vh]">
        <div className="flex flex-col space-y-2">
          <p className="text-xl font-semibold text-gray-800">Детали накладной</p>
          <div className="flex space-x-2 items-center w-full">

            {allDistrictsQuery.isLoading &&
              <div className="flex h-full w-[200px] items-center">
                <LoadingDots height={40} />
              </div>
            }
            {allDistrictsQuery.isSuccess &&
              <div className="flex flex-col space-y-1">
                <label htmlFor="districts">Район</label>
                <div className="w-[200px]">
                  <Select
                    className="basic-single"
                    classNamePrefix="select"
                    isSearchable={true}
                    isClearable={true}
                    name={"districts"}
                    placeholder={""}
                    value={selectedDistrict}
                    options={allDistricts}
                    onChange={(value) => {
                      setSelectedDistrict(value ?? { label: "", value: 0 })
                      setEditInvoiceOutputInProject({
                        ...editInvoiceOutputInProject,
                        districtID: value?.value ?? 0,
                      })
                    }}
                  />
                </div>
              </div>
            }

            {warehouseManagerQuery.isLoading &&
              <div className="flex h-full w-[200px] items-center">
                <LoadingDots height={40} />
              </div>
            }
            {warehouseManagerQuery.isSuccess &&
              <div className="flex flex-col space-y-1">
                <label htmlFor="warehouse-manager">Зав. склад</label>
                <div className="w-[200px]">
                  <Select
                    className="basic-single"
                    classNamePrefix="select"
                    isSearchable={true}
                    isClearable={true}
                    name={"warehouse-manager"}
                    placeholder={""}
                    value={selectedWarehouseManager}
                    options={allWarehouseManagers}
                    onChange={(value) => {
                      setSelectedWarehouseManager(value ?? { label: "", value: 0 })
                      setEditInvoiceOutputInProject({
                        ...editInvoiceOutputInProject,
                        warehouseManagerWorkerID: value?.value ?? 0,
                      })
                    }}
                  />
                </div>
              </div>
            }

            {recipientsQuery.isLoading &&
              <div className="flex h-full w-[200px] items-center">
                <LoadingDots height={40} />
              </div>
            }
            {recipientsQuery.isSuccess &&
              <div className="flex flex-col space-y-1">
                <label htmlFor="recipient">Получатель</label>
                <div className="w-[200px]">
                  <Select
                    className="basic-single"
                    classNamePrefix="select"
                    isSearchable={true}
                    isClearable={true}
                    name={"recipient"}
                    placeholder={""}
                    value={selectedRecipient}
                    options={allRecipients}
                    onChange={(value) => {
                      setSelectedRecipient(value ?? { label: "", value: 0 })
                      setEditInvoiceOutputInProject({
                        ...editInvoiceOutputInProject,
                        recipientWorkerID: value?.value ?? 0,
                      })
                    }}
                  />
                </div>
              </div>
            }
          </div>
          <div className="flex space-x-2 items-center w-full">

            {allTeamsQuery.isLoading &&
              <div className="flex h-full w-[200px] items-center">
                <LoadingDots height={40} />
              </div>
            }
            {allTeamsQuery.isSuccess &&
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
                    value={selectedTeam}
                    options={allTeams}
                    onChange={(value) => {
                      setSelectedTeam(value ?? { label: "", value: 0 })
                      setEditInvoiceOutputInProject({
                        ...editInvoiceOutputInProject,
                        teamID: value?.value ?? 0,
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
                  selected={editInvoiceOutputInProject.dateOfInvoice}
                  onChange={(date) => setEditInvoiceOutputInProject({ ...editInvoiceOutputInProject, dateOfInvoice: date ?? new Date(+0) })}
                />
              </div>
            </div>
          </div>
          <div className="mt-4 flex">
            <div
              onClick={() => onEditMutationSubmit()}
              className="text-white py-2.5 px-5 rounded-lg bg-gray-700 hover:bg-gray-800 hover:cursor-pointer"
            >
              {updateInvoiceOutputInProjectMutation.isLoading ? <LoadingDots height={30} /> : "Опубликовать изменения"}
            </div>
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
            {invoiceMaterialsQuery.isLoading &&
              <div className="col-span-6">
                <LoadingDots height={30} />
              </div>
            }
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

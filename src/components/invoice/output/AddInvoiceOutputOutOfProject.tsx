import Modal from "../../Modal"
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from 'react-select'
import Input from "../../UI/Input";
import IconButton from "../../IconButtons";
import { IoIosAddCircleOutline } from "react-icons/io";
import { Fragment, useEffect, useState } from "react";
import Button from "../../UI/button";
import LoadingDots from "../../UI/loadingDots";
import { InvoiceOutputOutOfProject } from "../../../services/interfaces/invoiceOutputOutOfProject";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Project from "../../../services/interfaces/project";
import { GetAllProjects } from "../../../services/api/project";
import IReactSelectOptions from "../../../services/interfaces/react-select";
import { IInvoiceOutputMaterials } from "../../../services/interfaces/invoiceOutputInProject";
import { AvailableMaterial, InvoiceOutputItem, getAvailableMaterialsInWarehouse } from "../../../services/api/invoiceOutputInProject";
import toast from "react-hot-toast";
import { InvoiceOutputOutOfProjectMutation, createInvoiceOutputOfOutProject } from "../../../services/api/invoiceOutputOutOfProject";

interface Props {
  setShowAddModal: React.Dispatch<React.SetStateAction<boolean>>
}

export default function AddInvoiceOutputOutOfProject({ setShowAddModal }: Props) {

  const [addInvoiceOutputOutOfProject, setAddInvoiceOutputOutOfProject] = useState<InvoiceOutputOutOfProject>({
    id: 0,
    fromProjectID: 0,
    toProjectID: 0,
    dateOfInvoice: new Date(),
    releasedWorkerID: 0,
    confirmation: false,
    deliveryCode: "",
    notes: "",
  })

  const [selectedProject, setSelectedProject] = useState<IReactSelectOptions<number>>({ label: "", value: 0 })
  const [allProjects, setAllProjects] = useState<IReactSelectOptions<number>[]>([])
  const allProjectsQuery = useQuery<Project[], Error, Project[]>({
    queryKey: ["all-projects"],
    queryFn: GetAllProjects,
  })
  useEffect(() => {
    if (allProjectsQuery.isSuccess && allProjectsQuery.data) {
      setAllProjects(allProjectsQuery.data.
        filter(val => val.name != "Администрирование" && val.name != "Test Project").
        map<IReactSelectOptions<number>>(val => ({
          label: val.name + " (" + val.projectManager + ")",
          value: val.id,
        }))
      )
    }
  }, [allProjectsQuery.data])

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

  const queryClient = useQueryClient()
  const createInvoiceOutputOutOfProjectMutation = useMutation<InvoiceOutputOutOfProjectMutation, Error, InvoiceOutputOutOfProjectMutation>({
    mutationFn: createInvoiceOutputOfOutProject,
    onSuccess: () => {
      queryClient.invalidateQueries(["invoice-output-out-of-project"])
      setShowAddModal(false)
    }
  })

  const onMutationSubmit = () => {

    if (addInvoiceOutputOutOfProject.toProjectID == 0) {
      toast.error("Не указан проект")
      return
    }

    createInvoiceOutputOutOfProjectMutation.mutate({
      details: addInvoiceOutputOutOfProject,
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
    <Modal setShowModal={setShowAddModal} bigModal>
      <div className="mb-2">
        <h3 className="text-2xl font-medium text-gray-800">
          Добавление накладной
        </h3>
      </div>
      <div className="flex flex-col w-full max-h-[80vh]">
        <div className="flex flex-col space-y-2">
          <p className="text-xl font-semibold text-gray-800">Детали накладной</p>
          <div className="flex space-x-2 items-center w-full">
            {allProjectsQuery.isLoading &&
              <div className="flex h-full w-[200px] items-center">
                <LoadingDots height={40} />
              </div>
            }
            {allProjectsQuery.isSuccess &&
              <div className="flex flex-col space-y-1">
                <label htmlFor="to-project">Проект</label>
                <div className="w-[200px]">
                  <Select
                    className="basic-single"
                    classNamePrefix="select"
                    isSearchable={true}
                    isClearable={true}
                    name="to-project"
                    placeholder={""}
                    value={selectedProject}
                    options={allProjects}
                    onChange={(value) => {
                      setSelectedProject(value ?? { label: "", value: 0 })
                      setAddInvoiceOutputOutOfProject({
                        ...addInvoiceOutputOutOfProject,
                        toProjectID: value?.value ?? 0,
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
                  selected={addInvoiceOutputOutOfProject.dateOfInvoice}
                  onChange={(date) => setAddInvoiceOutputOutOfProject({ ...addInvoiceOutputOutOfProject, dateOfInvoice: date ?? new Date(+0) })}
                />
              </div>
            </div>
          </div>
          <div className="mt-4 flex">
            <div
              onClick={() => onMutationSubmit()}
              className="text-white py-2.5 px-5 rounded-lg bg-gray-700 hover:bg-gray-800 hover:cursor-pointer"
            >
              {createInvoiceOutputOutOfProjectMutation.isLoading ? <LoadingDots height={30} /> : "Опубликовать"}
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
            {materialQuery.isLoading &&
              <div className="flex h-full items-center px-4 py-3">
                <LoadingDots height={40} />
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
            <div className="px-4 py-3 flex items-center">
              {invoiceMaterial.warehouseAmount}
            </div>
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
              {/* {invoiceMaterial.hasSerialNumber && */}
              {/*   <div> */}
              {/*     <IconButton */}
              {/*       icon={<FaBarcode */}
              {/*         size="25px" */}
              {/*         title={`Привязать серийные номера`} />} */}
              {/*       onClick={() => setShowSerialNumberSelectModal(true)} */}
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
    </Modal>
  )
}

import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { ENTRY_LIMIT } from "../../services/api/constants";
import getPaginatedMaterials, { MaterialsGetAllResponse } from "../../services/api/materials/getPaginated";
import Material from "../../services/interfaces/material";
import Button from "../../components/UI/button";
import deleteMaterial from "../../services/api/materials/delete";
import LoadingDots from "../../components/UI/loadingDots";
import DeleteModal from "../../components/deleteModal";
import Modal from "../../components/Modal";
import Input from "../../components/UI/Input";
import createMaterial from "../../services/api/materials/create";
import updateMaterial from "../../services/api/materials/update";
import { MEASUREMENT } from "../../services/lib/measurement";
import IReactSelectOptions from "../../services/interfaces/react-select";
import Select from "react-select"
import { getMaterialTemplateDocument, importMaterials } from "../../services/api/material";
import toast from "react-hot-toast";

export default function Materials() {
  //FETCHING LOGIC
  const tableDataQuery = useInfiniteQuery<MaterialsGetAllResponse, Error>({
    queryKey: ["materials"],
    queryFn: ({ pageParam }) => getPaginatedMaterials({ pageParam }),
    getNextPageParam: (lastPage) => {
      if (lastPage.page * ENTRY_LIMIT > lastPage.count) return undefined
      return lastPage.page + 1
    }
  })
  const [tableData, setTableData] = useState<Material[]>([])
  useEffect(() => {
    if (tableDataQuery.isSuccess && tableDataQuery.data) {
      const data: Material[] = tableDataQuery.data.pages.reduce<Material[]>((acc, page) => [...acc, ...page.data], [])
      setTableData(data)
    }
  }, [tableDataQuery.data])

  const loadDataOnScrollEnd = () => {
    if (window.innerHeight + document.documentElement.scrollTop !== document.documentElement.offsetHeight) return;
    tableDataQuery.fetchNextPage()
  }
  useEffect(() => {
    window.addEventListener("scroll", loadDataOnScrollEnd)
    return () => window.removeEventListener("scroll", loadDataOnScrollEnd)
  }, [])

  //DELETION LOGIC
  const [showModal, setShowModal] = useState(false)
  const queryClient = useQueryClient()
  const deleteMutation = useMutation({
    mutationFn: deleteMaterial,
    onSuccess: () => {
      queryClient.invalidateQueries(["materials"])
    }
  })
  const [modalProps, setModalProps] = useState({
    setShowModal: setShowModal,
    no_delivery: "",
    deleteFunc: () => { }
  })
  const onDeleteButtonClick = (row: Material) => {
    setShowModal(true)
    setModalProps({
      deleteFunc: () => deleteMutation.mutate(row.id),
      no_delivery: row.name,
      setShowModal: setShowModal,
    })
  }

  // MUTATION LOGIC
  const [showMutationModal, setShowMutationModal] = useState(false)
  const [mutationModalType, setMutationModalType] = useState<null | "update" | "create">()
  const [materialMutationData, setMaterialMutationData] = useState<Material>({
    category: "",
    code: "",
    id: 0,
    name: "",
    notes: "",
    unit: "",
    article: "",
    hasSerialNumber: false,
  })

  const measurements = MEASUREMENT.map<IReactSelectOptions<string>>((value) => ({ label: value, value: value }))
  const [selectedMeasurement, setSelectedMeasurement] = useState<IReactSelectOptions<string>>({ label: "", value: "" })
  const onMeasurementSelect = (value: null | IReactSelectOptions<string>) => {
    if (!value) {
      setSelectedMeasurement({ label: "", value: "" })
      setMaterialMutationData({ ...materialMutationData, unit: "" })
      return
    }

    setSelectedMeasurement(value)
    setMaterialMutationData({ ...materialMutationData, unit: value.value })
  }

  const createMaterialMutation = useMutation<Material, Error, Material>({
    mutationFn: createMaterial,
    onSettled: () => {
      queryClient.invalidateQueries(["materials"])
      setShowMutationModal(false)
    }
  })
  const updateMaterialMutation = useMutation<Material, Error, Material>({
    mutationFn: updateMaterial,
    onSettled: () => {
      queryClient.invalidateQueries(["materials"])
      setShowMutationModal(false)
    }
  })

  const onMutationSubmit = () => {

    if (materialMutationData.category == "") {
      toast.error("Не указана категория материала")
      return
    }

    if (materialMutationData.name == "") {
      toast.error("Не указано наименование материала")
      return
    }

    if (materialMutationData.unit == "") {
      toast.error("Не указана еденица измерения материала")
      return
    }

    switch (mutationModalType) {
      case "create":
        createMaterialMutation.mutate(materialMutationData)
        return
      case "update":
        updateMaterialMutation.mutate(materialMutationData)
        return

      default:
        throw new Error("Неправильная операция была выбрана")
    }
  }

  const [showImportModal, setShowImportModal] = useState(false)

  const importMutation = useMutation<boolean, Error, File>({
    mutationFn: importMaterials,
  })

  const acceptExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    importMutation.mutate(e.target.files[0], {
      onSuccess: () => {
        queryClient.invalidateQueries(["materials"])
        setShowImportModal(false)
      },
      onSettled: () => {
        e.target.value = ""
      },
      onError: (error) => {
        toast.error(`Импортированный файл имеет неправильные данные: ${error.message}`)
      }
    })
  }

  return (
    <main>
      <div className="mt-2 pl-2 flex space-x-2">
        <span className="text-3xl font-bold">Материалы</span>
        {/* <Button text="Экспорт" onClick={() => exportQuery.refetch()}/> */}
        <Button text="Импорт" onClick={() => setShowImportModal(true)} />
      </div>
      <table className="table-auto text-sm text-left mt-2 w-full border-box">
        <thead className="shadow-md border-t-2">
          <tr>
            <th className="px-4 py-3 w-[100px]">
              <span>Код</span>
            </th>
            <th className="px-4 py-3 w-[100px]">
              <span>Пункт</span>
            </th>
            <th className="px-4 py-3">
              <span>Категория</span>
            </th>
            <th className="px-4 py-3">
              <span>Наименование</span>
            </th>
            <th className="px-4 py-3 w-[100px]">
              <span>Ед. Изм.</span>
            </th>
            <th className="px-4 py-3">
              <span>Примичание</span>
            </th>
            <th className="px-4 py-3">
              <Button text="Добавить" onClick={() => {
                setMutationModalType("create")
                setShowMutationModal(true)
              }} />
            </th>
          </tr>
        </thead>
        <tbody>
          {tableDataQuery.isLoading &&
            <tr>
              <td colSpan={6}>
                <LoadingDots />
              </td>
            </tr>
          }
          {tableDataQuery.isError &&
            <tr>
              <td colSpan={6} className="text-red font-bold text-center">
                {tableDataQuery.error.message}
              </td>
            </tr>
          }
          {tableDataQuery.isSuccess &&
            tableData.map((row, index) => (
              <tr key={index} className="border-b">
                <td className="px-4 py-3">{row.code}</td>
                <td className="px-4 py-3">{row.article}</td>
                <td className="px-4 py-3">{row.category}</td>
                <td className="px-4 py-3">{row.name}</td>
                <td className="px-4 py-3">{row.unit}</td>
                <td className="px-4 py-3">{row.notes}</td>
                <td className="px-4 py-3 border-box flex space-x-3">
                  <Button text="Изменить" buttonType="default" onClick={() => {
                    setShowMutationModal(true)
                    setMutationModalType("update")
                    setMaterialMutationData(row)
                  }}
                  />
                  <Button text="Удалить" buttonType="delete" onClick={() => onDeleteButtonClick(row)} />
                </td>
              </tr>
            ))
          }
        </tbody>
      </table>
      {showModal &&
        <DeleteModal {...modalProps}>
          <span>При подтверждении материал под именем {modalProps.no_delivery} и все его данные в ней будут удалены</span>
        </DeleteModal>
      }
      {showMutationModal &&
        <Modal setShowModal={setShowMutationModal}>
          <div className="">
            <h3 className="text-xl font-medium text-gray-800">
              {mutationModalType == "create" && "Добавление матераила"}
              {mutationModalType == "update" && "Изменение матераила"}
            </h3>
            <div className="flex flex-col space-y-3 mt-2">
              <div className="flex flex-col space-y-1">
                <label htmlFor="name">Категория материала</label>
                <Input
                  name="category"
                  type="text"
                  value={materialMutationData.category}
                  onChange={(e) => setMaterialMutationData({ ...materialMutationData, [e.target.name]: e.target.value })}
                />
              </div>
              <div className="flex flex-col space-y-1">
                <label htmlFor="name">Наименование</label>
                <Input
                  name="name"
                  type="text"
                  value={materialMutationData.name}
                  onChange={(e) => setMaterialMutationData({ ...materialMutationData, [e.target.name]: e.target.value })}
                />
              </div>
              <div className="flex flex-col space-y-1">
                <label htmlFor="unit">Еденица измерения</label>
                <Select
                  className="basic-single"
                  classNamePrefix="select"
                  isSearchable={true}
                  isClearable={true}
                  name={"material-cost-material-select"}
                  placeholder={""}
                  value={selectedMeasurement}
                  options={measurements}
                  onChange={(value) => onMeasurementSelect(value)}
                />
              </div>
              <div className="flex flex-col space-y-1">
                <label htmlFor="code">Код материала</label>
                <Input
                  name="code"
                  type="text"
                  value={materialMutationData.code}
                  onChange={(e) => setMaterialMutationData({ ...materialMutationData, [e.target.name]: e.target.value })}
                />
              </div>
              <div className="flex flex-col space-y-1">
                <label htmlFor="code">Пункт</label>
                <Input
                  name="article"
                  type="text"
                  value={materialMutationData.article}
                  onChange={(e) => setMaterialMutationData({ ...materialMutationData, [e.target.name]: e.target.value })}
                />
              </div>
              <div className="flex flex-col space-y-1">
                <div className="flex space-x-2">
                  <input type="checkbox" id="hasSerialNumber" value={1} name="hasSerialNumber" onChange={
                    (e) => {
                      if (e.target.checked) {
                        setMaterialMutationData({ ...materialMutationData, hasSerialNumber: true })
                      } else {
                        setMaterialMutationData({ ...materialMutationData, hasSerialNumber: false })
                      }
                    }
                  }
                  />
                  <label htmlFor="hasSerialNumber">Серийный номер</label>
                </div>
              </div>
              <div className="flex flex-col space-y-1">
                <label htmlFor="notes">Примичание</label>
                <textarea
                  name="notes"
                  value={materialMutationData.notes}
                  onChange={(e) => setMaterialMutationData({ ...materialMutationData, [e.target.name]: e.target.value })}
                  className="py-1.5 px-2 resize-none w-full h-[100px] rounded border  border-gray-800"
                >
                </textarea>
              </div>
              <div>
                <Button
                  text={mutationModalType == "create" ? "Добавить" : "Подтвердить изменения"}
                  onClick={onMutationSubmit}
                />
              </div>
            </div>
          </div>
        </Modal>
      }
      {showImportModal &&
        <Modal setShowModal={setShowImportModal}>
          <span className="font-bold text-xl px-2 py-1">Импорт данных в Справочник - Материалы</span>
          <div className="grid grid-cols-2 gap-2 items-center px-2 pt-2">
            <Button text="Скачать шаблон" onClick={() => getMaterialTemplateDocument()} />
            <div className="w-full">
              <label
                htmlFor="file"
                className="w-full text-white py-3 px-5 rounded-lg bg-gray-700 hover:bg-gray-800 hover:cursor-pointer"
              >
                Импортировать данные
              </label>
              <input
                name="file"
                type="file"
                id="file"
                onChange={(e) => acceptExcel(e)}
                className="hidden"
              />
            </div>
          </div>
          <span className="text-sm italic px-2 w-full text-center">При импортировке система будет следовать правилам шаблона</span>
        </Modal>
      }
    </main>
  )
}

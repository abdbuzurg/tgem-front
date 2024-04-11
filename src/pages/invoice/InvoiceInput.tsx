import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Button from "../../components/UI/button";
import { ENTRY_LIMIT } from "../../services/api/constants";
import { useEffect, useState } from "react";
import LoadingDots from "../../components/UI/loadingDots";
import DeleteModal from "../../components/deleteModal";
import "react-datepicker/dist/react-datepicker.css";
import getInvoiceMaterialsByInvoice, { InvoiceMaterialView } from "../../services/api/invoice_materials";
import MutationInvoiceInput from "../../components/invoice/input/MutationInvoiceInput";
import ReportInvoiceInput from "../../components/invoice/input/ReportInvoiceInput";
import { InvoiceInputPagianted, deleteInvoiceInput, getInvoiceInputDocument, getPaginatedInvoiceInput, sendInvoiceInputConfirmationExcel } from "../../services/api/invoiceInput";
import { IInvoiceInputView } from "../../services/interfaces/invoiceInput";
import Modal from "../../components/Modal";

export default function InvoiceInput() {
  //FETCHING LOGIC
  const tableDataQuery = useInfiniteQuery<InvoiceInputPagianted, Error>({
    queryKey: ["invoice-input"],
    queryFn: ({ pageParam }) => getPaginatedInvoiceInput({ pageParam }),
    getNextPageParam: (lastPage) => {
      if (lastPage.page * ENTRY_LIMIT > lastPage.count) return undefined
      return lastPage.page + 1
    }
  })
  const [tableData, setTableData] = useState<IInvoiceInputView[]>([])
  useEffect(() => {
    if (tableDataQuery.isSuccess && tableDataQuery.data) {
      const data: IInvoiceInputView[] = tableDataQuery.data.pages.reduce<IInvoiceInputView[]>((acc, page) => [...acc, ...page.data], [])
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

  const acceptExcel = (id: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    sendInvoiceInputConfirmationExcel(id, e.target.files[0]).finally(() => {
      queryClient.invalidateQueries(["invoice-input"])
    })
  }

  //DELETE LOGIC
  const [showModal, setShowModal] = useState(false)
  const queryClient = useQueryClient()
  const deleteMutation = useMutation({
    mutationFn: deleteInvoiceInput,
    onSuccess: () => {
      queryClient.invalidateQueries(["invoice-input"])
    }
  })
  const [modalProps, setModalProps] = useState({
    setShowModal: setShowModal,
    no_delivery: "",
    deleteFunc: () => { }
  })
  const onDeleteButtonClick = (row: IInvoiceInputView) => {
    setShowModal(true)
    setModalProps({
      deleteFunc: () => deleteMutation.mutate(row.id),
      no_delivery: row.deliveryCode,
      setShowModal: setShowModal,
    })
  }

  //Mutation Logic
  const [showMutationModal, setShowMutationModal] = useState(false)
  const [mutationModalType, setMutationModalType] = useState<"create" | "update">("create")

  //Details logic
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [detailModalData, setDetailModalData] = useState<IInvoiceInputView>({
    projectID: 1,
    dateOfAdd: new Date(),
    dateOfEdit: new Date(),
    dateOfInvoice: new Date(),
    deliveryCode: "",
    id: 0,
    notes: "",
    operatorAddName: "",
    operatorEditName: "",
    releasedName: "",
    warehouseManagerName: "",
    confirmation: false,
  })

  const showDetails = (index: number) => {
    setDetailModalData(tableData[index])
    setShowDetailsModal(true)
  }

  const invoiceInputDetailsMaterialsQuery = useQuery<InvoiceMaterialView[], Error>({
    queryKey: ["invoice-materials", "input", detailModalData.id],
    queryFn: () => getInvoiceMaterialsByInvoice("input", detailModalData.id),
    enabled: false,
  })


  //Report modal logic
  const [showReportModal, setShowReportModal] = useState(false)

  return (
    <main>
      <div className="mt-2 px-2 flex justify-between">
        <span className="text-3xl font-bold">Накладные приход</span>
        <div>
          <Button onClick={() => setShowReportModal(true)} text="Отчет" buttonType="default" />
        </div>
      </div>
      <table className="table-auto text-sm text-left mt-2 w-full border-box">
        <thead className="shadow-md border-t-2">
          <tr>
            <th className="px-4 py-3 w-[100px]">
              <span>Код</span>
            </th>
            <th className="px-4 py-3">
              <span>Зав. Склад</span>
            </th>
            <th className="px-4 py-3">
              <span>Отпустил</span>
            </th>
            <th className="px-4 py-3 w-[150px]">
              <span>Дата</span>
            </th>
            <th className="px-4 py-3">
              <Button text="Добавить" onClick={() => {
                setShowMutationModal(true)
                setMutationModalType("create")
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
                <td className="px-4 py-3">{row.deliveryCode}</td>
                <td className="px-4 py-3">{row.warehouseManagerName}</td>
                <td className="px-4 py-3">{row.releasedName}</td>
                <td className="px-4 py-3">{row.dateOfInvoice.toString().substring(0, 10)}</td>
                <td className="px-4 py-3 border-box flex space-x-3">
                  {row.confirmation &&
                    <Button text="Документ" buttonType="default" onClick={() => getInvoiceInputDocument(row.deliveryCode)} />
                  }
                  {!row.confirmation &&
                    <>
                      <label htmlFor="file" className="m-0 cursor-pointer text-white py-2.5 px-5 rounded-lg border-red-700 bg-red-800 hover:bg-red-700 hover:border-red-700">Документ</label>
                      <input
                        name="file"
                        type="file"
                        id="file"
                        onChange={(e) => acceptExcel(row.id, e)}
                        className="hidden"
                      />
                    </>
                  }
                  <Button text="Подробнее" onClick={() => showDetails(index)} />
                  <Button text="Изменить" buttonType="default" onClick={() => {
                    setShowMutationModal(true)
                    setMutationModalType("update")
                  }} />
                  <Button text="Удалить" buttonType="delete" onClick={() => onDeleteButtonClick(row)} />
                </td>
              </tr>
            ))
          }
        </tbody>
      </table>
      {showDetailsModal &&
        <Modal bigModal setShowModal={setShowDetailsModal}>
          <div className="mb-2">
            <h3 className="text-2xl font-medium text-gray-800">Детали накладной {detailModalData.deliveryCode}</h3>
          </div>
          <div className="flex w-full space-x-8 max-h-[60vh] ">
            <div className="flex flex-col w-[25%]">
              <div className="flex flex-col space-y-2">
                <div className="flex flex-col space-y-1">
                  <p className="text-lg font-semibold">Заведующий складом</p>
                  <p className="text-sm">{detailModalData.warehouseManagerName}</p>
                </div>
                <div className="flex flex-col space-y-1">
                  <p className="text-lg font-semibold">Составил</p>
                  <p className="text-sm">{detailModalData.releasedName}</p>
                </div>
                <div className="flex flex-col space-y-1">
                  <p className="text-lg font-semibold">Дата</p>
                  <p className="text-sm">{detailModalData.dateOfInvoice.toString().substring(0, 10)}</p>
                </div>
                <div className="flex flex-col space-y-1">
                  <p className="text-lg font-semibold">Дата добавление накладной</p>
                  <p className="text-sm">{detailModalData.dateOfAdd.toString().substring(0, 10)}</p>
                </div>
                <div className="flex flex-col space-y-1">
                  <p className="text-lg font-semibold">Дата последнего изменения накладной</p>
                  <p className="text-sm">{detailModalData.dateOfEdit.toString().substring(0, 10)}</p>
                </div>
              </div>
            </div>
            <div className="overflow-y-scroll w-[75%] px-2">
              <div className="flex space-x-2 items-center justify-between">
                <p className="text-xl font-semibold text-gray-800">Материалы наклданой</p>
              </div>
              <table className="table-auto text-sm text-left mt-2 w-full border-box">
                <thead className="shadow-md border-t-2">
                  <tr>
                    <th className="px-4 py-3">
                      <span>Наименование</span>
                    </th>
                    <th className="px-4 py-3">
                      <span>Ед.Изм.</span>
                    </th>
                    <th className="px-4 py-3">
                      <span>Количество</span>
                    </th>
                    <th className="px-4 py-3">
                      <span>Цена</span>
                    </th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceInputDetailsMaterialsQuery.isSuccess && invoiceInputDetailsMaterialsQuery.data.map((value, index) =>
                    <tr key={index}>
                      <td className="px-4 py-3">{value.materialName}</td>
                      <td className="px-4 py-3">{value.unit}</td>
                      <td className="px-4 py-3">{value.amount}</td>
                      <td className="px-4 py-3">{value.materialPrice}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </Modal>
      }
      {showModal &&
        <DeleteModal {...modalProps}>
          <span>При подтверждении накладая приход с кодом {modalProps.no_delivery} и все связанные материалы будут удалены</span>
        </DeleteModal>
      }
      {showMutationModal && <MutationInvoiceInput mutationType={mutationModalType} setShowMutationModal={setShowMutationModal} />}
      {showReportModal && <ReportInvoiceInput setShowReportModal={setShowReportModal} />}
    </main>
  )
}

import { useEffect, useState } from "react";
import Button from "../../components/UI/button";
import Modal from "../../components/Modal";
import { IInvoiceOutputView } from "../../services/interfaces/invoiceOutput";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { InvoiceOutputPagianted, deleteInvoiceOutput, getInvoiceOutputDocument, getPaginatedInvoiceOutput, sendInvoiceOutputConfirmationExcel } from "../../services/api/invoiceOutput";
import { ENTRY_LIMIT } from "../../services/api/constants";
import DeleteModal from "../../components/deleteModal";
import getInvoiceMaterialsByInvoice, { InvoiceMaterialView } from "../../services/api/invoice_materials";
import MutationInvoiceOutput from "../../components/invoice/output/MutationInvoiceOutput";
import ReportInvoiceOutput from "../../components/invoice/output/ReportInvoiceOutput";

export default function InvoiceOutput() {
 //FETCHING LOGIC
 const tableDataQuery = useInfiniteQuery<InvoiceOutputPagianted, Error>({
  queryKey: ["invoice-output"],
  queryFn: ({pageParam}) => getPaginatedInvoiceOutput({pageParam}),
  getNextPageParam: (lastPage) => {
    if (lastPage.page * ENTRY_LIMIT > lastPage.count) return undefined
    return lastPage.page + 1
  }
  })
  const [tableData, setTableData] = useState<IInvoiceOutputView[]>([])
  useEffect(() => {
    if (tableDataQuery.isSuccess && tableDataQuery.data) {
      const data: IInvoiceOutputView[] = tableDataQuery.data.pages.reduce<IInvoiceOutputView[]>((acc, page) => [...acc, ...page.data], [])
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
    sendInvoiceOutputConfirmationExcel(id, e.target.files[0]).finally(() => {
      queryClient.invalidateQueries(["invoice-output"])
    })
  }

  //DELETE LOGIC
  const [showModal, setShowModal] = useState(false)
  const queryClient = useQueryClient()
  const deleteMutation = useMutation({
    mutationFn: deleteInvoiceOutput,
    onSuccess: () => {
      queryClient.invalidateQueries(["invoice-output"])
    }
  })
  const [modalProps, setModalProps] = useState({
    setShowModal: setShowModal,
    no_delivery: "",
    deleteFunc: () => {}
  })
  const onDeleteButtonClick = (row: IInvoiceOutputView) => {
    setShowModal(true)
    setModalProps({
      deleteFunc: () => deleteMutation.mutate(row.id),
      no_delivery: row.deliveryCode,
      setShowModal: setShowModal,
    })
  }

  //Mutation LOGIC
  const [mutationModalType, setMutationModalType] = useState<"update" | "create">("create")
  const [showMutationModal, setShowMutationModal] = useState(false)

  //DETAIL MODAL DATA
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [detailModalData, setDetailModalData] = useState<IInvoiceOutputView>({
    districtName: "",
    objectName: "",
    projectName: "",
    recipientWorkerName: "",
    teamName: "",
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
    queryKey: ["invoice-materials", "output", detailModalData.id],
    queryFn: () => getInvoiceMaterialsByInvoice("output", detailModalData.id)
  })

  //Report Modal
  const [showReportModal, setShowReportModal] = useState(false)

  return (
    <main>
      <div className="mt-2 px-2 flex justify-between">
        <span className="text-3xl font-bold">Накладные отпуск</span>
        <div>
          <Button onClick={() => setShowReportModal(true)} text="Отчет" buttonType="default"/>
        </div>
      </div>
      <table className="table-auto text-sm text-left mt-2 w-full border-box">
        <thead className="shadow-md border-t-2">
          <tr>
            <th className="px-4 py-3 w-[100px]">
              <span>Код</span>
            </th>
            <th className="px-4 py-3">
              <span>Район</span>
            </th>
            <th className="px-4 py-3">
              <span>Объект</span>
            </th>
            <th className="px-4 py-3">
              <span>Бригада</span>
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
                setMutationModalType("create")
                setShowMutationModal(true)
              }}/>
            </th>
          </tr>
        </thead>
        <tbody>
          {tableData.map((value, index) => 
            <tr key={index}>
              <td>{value.deliveryCode}</td>
              <td>{value.districtName}</td>
              <td>{value.objectName}</td>
              <td>{value.teamName}</td>
              <td>{value.warehouseManagerName}</td>
              <td>{value.releasedName}</td>
              <td>{value.dateOfInvoice.toString().substring(0, 10)}</td>
              <td className="px-4 py-3 border-box flex space-x-3">
                {!value.confirmation && 
                  <>
                    <label htmlFor="file" className="m-0 cursor-pointer text-white py-2.5 px-5 rounded-lg border-red-700 bg-red-800 hover:bg-red-700 hover:border-red-700">Подтвердить</label>
                    <input 
                      name="file" 
                      type="file"
                      id="file"
                      onChange={(e) => acceptExcel(value.id, e)} 
                      className="hidden"
                    />
                  </>
                }            
                <Button text="Подробнее" buttonType="default" onClick={() => showDetails(index)}/>    
                <Button text="Документ" buttonType="default" onClick={() => getInvoiceOutputDocument(value.deliveryCode)}/>
                <Button text="Удалить" buttonType="delete" onClick={() => onDeleteButtonClick(value)}/>
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {showDetailsModal && 
        <Modal bigModal setShowModal={setShowDetailsModal}>
          <div className="mb-2">
            <h3 className="text-2xl font-medium text-gray-800">Детали накладной {detailModalData.deliveryCode}</h3>
          </div>
          <div className="flex w-full space-x-8 max-h-[80vh]">
            <div className="flex flex-col w-[25%]">
              <div className="flex flex-col space-y-2">
                <div className="flex flex-col space-y-1">
                  <p className="text-lg font-semibold">Район</p>
                  <p className="text-sm">{detailModalData.districtName}</p>
                </div>
                <div className="flex flex-col space-y-1">
                  <p className="text-lg font-semibold">Заведующий складом</p>
                  <p className="text-sm">{detailModalData.warehouseManagerName}</p>
                </div>
                <div className="flex flex-col space-y-1">
                  <p className="text-lg font-semibold">Отпустил</p>
                  <p className="text-sm">{detailModalData.releasedName}</p>
                </div>
                <div className="flex flex-col space-y-1">
                  <p className="text-lg font-semibold">Получатель</p>
                  <p className="text-sm">{detailModalData.recipientWorkerName}</p>
                </div>
                <div className="flex flex-col space-y-1">
                  <p className="text-lg font-semibold">Объект</p>
                  <p className="text-sm">{detailModalData.objectName}</p>
                </div>
                <div className="flex flex-col space-y-1">
                  <p className="text-lg font-semibold">Бригада</p>
                  <p className="text-sm">{detailModalData.teamName}</p>
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
          <span>При подтверждении накладая уход с кодом {modalProps.no_delivery} и все связанные материалы будут удалены</span>
        </DeleteModal>
      }
      {showMutationModal && <MutationInvoiceOutput mutationType={mutationModalType} setShowMutationModal={setShowMutationModal}/>}
      {showReportModal && <ReportInvoiceOutput setShowReportModal={setShowReportModal}/>}
    </main>
  )
}
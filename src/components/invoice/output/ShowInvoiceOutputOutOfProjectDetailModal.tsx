import { FaBarcode } from "react-icons/fa"
import IconButton from "../../IconButtons"
import Modal from "../../Modal"
import LoadingDots from "../../UI/loadingDots"
import { Fragment, useState } from "react"
import SerialNumbersShowModal from "../../SerialNumberShowModal"
import { useQuery } from "@tanstack/react-query"
import { InvoiceMaterialViewWithSerialNumbers, InvoiceMaterialViewWithoutSerialNumbers } from "../../../services/interfaces/invoiceMaterial"
import { InvoiceOutputOutOfProjectView, getInvoiceOutputOutOfProjectMaterilsWithSerialNumbersByID, getInvoiceOutputOutOfProjectMaterilsWithoutSerialNumbersByID } from "../../../services/api/invoiceOutputOutOfProject"

interface Props {
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>
  data: InvoiceOutputOutOfProjectView
}

export default function ShowInvoiceOutputOutOfProjectDetails({ setShowModal, data }: Props) {

  const invoiceOutputMaterialsWithourSerialNumbersQuery = useQuery<InvoiceMaterialViewWithoutSerialNumbers[], Error>({
    queryKey: ["invoice-input-materials-without-serial-numbers", data.id],
    queryFn: () => getInvoiceOutputOutOfProjectMaterilsWithoutSerialNumbersByID(data.id)
  })

  const invoiceOutputMaterialsWithSerialNumbersQuery = useQuery<InvoiceMaterialViewWithSerialNumbers[], Error>({
    queryKey: ["invoice-input-materials-with-serial-numbers", data.id],
    queryFn: () => getInvoiceOutputOutOfProjectMaterilsWithSerialNumbersByID(data.id)
  })

  const [showSerialNumbers, setShowSerialNumbers] = useState(false)
  const [currentMaterial, setCurrentMaterial] = useState<InvoiceMaterialViewWithSerialNumbers>({
    id: 0,
    materialName: "",
    materialUnit: "",
    costM19: 0,
    amount: 0,
    notes: "",
    serialNumbers: [],
    isDefected: false,
  })

  return (
    <Modal setShowModal={setShowModal} bigModal>
      <div className="mb-2 px-1">
        <h3 className="text-2xl font-medium text-gray-800">Детали накладной {data.deliveryCode}</h3>
      </div>
      <div className="flex w-full space-x-8 max-h-[70vh] px-2">
        <div className="flex flex-col w-[25%]">
          <div className="flex flex-col space-y-3">
            <div className="flex flex-col">
              <p className="text-sm font-bold">Имя проекта</p>
              <p className="text-xl italic">{data.nameOfProject}</p>
            </div>
            <div className="flex flex-col">
              <p className="text-sm font-bold">Дата</p>
              <p className="text-xl italic">{data.dateOfInvoice.toString().substring(0, 10)}</p>
            </div>
          </div>
        </div>
        <div className="w-full px-2">
          <div className="py-1">
            <div className="py-1">
              <span className="font-bold text-xl">Материалы накладной с серийными номерами</span>
            </div>
            {invoiceOutputMaterialsWithSerialNumbersQuery.isLoading && <div className="col-span-6"><LoadingDots /></div>}
            {invoiceOutputMaterialsWithSerialNumbersQuery.isSuccess &&
              <>
                {invoiceOutputMaterialsWithSerialNumbersQuery.data.length == 0 &&
                  <div className="italic">Отсутствует</div>
                }
                {invoiceOutputMaterialsWithSerialNumbersQuery.data.length != 0 &&
                  <>
                    <div className="grid grid-cols-7 gap-2 font-semibold border-b-2">
                      <div className="col-span-2">Наименование</div>
                      <div>Ед. Изм.</div>
                      <div>Количество</div>
                      <div>Цена</div>
                      <div>Серийный #</div>
                      <div>Примичание</div>
                    </div>
                    <div className="grid grid-cols-7 gap-2 max-h-[30vh] overflow-y-auto py-2">
                      {invoiceOutputMaterialsWithSerialNumbersQuery.data.map((value, index) =>
                        <Fragment key={index}>
                          <div className="col-span-2">{value.materialName}</div>
                          <div>{value.materialUnit}</div>
                          <div>{value.amount}</div>
                          <div>{value.costM19}</div>
                          <div>
                            <IconButton
                              icon={<FaBarcode
                                size="25px"
                                title={`Показать серийные номера`} />}
                              onClick={() => {
                                setCurrentMaterial(value)
                                setShowSerialNumbers(true)
                              }}
                            />
                          </div>
                          <div>{value.notes}</div>
                        </Fragment>
                      )}
                    </div>
                  </>
                }
              </>
            }
            {showSerialNumbers && <SerialNumbersShowModal setShowModal={setShowSerialNumbers} data={currentMaterial} />}
          </div>
          <div className="py-1">
            <div className="py-1">
              <span className="font-bold text-xl">Материалы накладной без серийного номера</span>
            </div>
            {invoiceOutputMaterialsWithourSerialNumbersQuery.isLoading && <div className="col-span-6"><LoadingDots /></div>}
            {invoiceOutputMaterialsWithourSerialNumbersQuery.isSuccess &&
              <>
                {invoiceOutputMaterialsWithourSerialNumbersQuery.data.length == 0 &&
                  <div className="italic">Отсутствует</div>
                }
                {invoiceOutputMaterialsWithourSerialNumbersQuery.data.length != 0 &&
                  <>
                    <div className="grid grid-cols-6 gap-2 font-semibold border-b-2">
                      <div className="col-span-2">Наименование</div>
                      <div>Ед. Изм.</div>
                      <div>Количество</div>
                      <div>Цена</div>
                      <div>Примичание</div>
                    </div>
                    <div className="grid grid-cols-6 gap-2 max-h-[30vh] overflow-y-auto py-2">
                      {invoiceOutputMaterialsWithourSerialNumbersQuery.data.map((value, index) =>
                        <Fragment key={index}>
                          <div className="col-span-2">{value.materialName}</div>
                          <div>{value.materialUnit}</div>
                          <div>{value.amount}</div>
                          <div>{value.costM19}</div>
                          <div>{value.notes}</div>
                        </Fragment>
                      )}
                    </div>
                  </>
                }
              </>
            }
          </div>
        </div>
      </div>
    </Modal >
  )
}

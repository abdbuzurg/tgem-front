import {  useEffect, useState } from "react";
import { InvoiceObjectFullDataItem, InvoiceObjectPaginatedView } from "../../../services/api/invoiceObject";
import Modal from "../../Modal";
import { useQuery } from "@tanstack/react-query";
import { getInvoiceMaterialsForCorrect } from "../../../services/api/invoiceCorrection";
import Button from "../../UI/button";
import MaterialCorrectionModal from "./MaterialCorrectionModal";

interface Props {
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>
  invoiceObject: InvoiceObjectPaginatedView
}

export default function CorrectionModal({
  setShowModal,
  invoiceObject,
}: Props) {

  const [invoiceMaterialsForCorrection, setInvoiceMaterialsForCorrections] = useState<InvoiceObjectFullDataItem[]>([])
  const materialsForCorrectionQuery = useQuery<InvoiceObjectFullDataItem[], Error, InvoiceObjectFullDataItem[]>({
    queryKey: [`invoice-correction-materials-${invoiceObject.id}`],
    queryFn: () => getInvoiceMaterialsForCorrect(invoiceObject.id),
  })
  useEffect(() => {
    if (materialsForCorrectionQuery.isSuccess && materialsForCorrectionQuery.data) {
      setInvoiceMaterialsForCorrections(materialsForCorrectionQuery.data)
    }
  }, [materialsForCorrectionQuery.data])

  const [showCorrectionMaterialModal, setShowCorrectionMaterialModal] = useState(false)
  const [selectedMaterial, setSelectedMaterial] = useState<InvoiceObjectFullDataItem>()
  const onModalToggle = (materialData: InvoiceObjectFullDataItem) => {
    setSelectedMaterial(materialData)
    setShowCorrectionMaterialModal(true)
  }

  return (
    <Modal setShowModal={setShowModal} bigModal>
      <div className="flex flex-col space-y-2 px-2">
        <span className="text-2xl font-bold">Корректировка прихода {invoiceObject.deliveryCode}</span>
        <div className="flex space-x-4">
          <div className="flex flex-col space-y-1">
            <span className="font-bold">Супервайзер</span>
            <span>{invoiceObject.supervisorName}</span>
          </div>
          <div className="flex flex-col space-y-1">
            <span className="font-bold text-l">Объект</span>
            <span>{invoiceObject.objectName}</span>
          </div>
          <div className="flex flex-col space-y-1">
            <span className="font-bold text-l">Бригада</span>
            <span>{invoiceObject.teamNumber}</span>
          </div>
          <div className="flex flex-col space-y-1">
            <span className="font-bold text-l">Дата накладной</span>
            <span>{invoiceObject.dateOfInvoice.toString().substring(0, 10)}</span>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2 border-b-2 border-b-black font-bold text-l">
          <div className="px-2 py-1">Наименование</div>
          <div className="px-2 py-1">Количество</div>
          <div className="px-2 py-1">Примичание</div>
          <div className="px-2 py-1 invisible">Наименование</div>
        </div>

        {invoiceMaterialsForCorrection.map((row, index) =>
          <div className="grid grid-cols-4 gap-2 border-b-2 border-b-black" key={index}>
            <div className="px-2 py-1">{row.materialName}</div>
            <div className="px-2 py-1">{row.amount}</div>
            <div className="px-2 py-1">{row.notes}</div>
            <div className="px-2 py-1">
              <Button onClick={() =>  onModalToggle(row)} text="Изменить" />
            </div>
          </div>
        )}
      </div>
      {showCorrectionMaterialModal && 
        <MaterialCorrectionModal 
          teamNumber={invoiceObject.teamNumber}
          setShowModal={setShowCorrectionMaterialModal}
          materialData={selectedMaterial!}
        />
      }
    </Modal>
  )
}

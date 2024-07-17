import { useEffect, useState } from "react";
import Modal from "../../Modal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { InvoiceCorrectionMaterial, InvoiceCorrectionMaterialMutation, InvoiceCorrectionPaginatedView, createInvoiceCorrection, getInvoiceMaterialsForCorrect } from "../../../services/api/invoiceCorrection";
import Button from "../../UI/button";
import MaterialCorrectionModal from "./MaterialCorrectionModal";
import { IInvoiceObject } from "../../../services/interfaces/invoiceObject";
import LoadingDots from "../../UI/loadingDots";

interface Props {
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>
  invoiceObject: InvoiceCorrectionPaginatedView
}

export default function CorrectionModal({
  setShowModal,
  invoiceObject,
}: Props) {
  const [invoiceMaterialsForCorrection, setInvoiceMaterialsForCorrections] = useState<InvoiceCorrectionMaterial[]>([])
  const materialsForCorrectionQuery = useQuery<InvoiceCorrectionMaterial[], Error, InvoiceCorrectionMaterial[]>({
    queryKey: [`invoice-correction-materials-${invoiceObject.id}`],
    queryFn: () => getInvoiceMaterialsForCorrect(invoiceObject.id),
  })
  useEffect(() => {
    if (materialsForCorrectionQuery.isSuccess && materialsForCorrectionQuery.data) {
      setInvoiceMaterialsForCorrections(materialsForCorrectionQuery.data)
    }
  }, [materialsForCorrectionQuery.data])


  const [showCorrectionMaterialModal, setShowCorrectionMaterialModal] = useState(false)
  const [selectedMaterial, setSelectedMaterial] = useState<InvoiceCorrectionMaterial>()
  const [selectedIndex, setSelectedIndex] = useState<number>(0)
  const onModalToggle = (materialData: InvoiceCorrectionMaterial, index: number) => {
    setSelectedIndex(index)
    setSelectedMaterial(materialData)
    setShowCorrectionMaterialModal(true)
  }

  const onDelete = (index: number) => {
    const data = invoiceMaterialsForCorrection.filter((_, idx) => index != idx)
    setInvoiceMaterialsForCorrections(data)
  }

  const correction = (index: number, correction: InvoiceCorrectionMaterial) => {
    if (index == -1) {
      invoiceMaterialsForCorrection.push(correction)
    } else {
      invoiceMaterialsForCorrection[index] = correction
    }

    setInvoiceMaterialsForCorrections(invoiceMaterialsForCorrection)
  }

  const queryClient = useQueryClient()
  const createInvoiceCorrectionMutation = useMutation<IInvoiceObject, Error, InvoiceCorrectionMaterialMutation>({
    mutationFn: createInvoiceCorrection
  })

  const onCorrectionSubmit = () => {
    createInvoiceCorrectionMutation.mutate({
      details: {
        id: invoiceObject.id,
        dateOfCorrection: new Date()
      },
      items: invoiceMaterialsForCorrection,
    }, {
      onSuccess: () => {
        setShowModal(false)
        queryClient.invalidateQueries(["invoice-correction"])
      }
    })
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
          <div className="flex items-center">
            <div
              onClick={() => onCorrectionSubmit()}
              className="text-center text-white py-2.5 px-5 rounded-lg bg-gray-700 hover:bg-gray-800 hover:cursor-pointer"
            >
              {createInvoiceCorrectionMutation.isLoading ? <LoadingDots height={30}/> : "Опубликовать"}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2 border-b-2 border-b-black font-bold text-l">
          <div className="px-2 py-1">Наименование</div>
          <div className="px-2 py-1">Кол-во</div>
          <div className="px-2 py-1">Примичание</div>
          <div className="px-2 py-1 invisible">Корректировка</div>
        </div>

        {invoiceMaterialsForCorrection.map((row, index) =>
          <div className="grid grid-cols-4 gap-2 border-b-2 border-b-black" key={index}>
            <div className="px-2 py-1">{row.materialName}</div>
            <div className="px-2 py-1">{row.materialAmount}</div>
            <div className="px-2 py-1">{row.notes}</div>
            <div className="px-2 py-1 flex space-x-2">
              <Button onClick={() => onModalToggle(row, index)} text="Изменить" />
              <Button onClick={() => onDelete(index)} text="Удалить" buttonType="delete" />
            </div>
          </div>
        )}
        <div className="grid grid-cols-4 gap-2 border-b-2 border-b-black">
          <div className="px-2 py-1"></div>
          <div className="px-2 py-1"></div>
          <div className="px-2 py-1"></div>
          <div className="px-2 py-1">
            <Button
              onClick={() => onModalToggle({
                invoiceMaterialID: 0,
                materialName: "",
                materialID: 0,
                materialAmount: 0,
                materialUnit: "",
                notes: "",
              }, -1)}
              text="Добавить"
            />
          </div>
        </div>
      </div>
      {showCorrectionMaterialModal &&
        <MaterialCorrectionModal
          teamID={invoiceObject.teamID}
          correctionIndex={selectedIndex}
          setShowModal={setShowCorrectionMaterialModal}
          materialData={selectedMaterial!}
          correctionFunction={correction}
        />
      }
    </Modal>
  )
}

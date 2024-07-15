import { useState } from "react"
import { REPORT_BALANCE, REPORT_INVOICE_INPUT, REPORT_INVOICE_OBJECT, REPORT_INVOICE_OUTPUT, REPORT_INVOICE_RETURN } from "../URLs"
import ReportBalance from "../components/report/ReportBalance"
import ReportInvoiceInput from "../components/invoice/input/ReportInvoiceInput"
import ReportInvoiceOutput from "../components/invoice/output/ReportInvoiceOutput"
import ReportInvoiceReturn from "../components/invoice/return/ReportInvoiceReturn"
import ReportInvoiceObject from "../components/invoice/object/ReportInvoiceObject"

const report = [
  {name: "Остатка", type: REPORT_BALANCE},
  {name: "Отчет приход", type: REPORT_INVOICE_INPUT},
  {name: "Отчет отпуск", type: REPORT_INVOICE_OUTPUT},
  {name: "Отчет возврат", type: REPORT_INVOICE_RETURN},
  {name: "Отчет расхода на объект", type: REPORT_INVOICE_OBJECT}
]

export default function Report() {

  const [selectedReportModal, setSelectedReportModal] = useState(false)
  const [selectedReportType, setSelectedReportType] = useState("")

  const showReportParameters = (type: string) => {
    setSelectedReportModal(true)
    setSelectedReportType(type)
  }

  return (
    <div className="flex flex-col space-y-2">
      <div className="px-2">
        <p className="text-3xl font-bold">Отчёт</p>
        <div className="flex space-x-3 mt-2">
          {report.map((flow, index) => (
            <div
              key={index}
              className="bg-gray-800 text-white text-2xl py-3 px-6 rounded cursor-pointer hover:bg-gray-900"
              onClick={() => showReportParameters(flow.type)}
            >
              {flow.name}
            </div>
          ))}
        </div>
      </div>
      {selectedReportModal && 
        (
          (selectedReportType == REPORT_BALANCE && <ReportBalance setShowModal={setSelectedReportModal}/>)
          || (selectedReportType == REPORT_INVOICE_INPUT && <ReportInvoiceInput setShowReportModal={setSelectedReportModal} />)
          || (selectedReportType == REPORT_INVOICE_OUTPUT && <ReportInvoiceOutput setShowReportModal={setSelectedReportModal} />)
          || (selectedReportType == REPORT_INVOICE_RETURN && <ReportInvoiceReturn setShowReportModal={setSelectedReportModal} />)
          || (selectedReportType == REPORT_INVOICE_OBJECT && <ReportInvoiceObject setShowReportModal={setSelectedReportModal} />)
        )
      }
    </div>
  )
}

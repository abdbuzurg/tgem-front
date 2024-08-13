import { useState } from "react"
import { REPORT_BALANCE, REPORT_INVOICE_INPUT, REPORT_INVOICE_OBJECT, REPORT_INVOICE_OUTPUT, REPORT_INVOICE_RETURN } from "../URLs"
import ReportBalance from "../components/report/ReportBalance"
import ReportInvoiceInput from "../components/invoice/input/ReportInvoiceInput"
import ReportInvoiceOutput from "../components/invoice/output/ReportInvoiceOutput"
import ReportInvoiceReturn from "../components/invoice/return/ReportInvoiceReturn"
import ReportInvoiceObject from "../components/invoice/object/ReportInvoiceObject"

const report = [
  {
    category: "Остаток",
    pages: [
      { name: "Остатки", type: REPORT_BALANCE },
    ]
  },
  {
    category: "Операции",
    pages: [
      { name: "Отчет приход", type: REPORT_INVOICE_INPUT },
      { name: "Отчет отпуск", type: REPORT_INVOICE_OUTPUT },
      { name: "Отчет возврат", type: REPORT_INVOICE_RETURN },
      { name: "Отчет расхода на объект", type: REPORT_INVOICE_OBJECT }
    ]
  }
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
        {report.map((val, index) => (
          <div className="py-1 px-2" key={index}>
            <span className="font-bold text-2xl">{val.category}</span>
            <div className="grid grid-cols-4 gap-2 px-2 py-2">
              {val.pages.map((page, index) =>
                <div
                  key={index}
                  className="bg-gray-800 text-white text-xl py-3 px-6 rounded cursor-pointer hover:bg-gray-900 text-center align-middle"
                  onClick={() => showReportParameters(page.type)}
                >
                  {page.name}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      {selectedReportModal &&
        (
          (selectedReportType == REPORT_BALANCE && <ReportBalance setShowModal={setSelectedReportModal} />)
          || (selectedReportType == REPORT_INVOICE_INPUT && <ReportInvoiceInput setShowReportModal={setSelectedReportModal} />)
          || (selectedReportType == REPORT_INVOICE_OUTPUT && <ReportInvoiceOutput setShowReportModal={setSelectedReportModal} />)
          || (selectedReportType == REPORT_INVOICE_RETURN && <ReportInvoiceReturn setShowReportModal={setSelectedReportModal} />)
          || (selectedReportType == REPORT_INVOICE_OBJECT && <ReportInvoiceObject setShowReportModal={setSelectedReportModal} />)
        )
      }
    </div>
  )
}

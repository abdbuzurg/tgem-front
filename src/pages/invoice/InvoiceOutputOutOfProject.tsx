export default function InvoiceOutputOutOfProject() {
  return (
    <main>
      <div className="mt-2 px-2 flex justify-between">
        <span className="text-3xl font-bold">Накладные отпуск вне проекта</span>
        <div>
          {/* <Button onClick={() => setShowReportModal(true)} text="Отчет" buttonType="default" /> */}
        </div>
      </div>
      <table className="table-auto text-sm text-left mt-2 w-full border-box">
        <thead className="shadow-md border-t-2">
          <tr>
            <th className="px-4 py-3 w-[110px]">
              <span>Код</span>
            </th>
            <th className="px-4 py-3">
              <span>Отпуск в</span>
            </th>
            <th className="px-4 py-3">
              <span>Составитель</span>
            </th>
            <th className="px-4 py-3 w-[110px]">
              <span>Дата</span>
            </th>
            <th className="px-4 py-3">
            {/*   <Button text="Добавить" onClick={() => { */}
            {/*     setMutationModalType("create") */}
            {/*     setShowMutationModal(true) */}
            {/*   }} /> */}
            </th>
          </tr>
        </thead>
        <tbody>
          {/* {tableData.map((row, index) => */}
          {/*   <tr key={index} className="text-sm"> */}
          {/*     <td className="px-4 py-3">{row.deliveryCode}</td> */}
          {/*     <td className="px-4 py-3">{row.releasedName}</td> */}
          {/*     <td className="px-4 py-3">{row.dateOfInvoice.toString().substring(0, 10)}</td> */}
          {/*     <td className="px-4 py-3 border-box flex space-x-3"> */}
          {/*       <IconButton */}
          {/*         icon={<FaRegListAlt size="20px" title={`Просмотр деталей накладной ${row.deliveryCode}`} />} */}
          {/*         onClick={() => showDetails(index)} */}
          {/*       /> */}
          {/*       {row.confirmation && */}
          {/*         <IconButton */}
          {/*           icon={<FaDownload size="20px" title={`Скачать подтвержденный файл накладной ${row.deliveryCode}`} />} */}
          {/*           onClick={() => getInvoiceOutputDocument(row.deliveryCode)} */}
          {/*         /> */}
          {/*       } */}
          {/*       {!row.confirmation && */}
          {/*         <> */}
          {/*           <label */}
          {/*             htmlFor="file" */}
          {/*             onClick={() => setConfirmationData({ ...confirmationData, id: row.id })} */}
          {/*             className="px-4 py-2 flex items-center text-white bg-red-700 hover:bg-red-800 rounded-lg text-center cursor-pointer" */}
          {/*           > */}
          {/*             <FaUpload */}
          {/*               size="20px" */}
          {/*               title={`Подтвердить файлом накладную ${row.deliveryCode}`} */}
          {/*             /> */}
          {/*           </label> */}
          {/*           <input */}
          {/*             name={`file-${row.id}`} */}
          {/*             type="file" */}
          {/*             id="file" */}
          {/*             onChange={(e) => acceptExcel(e)} */}
          {/*             className="hidden" */}
          {/*             value='' */}
          {/*           /> */}
          {/*           <IconButton */}
          {/*             icon={<FaDownload size="20px" title={`Скачать сгенерированный файл накладной ${row.deliveryCode}`} />} */}
          {/*             onClick={() => getInvoiceOutputDocument(row.deliveryCode)} */}
          {/*           />               
          {/*           {/*   icon={<FaRegEdit size="20px" title={`Изменить данные накладной ${row.deliveryCode}`} />} */} 
          {/*           {/*   onClick={() => showDetails(index)} */} 
          {/*           {/* /> */} 
          {/*           <IconButton */}
          {/*             type="delete" */}
          {/*             icon={<FaRegTrashAlt size="20px" title={`Удалить все данные накладной ${row.deliveryCode}`} />} */}
          {/*             onClick={() => onDeleteButtonClick(row)} */}
          {/*           /> */}
          {/*         </> */}
          {/*       } */}
          {/*     </td> */}
          {/*   </tr> */}
          {/* )} */}
        </tbody>
      </table>
      {/* {showDetailsModal && <ShowInvoiceOutputDetails setShowModal={setShowDetailsModal} data={detailModalData} />} */}
      {/* {showModal && */}
      {/*   <DeleteModal {...modalProps}> */}
      {/*     <span>При подтверждении накладая уход с кодом {modalProps.no_delivery} и все связанные материалы будут удалены</span> */}
      {/*   </DeleteModal> */}
      {/* } */}
      {/* {showMutationModal && <MutationInvoiceOutput mutationType={mutationModalType} setShowMutationModal={setShowMutationModal} />} */}
      {/* {showReportModal && <ReportInvoiceOutput setShowReportModal={setShowReportModal} />} */}
    </main>
  )
}

import { LOGIN, PAGE_NOT_FOUND, PERMISSION_DENIED, HOME, INVOICE_INPUT, INVOICE_OUTPUT, INVOICE_WRITEOFF, REFERENCE_BOOK_WORKER, REFERENCE_BOOK_OBJECTS, REFERENCE_BOOK_OPERATIONS, REFERENCE_BOOK_MATERIAL_COST, REFERENCE_BOOK_DISTRICT, INVOICE_OBJECT, REPORT, ADMIN_USERS_PAGE, REFERENCE_BOOK_TEAM, REFERENCE_BOOK_MATERIAL, INVOICE_OBJECT_MUTATION_ADD, INVOICE_OBJECT_DETIALS, INVOICE_CORRECTION, REFERENCE_BOOK_KL04KV_OBJECT, REFERENCE_BOOK_MJD_OBJECT, REFERENCE_BOOK_SIP_OBJECT, REFERENCE_BOOK_STVT_OBJECT, REFERENCE_BOOK_TP_OBJECT, INVOICE_RETURN_TEAM, INVOICE_RETURN_OBJECT, } from "./URLs"
import Home from "./pages/Home"
import Login from "./pages/Login"
import PermissionDenied from "./pages/PermissionDenied"
import ReferenceBooks from "./pages/ReferenceBooks"
import ErrorPage from "./pages/error-page"
import InvoiceInput from "./pages/invoice/InvoiceInput"
import InvoiceObject from "./pages/invoice/InvoiceObject"
import InvoiceOutput from "./pages/invoice/InvoiceOutput"
import InvoiceWriteOff from "./pages/invoice/InvoiceWriteOff"
import District from "./pages/reference-books/District"
import Materials from "./pages/reference-books/Materials"
import MaterialsCosts from "./pages/reference-books/MaterialsCosts"
import Objects from "./pages/reference-books/Objects"
import Operatons from "./pages/reference-books/Operations"
import Team from "./pages/reference-books/Teams"
import Worker from "./pages/reference-books/Worker"
import Report from "./pages/Report"
import AdminUserPage from "./pages/AdminUserPage"
import InvoiceObjectMutationAdd from "./pages/invoice/InvoiceObjectMutationMobile"
import InvoiceObjectDetails from "./pages/invoice/InvoiceObjectDetail"
import InvoiceCorrection from "./pages/invoice/InvoiceCorrection"
import KL04KVObject from "./pages/reference-books/object/KL04KVObject"
import MJDObject from "./pages/reference-books/object/MJDObject"
import SIPObject from "./pages/reference-books/object/SIPObject"
import STVTObject from "./pages/reference-books/object/STVTObject"
import TPObject from "./pages/reference-books/object/TPObject"
import InvoiceReturnTeam from "./pages/invoice/InvoiceReturnTeam"
import InvoiceReturnObject from "./pages/invoice/InvoiceReturnObject"

export const PAGES_WITHOUT_LAYOUT = [
  {
    path: LOGIN,
    element: <Login />
  },
  {
    path: PAGE_NOT_FOUND,
    element: <ErrorPage />
  },
  {
    path: PERMISSION_DENIED,
    element: <PermissionDenied />
  },
]

export const PAGES_WITH_LAYOUT = [
  {
    path: HOME,
    element: <Home />
  },
  {
    path: ADMIN_USERS_PAGE,
    element: <AdminUserPage />
  },
  {
    path: INVOICE_INPUT,
    element: <InvoiceInput />
  },
  {
    path: INVOICE_RETURN_TEAM,
    element: <InvoiceReturnTeam />
  },
  {
    path: INVOICE_RETURN_OBJECT,
    element: <InvoiceReturnObject />
  },
  {
    path: INVOICE_OUTPUT,
    element: <InvoiceOutput />
  },
  {
    path: INVOICE_OBJECT,
    element: <InvoiceObject />
  },
  {
    path: INVOICE_OBJECT_MUTATION_ADD,
    element: <InvoiceObjectMutationAdd />
  },
  {
    path: INVOICE_OBJECT_DETIALS,
    element: <InvoiceObjectDetails />
  },
  {
    path: INVOICE_CORRECTION,
    element: <InvoiceCorrection />
  },
  {
    path: INVOICE_WRITEOFF,
    element: <InvoiceWriteOff />
  },
  {
    path: REFERENCE_BOOK_WORKER,
    element: <Worker />
  },
  {
    path: "/reference-books",
    element: <ReferenceBooks />
  },
  {
    path: REFERENCE_BOOK_MATERIAL,
    element: <Materials />
  },
  {
    path: REFERENCE_BOOK_TEAM,
    element: <Team />
  },
  {
    path: REFERENCE_BOOK_OBJECTS,
    element: <Objects />
  },
  {
    path: REFERENCE_BOOK_KL04KV_OBJECT,
    element: <KL04KVObject />
  },
  {
    path: REFERENCE_BOOK_MJD_OBJECT,
    element: <MJDObject />
  },
  {
    path: REFERENCE_BOOK_SIP_OBJECT,
    element: <SIPObject />
  },
  {
    path: REFERENCE_BOOK_STVT_OBJECT,
    element: <STVTObject />
  },
  {
    path: REFERENCE_BOOK_TP_OBJECT,
    element: <TPObject />
  },
  {
    path: REFERENCE_BOOK_OPERATIONS,
    element: <Operatons />
  },
  {
    path: REFERENCE_BOOK_MATERIAL_COST,
    element: <MaterialsCosts />
  },
  {
    path: REFERENCE_BOOK_DISTRICT,
    element: <District />
  },
  {
    path: REPORT,
    element: <Report />
  }
]

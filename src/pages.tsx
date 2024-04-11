import { LOGIN, PAGE_NOT_FOUND, PERMISSION_DENIED, HOME, INVOICE_INPUT, INVOICE_OUTPUT, INVOICE_RETURN, INVOICE_WRITEOFF, REFERENCE_BOOK_WORKER, REFERENCE_BOOK_OBJECTS, REFERENCE_BOOK_OPERATIONS, REFERENCE_BOOK_MATERIAL_COST, REFERENCE_BOOK_DISTRICT, INVOICE_OBJECT, REPORT, ADMIN_USERS_PAGE, REFERENCE_BOOK_TEAM, REFERENCE_BOOK_MATERIAL, INVOICE_OBJECT_MUTATION_ADD, } from "./URLs"
import Home from "./pages/Home"
import Login from "./pages/Login"
import PermissionDenied from "./pages/PermissionDenied"
import ReferenceBooks from "./pages/ReferenceBooks"
import ErrorPage from "./pages/error-page"
import InvoiceInput from "./pages/invoice/InvoiceInput"
import InvoiceObject from "./pages/invoice/InvoiceObject"
import InvoiceOutput from "./pages/invoice/InvoiceOutput"
import InvoiceReturn from "./pages/invoice/InvoiceReturn"
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
    path: INVOICE_RETURN,
    element: <InvoiceReturn />
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

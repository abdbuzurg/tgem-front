import { LOGIN, PAGE_NOT_FOUND, PERMISSION_DENIED, HOME, INVOICE_INPUT, INVOICE_OUTPUT, INVOICE_RETURN, INVOICE_WRITEOFF, REFERENCE_BOOK_WORKER, REFERENCE_BOOK_OBJECTS } from "./URLs"
import Home from "./pages/Home"
import Login from "./pages/Login"
import PermissionDenied from "./pages/PermissionDenied"
import ReferenceBooks from "./pages/ReferenceBooks"
import ErrorPage from "./pages/error-page"
import Invoice from "./pages/invoice/Invoice"
import Materials from "./pages/reference-books/Materials"
import Objects from "./pages/reference-books/Objects"
import Team from "./pages/reference-books/Teams"
import Worker from "./pages/reference-books/Worker"

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
    path: INVOICE_INPUT,
    element: <Invoice />
  },
  {
    path: INVOICE_OUTPUT,
    element: <Invoice />
  },
  {
    path: INVOICE_RETURN,
    element: <Invoice />
  },
  {
    path: INVOICE_WRITEOFF,
    element: <Invoice />
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
    path:"/reference-books/materials",
    element: <Materials />
  },
  {
    path:"/reference-books/teams",
    element: <Team />
  },
  {
    path: REFERENCE_BOOK_OBJECTS,
    element: <Objects />
  }
]
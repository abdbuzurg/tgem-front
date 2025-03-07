import { LOGIN, PAGE_NOT_FOUND, PERMISSION_DENIED, HOME, INVOICE_INPUT, REFERENCE_BOOK_WORKER, REFERENCE_BOOK_OBJECTS, REFERENCE_BOOK_OPERATIONS, REFERENCE_BOOK_MATERIAL_COST, REFERENCE_BOOK_DISTRICT, INVOICE_OBJECT_USER, REPORT, ADMIN_USERS_PAGE, REFERENCE_BOOK_TEAM, REFERENCE_BOOK_MATERIAL, INVOICE_OBJECT_MUTATION_ADD, INVOICE_OBJECT_DETIALS, INVOICE_CORRECTION, REFERENCE_BOOK_KL04KV_OBJECT, REFERENCE_BOOK_MJD_OBJECT, REFERENCE_BOOK_SIP_OBJECT, REFERENCE_BOOK_STVT_OBJECT, REFERENCE_BOOK_TP_OBJECT, INVOICE_RETURN_TEAM, INVOICE_RETURN_OBJECT, REFERENCE_BOOK, REFERENCE_BOOK_SUBSTATION_OBJECT, INVOICE_OUTPUT_IN_PROJECT, INVOICE_OUTPUT_OUT_OF_PROJECT, ADMINISTRATOR_HOME_PAGE, ADMINISTRATOR_PROJECT, ADMINISTRATOR_USERS, IMPORT, MATERIAL_LOCATION_LIVE, WRITEOFF_WAREHOUSE, LOSS_WAREHOUSE, LOSS_TEAM, LOSS_OBJECT, WRITEOFF_OBJECT, HR_ATTENDANCE, REFERENCE_BOOK_SUBSTATION_CELL_OBJECT, AUCTION_PUBLIC, AUCTION_PRIVATE,  INVOICE_OBJECT_PAGINATED_PAGE, STATISTICS, } from "./URLs"
import Home from "./pages/Home"
import Login from "./pages/Login"
import PermissionDenied from "./pages/PermissionDenied"
import ReferenceBooks from "./pages/ReferenceBooks"
import ErrorPage from "./pages/error-page"
import InvoiceInput from "./pages/invoice/InvoiceInput"
import InvoiceObjectUser from "./pages/invoice/InvoiceObjectUser"
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
import SubstationObject from "./pages/reference-books/object/SubstationObject"
import InvoiceOutputInProject from "./pages/invoice/InvoiceOutputInProject"
import InvoiceOutputOutOfProject from "./pages/invoice/InvoiceOutputOutOfProject"
import AdministatorHome from "./pages/AdministratorHome"
import { AdministratorProject } from "./pages/admin/AdministratorProject"
import Import from './pages/Import'
import MaterialLocationLive from "./pages/MaterialLocationLive"
import WriteOffWarehouse from "./pages/writeoff/WriteOffWarehouse"
import LossWarehouse from "./pages/writeoff/LossWarehouse"
import LossTeam from "./pages/writeoff/LossTeam"
import LossObject from "./pages/writeoff/LossObject"
import WriteOffObject from "./pages/writeoff/WriteOffObject"
import Attendance from "./pages/hr/Attendance"
import SubstationCellObject from "./pages/reference-books/object/SubstationCellObject"
import AuctionPublic from "./pages/auction/AuctionPublic"
import AuctionPrivate from "./pages/auction/AuctionPrivate"
import InvoiceObjectPaginatedPage from "./pages/invoice/invoiceObjectPaginatedPage"
import Statistics from "./pages/Statistics"

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
  {
    path: AUCTION_PUBLIC,
    element: <AuctionPublic />
  },
  {
    path: AUCTION_PRIVATE,
    element: <AuctionPrivate />
  }
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
    path: INVOICE_OUTPUT_IN_PROJECT,
    element: <InvoiceOutputInProject />
  },
  {
    path: INVOICE_OUTPUT_OUT_OF_PROJECT,
    element: <InvoiceOutputOutOfProject />
  },
  {
    path: INVOICE_OBJECT_PAGINATED_PAGE,
    element: <InvoiceObjectPaginatedPage />
  },
  {
    path: INVOICE_OBJECT_USER,
    element: <InvoiceObjectUser />
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
    path: REFERENCE_BOOK_WORKER,
    element: <Worker />
  },
  {
    path: REFERENCE_BOOK,
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
    path: REFERENCE_BOOK_SUBSTATION_OBJECT,
    element: <SubstationObject />
  },
  {
    path: REFERENCE_BOOK_SUBSTATION_CELL_OBJECT,
    element: <SubstationCellObject />
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
  },
  {
    path: IMPORT,
    element: <Import />
  },
  {
    path: MATERIAL_LOCATION_LIVE,
    element: <MaterialLocationLive />
  },
  {
    path: WRITEOFF_WAREHOUSE,
    element: <WriteOffWarehouse />
  },
  {
    path: LOSS_WAREHOUSE,
    element: <LossWarehouse />
  },
  {
    path: LOSS_TEAM,
    element: <LossTeam />
  },
  {
    path: LOSS_OBJECT,
    element: <LossObject />
  },
  {
    path: WRITEOFF_OBJECT,
    element: <WriteOffObject />
  },
  {
    path: HR_ATTENDANCE,
    element: <Attendance />
  },
  {
    path:  STATISTICS,
    element: <Statistics />
  },
]

export const ADMIN_PAGES = [
  {
    path: ADMINISTRATOR_HOME_PAGE,
    element: <AdministatorHome />
  },
  {
    path: ADMINISTRATOR_PROJECT,
    element: <AdministratorProject />
  },
  {
    path: ADMINISTRATOR_USERS,
    element: <AdminUserPage />
  },
]

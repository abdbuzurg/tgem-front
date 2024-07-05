import { Navigate, Route, Routes, } from "react-router-dom";
import { ADMIN_PAGES, PAGES_WITHOUT_LAYOUT, PAGES_WITH_LAYOUT } from "./pages";
import Layout from "./components/layout";
import { AdminLayout } from "./components/adminLayout";

export default function App() {

  return (
    <Routes>
      {/* public routes */}
      {PAGES_WITHOUT_LAYOUT.map((route, index) => <Route key={index} path={route.path} element={route.element}></Route>)}

      {/* allowed only for logged users */}
      <Route element={<Layout />}>
        {PAGES_WITH_LAYOUT.map((route, index) => <Route key={index} path={route.path} element={route.element}></Route>)}
      </Route>

      {/* allowed only for admin only */}
      <Route element={<AdminLayout />}>
        {ADMIN_PAGES.map((route, index) => <Route key={index} path={route.path} element={route.element}></Route>)}
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  )
}

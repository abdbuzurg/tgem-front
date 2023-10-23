import Layout from "./components/layout";
import { Navigate, Route, Routes } from "react-router-dom";
import { PAGES_WITHOUT_LAYOUT, PAGES_WITH_LAYOUT } from "./pages";

export default function App() {
  return (
    <Routes>
      {/* public routes */}
      {PAGES_WITHOUT_LAYOUT.map((route, index) => <Route key={index} path={route.path} element={route.element}></Route>)}
      
      {/* protected by authentication routes */}
      
      {/* allowed only for superadmin */}
      <Route element={<Layout />}>
        {PAGES_WITH_LAYOUT.map((route, index) => <Route key={index} path={route.path} element={route.element}></Route>)}
      </Route>
      
      {/* 404 */}
      <Route path="*" element={<Navigate to="/404" replace/>} />
    </Routes>
  )
}

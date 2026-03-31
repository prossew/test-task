import { createBrowserRouter } from "react-router-dom";
import AdsListPage from "./pages/AdsListPage/AdsListPage";
import AdViewPage from "./pages/AdViewPage/AdViewPage";
import AdEditPage from "./pages/AdEditPage/AdEditPage";

export const router = createBrowserRouter([
  { path: "/", element: <AdsListPage /> },
  { path: "/ads", element: <AdsListPage />},
   {path: "/ads/:id", element: <AdViewPage /> },
   {path: "/ads/:id/edit", element: <AdEditPage />},
]);

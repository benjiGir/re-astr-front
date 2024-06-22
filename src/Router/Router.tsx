import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LoginPage from "../pages/LoginPage";

const Router = () => {
  const router = createBrowserRouter([{ path: "/", element: <LoginPage /> }]);

  return <RouterProvider router={router} />;
};

export default Router;

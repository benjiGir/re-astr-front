import { Outlet } from "react-router-dom";
import SideNavi from "../components/SideNav";

const NavLayout = () => {
  return (
    <>
      <SideNavi />
      <Outlet />
    </>
  );
};

export default NavLayout;

import { Outlet } from "react-router-dom";
import SideNavi from "../components/SideNav";
import TopNav from "../components/TopNav";

const NavLayout = () => {
  return (
    <>
      <SideNavi />
      <Outlet />
    </>
  );
};

export default NavLayout;

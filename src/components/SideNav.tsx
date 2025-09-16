/*import {
  SideNav,
  SideNavItems,
  // SideNavMenu,
  SideNavMenuItem,
} from "@carbon/react";

const SideNavi = () => {
  return (
    <SideNav style={{ border: "1px solid #e0e0e0" }} isRail>
      <SideNavItems>

        <SideNavMenuItem href="https://www.carbondesignsystem.com/">
          L0 menu item
        </SideNavMenuItem>
        <SideNavMenuItem
          aria-current="page"
          href="https://www.carbondesignsystem.com/"
        >
          L0 menu item
        </SideNavMenuItem>
        <SideNavMenuItem href="https://www.carbondesignsystem.com/">
          L0 menu item
        </SideNavMenuItem>

      </SideNavItems>
    </SideNav>
  );
};
*/

import { useState } from "react";

const SideNavi = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  return (
    <div className="layout">
      <aside className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
        <div className="sidebar-content">
          <button
            className="collapse-button"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? "→" : "←"}
          </button>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-item">
            <span className="icon">📁</span>
            {!isCollapsed && <span className="text">BlaBlaBla</span>}
          </div>
          <div className="nav-item">
            <span className="icon">📄</span>
            {!isCollapsed && <span className="text">BlaBlaBla</span>}
          </div>
          <div className="nav-item">
            <span className="icon">🗂️</span>
            {!isCollapsed && <span className="text">BlaBlaBla</span>}
          </div>
        </nav>
      </aside>
    </div>
  );
};

export default SideNavi;

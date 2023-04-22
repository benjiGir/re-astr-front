import Icon from "@components/icons/Icon"
import { navbarClass, navbarIconClass } from "./navbar.css"

const Navbar =()=>{

return (
    <nav className={navbarClass}>
        <p>ASTR</p>
        <Icon name="defaultProfilePic" className={navbarIconClass} />
    </nav>
)    

}

export default Navbar

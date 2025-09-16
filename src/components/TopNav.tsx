import { Header, HeaderName } from "@carbon/react";

const TopNav = () => {
  return (
    <>
      <Header aria-label="ASTR Platform Name">
        <HeaderName href="/home" prefix="ASTR">
          [Platform]
        </HeaderName>
      </Header>
    </>
  );
};

export default TopNav;

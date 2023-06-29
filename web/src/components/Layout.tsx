import { FC, PropsWithChildren } from "react";
import { Container } from "@chakra-ui/react";

type LayoutProps = PropsWithChildren;

const Layout: FC<LayoutProps> = ({ children }) => {
  return <Container maxW="container.xl">{children}</Container>;
};

export default Layout;

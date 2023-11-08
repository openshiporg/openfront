import { Navigation } from "@keystone/components/Navigation";
import { Logo } from "@keystone/components/Logo";
import { Fragment } from "react";
import { ModeToggle } from "./ModeToggle";

export const HEADER_HEIGHT = 80;

const PageWrapper = (props) => {
  return (
    <Fragment>
      {/* TODO: not sure where to put this */}
      <div
        className="grid h-screen isolate"
        style={{
          gridTemplateColumns: "minmax(300px, 1fr) 4fr",
          gridTemplateRows: `${HEADER_HEIGHT}px auto`,
        }}
        {...props}
      />
    </Fragment>
  );
};

const Sidebar = (props) => {
  // const { colors } = useTheme();

  return (
    <aside
      className="min-w-0 overflow-y-auto"
      style={{ WebkitOverflowScrolling: "touch" }}
      {...props}
    />
  );
};

const Content = (props) => {
  return (
    <main className="min-w-0 pl-8 pr-8 overflow-y-auto relative" {...props} />
  );
};

export const PageContainer = ({ children, header, title }) => {
  return (
    <PageWrapper>
      <div className="items-center flex justify-between px-8 border-b">
        <Logo />
      </div>
      <header className="items-center flex justify-between min-w-0 pl-8 pr-8 text-xl font-semibold border-b">
        <title>{title ? `Keystone - ${title}` : "Keystone"}</title>
        {header}
        <ModeToggle />
      </header>
      <Sidebar>
        <Navigation />
      </Sidebar>
      <Content>{children}</Content>
    </PageWrapper>
  );
};

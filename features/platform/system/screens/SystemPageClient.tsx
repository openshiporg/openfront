"use client";

import { PageContainer } from "../../../dashboard/components/PageContainer";
import { SystemTabs, TabType } from "../components/SystemTabs";

interface SystemPageClientProps {
  list: any;
  initialTab: TabType;
}

export function SystemPageClient({
  list,
  initialTab,
}: SystemPageClientProps) {

  return (
    <PageContainer
      header={{
        title: "System Configuration",
        description: "Manage system settings, store configuration, and payment providers",
      }}
    >
      <SystemTabs
        initialTab={initialTab}
        list={list}
      />
    </PageContainer>
  );
}
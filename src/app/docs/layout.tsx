import type { ReactNode } from "react";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { source } from "@/lib/source";
import { REPO_URL } from "@/lib/site";

const baseOptions: BaseLayoutProps = {
  nav: {
    title: "NuclaDB",
    url: "/",
  },
  githubUrl: REPO_URL,
  links: [{ text: "Site", url: "/" }],
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout {...baseOptions} tree={source.pageTree}>
      {children}
    </DocsLayout>
  );
}

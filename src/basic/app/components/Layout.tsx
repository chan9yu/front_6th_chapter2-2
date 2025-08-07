import { PropsWithChildren } from "react";

type LayoutProps = PropsWithChildren;

export function Layout({ children }: LayoutProps) {
  return <div className="min-h-screen bg-gray-50">{children}</div>;
}

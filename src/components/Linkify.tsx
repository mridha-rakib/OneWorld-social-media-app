import React from "react";

interface LinkifyProps {
  children: React.ReactNode;
}

export default function Linkify({ children }: LinkifyProps) {
  <LinkifyUrl>{children}</LinkifyUrl>;
}

function LinkifyUrl({ children }: LinkifyProps) {
  return <h3 className="text-primary hover:underline">Hello</h3>;
}

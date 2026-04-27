import type { Metadata } from "next";
import WelcomePage from "@/app/welcome/page";

export const metadata: Metadata = {
  title: "Circuit QED — A First Principles Reference",
  description: "An interactive reference on circuit quantum electrodynamics, built from first principles.",
};

export default function Home() {
  return <WelcomePage />;
}
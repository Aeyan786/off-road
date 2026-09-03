import TopBar from "@/components/header/TopBar";
import MainHeader from "@/components/header/MainHeader";
import NavBar from "@/components/header/NavBar";

export default function Header() {
  return (
    <header className="sticky top-0 z-40">
      <TopBar />
      <MainHeader />
      <NavBar />
    </header>
  );
}

import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function PrivatePages() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow p-4 bg-gray-50">
        <Outlet />
      </main>
    </div>
  );
}

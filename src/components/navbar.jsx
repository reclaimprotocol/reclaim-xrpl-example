import React from "react";
import XRPlogo from "../assets/xrp-logo.png";
import ReclaimLogo from "../assets/reclaim-logo.png";

export default function Navbar() {
  return (
    <div className="fixed top-0 left-0 right-0  justify-between flex flex-row px-4 p-2 items-center mt-2">
      <img src={XRPlogo} alt="XRPL Logo" className="h-8" />
      <img src={ReclaimLogo} alt="XRPL Logo" className="h-16" />
    </div>
  );
}

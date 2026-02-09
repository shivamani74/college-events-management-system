import React from "react";

const Footer = () => {
  return (
    <footer className="border-t border-zinc-800 py-4 text-center text-sm text-zinc-500">
      © {new Date().getFullYear()} GRIEThub · GRIET
    </footer>
  );
};

export default Footer;

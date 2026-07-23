export default function Logo() {
  return (
    <div className="logo-container flex items-center gap-1 md:gap-2 lg:gap-4 flex-shrink-0">
      <img src="/logo10.png" alt="Certus Diagnostics" className="h-14 md:h-12 lg:h-16 w-auto" />
      <img
        src="/thyrocare.png"
        alt="Thyrocare"
        className="h-7 md:h-8 lg:h-10 w-auto rounded-md"
      />
      <img
        src="/agilus.png"
        alt="Agilus"
        className="h-7 md:h-7 lg:h-9 w-auto rounded-md"
      />
    </div>
  );
}

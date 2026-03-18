import { SYSmoAILogo, SYSmoAIWordmark } from "@/components/ui/sysmoai-logo"

const SYSmoAICTA = () => {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <a
        href="https://sysmoai.com"
        target="_blank"
        rel="noreferrer"
        className="flex gap-x-2 items-center bg-white backdrop-blur-sm border border-transparent ring-1 ring-foreground/5 rounded-md px-2.5 py-1 shadow hover:bg-white/90 transition-colors"
      >
        <span className="text-muted-foreground font-medium text-[0.625rem] uppercase tracking-wide">Powered By</span>
        <span className="flex items-center gap-1.5">
          <SYSmoAILogo size={14} variant="brand-light" />
          <SYSmoAIWordmark size={11} color="#030213" />
        </span>
      </a>
    </div>
  );
}

export default SYSmoAICTA

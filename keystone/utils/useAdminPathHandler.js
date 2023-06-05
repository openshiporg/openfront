import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export const useAdminPathHandler = () => {
  const pathname = usePathname();
  const router = useRouter();

  const adminPath = process.env.NEXT_PUBLIC_ADMIN_PATH || "/admin"

  useEffect(() => {
    if (!pathname?.startsWith(adminPath)) return;

    const adminPathname = (path) =>
      path.startsWith(adminPath) ? path : `${adminPath}${path}`;

    const handleClick = (event) => {
      const target = event.target.closest("a");
      if (!target) return;

      event.preventDefault();
      const href = target.getAttribute("href");
      if (href.startsWith("/")) router.push(adminPathname(href));
    };

    const replaceLinks = () => {
      const links = document.querySelectorAll("a[href^='/']");
      links.forEach((link) => {
        link.removeEventListener("click", handleClick);
        link.addEventListener("click", handleClick);

        const href = link.getAttribute("href");
        if (!href.startsWith(adminPath)) {
          link.setAttribute("href", `${adminPath}${href}`);
        }
      });
    };

    replaceLinks();

    const observer = new MutationObserver(() => replaceLinks());
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, [pathname, router]);
};

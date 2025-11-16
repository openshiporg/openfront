import { cn } from "@/lib/utils";
import { getCategoriesList } from "@/features/storefront/lib/data/categories"
import { getCollectionsList } from "@/features/storefront/lib/data/collections"
import LocalizedClientLink from "@/features/storefront/modules/common/components/localized-client-link"
import Logo from "@/features/storefront/modules/layout/components/logo"
import { getStore } from "@/features/storefront/lib/data/store"

export default async function Footer() {
  const { collections } = await getCollectionsList(0, 6)
  const { productCategories } = await getCategoriesList(0, 6)
  const store = await getStore()
  const storeName = store?.name || "Openfront Store"

  return (
    <footer className="border-t border-border w-full">
      <div className="max-w-[1440px] mx-auto px-6 flex flex-col">
        <div className="flex flex-col gap-y-6 sm:flex-row items-start justify-between py-40">
          <div>
            <Logo />
          </div>
          <div className="text-xs leading-5 font-normal gap-10 md:gap-x-16 grid grid-cols-2 sm:grid-cols-3">
            {productCategories && productCategories?.length > 0 && (
              <div className="flex flex-col gap-y-2">
                <span className="text-[0.8125rem] leading-[1.375rem] font-medium text-foreground">
                  Categories
                </span>
                <ul className="grid grid-cols-1 gap-2">
                  {productCategories?.slice(0, 6).map((c: any) => {
                    if (c.parentCategory) {
                      return
                    }

                    const children =
                      c.categoryChildren?.map((child: any) => ({
                        title: child.title,
                        handle: child.handle,
                        id: child.id,
                      })) || null

                    return (
                      <li className="flex flex-col text-muted-foreground text-[0.8125rem] leading-[1.375rem] font-normal" key={c.id}>
                        <LocalizedClientLink
                          className={cn("hover:text-foreground")}
                          href={`/categories/${c.handle}`}>
                          {c.title}
                        </LocalizedClientLink>
                        {children && (
                          <ul className="grid grid-cols-1 ml-3 gap-2">
                            {children &&
                              children.map((child: any) => (
                                <li key={child.id}>
                                  <LocalizedClientLink className="hover:text-foreground" href={`/categories/${child.handle}`}>
                                    {child.title}
                                  </LocalizedClientLink>
                                </li>
                              ))}
                          </ul>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
            {collections && collections.length > 0 && (
              <div className="flex flex-col gap-y-2">
                <span className="text-[0.8125rem] leading-[1.375rem] font-medium text-foreground">
                  Collections
                </span>
                <ul
                  className={cn("grid grid-cols-1 gap-2 text-muted-foreground text-[0.8125rem] leading-[1.375rem] font-normal", {
                    "grid-cols-2": (collections?.length || 0) > 3,
                  })}>
                  {collections?.slice(0, 6).map((c: any) => (
                    <li key={c.id}>
                      <LocalizedClientLink className="hover:text-foreground" href={`/collections/${c.handle}`}>
                        {c.title}
                      </LocalizedClientLink>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex flex-col gap-y-2">
              <span className="text-[0.8125rem] leading-[1.375rem] font-medium text-foreground">Openfront</span>
              <ul className="grid grid-cols-1 gap-y-2 text-muted-foreground text-[0.8125rem] leading-[1.375rem] font-normal">
                <li>
                  <a
                    href="https://github.com/openshiporg"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-foreground">
                    GitHub
                  </a>
                </li>
                <li>
                  <a
                    href="https://docs.openship.org"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-foreground">
                    Documentation
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/openshiporg/openfront"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-foreground">
                    Source code
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="flex w-full mb-16 justify-center text-muted-foreground">
          <p className="text-[0.8125rem] leading-5 font-normal">
            <span suppressHydrationWarning>
              © {new Date().getFullYear()} {storeName}. All rights reserved.
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}

import { Text, clx } from "@medusajs/ui"

import { getCategoriesList, getCollectionsList } from "@storefront/lib/data"

import LocalizedClientLink from "@storefront/modules/common/components/localized-client-link"
import OpenfrontCTA from "@storefront/modules/layout/components/openfront-cta"

export default async function Footer() {
  const { collections } = await getCollectionsList(0, 6)
  const { productCategories } = await getCategoriesList(0, 6)

  return (
    <footer className="border-t border-ui-border-base w-full">
      <div className="content-container flex flex-col w-full">
        <div
          className="flex flex-col gap-y-6 xsmall:flex-row items-start justify-between py-40">
          <div>
            <LocalizedClientLink
              href="/"
              className="txt-compact-xlarge-plus text-ui-fg-subtle hover:text-ui-fg-base uppercase">
              Openfront Store
            </LocalizedClientLink>
          </div>
          <div
            className="text-small-regular gap-10 md:gap-x-16 grid grid-cols-2 sm:grid-cols-3">
            {productCategories && productCategories?.length > 0 && (
              <div className="flex flex-col gap-y-2">
                <span className="txt-small-plus txt-ui-fg-base">
                  Categories
                </span>
                <ul className="grid grid-cols-1 gap-2">
                  {productCategories?.slice(0, 6).map((c) => {
                    if (c.parentCategory) {
                      return
                    }

                    const children =
                      c.categoryChildren?.map((child) => ({
                        title: child.title,
                        handle: child.handle,
                        id: child.id,
                      })) || null

                    return (
                      <li className="flex flex-col text-ui-fg-subtle txt-small" key={c.id}>
                        <LocalizedClientLink
                          className={clx("hover:text-ui-fg-base")}
                          href={`/categories/${c.handle}`}>
                          {c.title}
                        </LocalizedClientLink>
                        {children && (
                          <ul className="grid grid-cols-1 ml-3 gap-2">
                            {children &&
                              children.map((child) => (
                                <li key={child.id}>
                                  <LocalizedClientLink className="hover:text-ui-fg-base" href={`/categories/${child.handle}`}>
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
                <span className="txt-small-plus txt-ui-fg-base">
                  Collections
                </span>
                <ul
                  className={clx("grid grid-cols-1 gap-2 text-ui-fg-subtle txt-small", {
                    "grid-cols-2": (collections?.length || 0) > 3,
                  })}>
                  {collections?.slice(0, 6).map((c) => (
                    <li key={c.id}>
                      <LocalizedClientLink className="hover:text-ui-fg-base" href={`/collections/${c.handle}`}>
                        {c.title}
                      </LocalizedClientLink>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex flex-col gap-y-2">
              <span className="txt-small-plus txt-ui-fg-base">Openfront</span>
              <ul className="grid grid-cols-1 gap-y-2 text-ui-fg-subtle txt-small">
                <li>
                  <a
                    href="https://github.com/openshiporg"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-ui-fg-base">
                    GitHub
                  </a>
                </li>
                <li>
                  <a
                    href="https://docs.openship.org"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-ui-fg-base">
                    Documentation
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/openshiporg/openfront"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-ui-fg-base">
                    Source code
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="flex w-full mb-16 justify-between text-ui-fg-muted">
          <Text className="txt-compact-small">
            © {new Date().getFullYear()} Openfront. All rights reserved.
          </Text>
          <OpenfrontCTA />
        </div>
      </div>
    </footer>
  );
}

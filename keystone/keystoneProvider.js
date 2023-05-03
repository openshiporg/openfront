import {useEffect, useState} from 'react';
import {usePathname, useSearchParams, useRouter} from 'next/navigation';
import {ErrorBoundary} from '@keystone-6/core/admin-ui/components';
import {KeystoneProvider as Provider} from '@keystone-6/core/admin-ui/context';
import * as view0 from '@keystone-6/core/___internal-do-not-use-will-break-in-patch/admin-ui/id-field-view';
import * as view1 from '@keystone-6/core/fields/types/text/views';
import * as view2 from '@keystone-6/core/fields/types/password/views';
import * as view3 from '@keystone-6/core/fields/types/relationship/views';
import * as view4 from '@keystone-6/core/fields/types/json/views';
import * as view5 from '@keystone-6/core/fields/types/timestamp/views';
import * as view6 from '@keystone-6/core/fields/types/checkbox/views';
import * as view7 from '@keystone-6/core/fields/types/select/views';
import * as view8 from '@keystone-6/core/fields/types/integer/views';
import * as view9 from '@keystone-6/core/fields/types/float/views';
import * as view10 from '@keystone-6/core/fields/types/image/views';
import {keystoneDefinitions} from './keystoneDefinitions';
import {Core} from '@keystone-ui/core';

export const KeystoneProvider = ({children}) => {
  const pathname = usePathname();
  const router = useRouter();

  const lazyMetadataQuery = {
    kind: 'Document',
    definitions: keystoneDefinitions,
  };

  const fieldViews = [
    view0,
    view1,
    view2,
    view3,
    view4,
    view5,
    view6,
    view7,
    view8,
    view9,
    view10,
  ];

  useEffect(() => {
    if (!pathname?.startsWith('/admin')) return;

    const adminPathname = path =>
      path.startsWith('/admin') ? path : `/admin${path}`;

    const handleClick = event => {
      const target = event.target.closest('a');
      if (!target) return;

      event.preventDefault();
      const href = target.getAttribute('href');
      if (href.startsWith('/')) router.push(adminPathname(href));
    };

    const replaceLinks = () => {
      const links = document.querySelectorAll("a[href^='/']");
      links.forEach(link => {
        link.removeEventListener('click', handleClick);
        link.addEventListener('click', handleClick);

        const href = link.getAttribute('href');
        if (!href.startsWith('/admin')) {
          link.setAttribute('href', `/admin${href}`);
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

  return (
    <Core>
      <Provider
        lazyMetadataQuery={lazyMetadataQuery}
        fieldViews={fieldViews}
        adminMetaHash="p7mmo"
        adminConfig={{}}
        apiPath="/api/graphql">
        <ErrorBoundary>{children}</ErrorBoundary>
      </Provider>
    </Core>
  );
};

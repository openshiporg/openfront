import {useState, Fragment, FormEvent, useRef, useEffect, useMemo} from 'react';
import {
  Card,
  Stack,
  Heading,
  VisuallyHidden,
  Input,
  Button,
  YStack,
  Paragraph,
  XStack,
  Separator,
  H2,
  H3,
  Spinner,
} from 'tamagui';

import {useMutation, gql} from '@keystone-6/core/admin-ui/apollo';
import {
  useRawKeystone,
  useReinitContext,
} from '@keystone-6/core/admin-ui/context';
import {useRouter} from '@keystone-6/core/admin-ui/router';
import Link from 'next/link';
import {Notice} from '../components/Notice';

export const useRedirect = () => {
  const router = useRouter();
  const redirect = useMemo(() => {
    const {from} = router.query;
    if (typeof from !== 'string') return '/';
    if (!from.startsWith('/')) return '/';
    if (from === '/no-access') return '/';

    return from;
  }, [router]);

  return redirect;
};

const Signin = ({
  identityField = 'email',
  secretField = 'password',
  mutationName = 'authenticateUserWithPassword',
  successTypename = 'UserAuthenticationWithPasswordSuccess',
  failureTypename = 'UserAuthenticationWithPasswordFailure',
}) => {
  const mutation = gql`
    mutation($identity: String!, $secret: String!) {
      authenticate: ${mutationName}(${identityField}: $identity, ${secretField}: $secret) {
        ... on ${successTypename} {
          item {
            id
          }
        }
        ... on ${failureTypename} {
          message
        }
      }
    }
  `;

  const [mode, setMode] = useState('signin');
  const [state, setState] = useState({identity: '', secret: ''});
  const [submitted, setSubmitted] = useState(false);

  const identityFieldRef = useRef(null);
  useEffect(() => {
    identityFieldRef.current?.focus();
  }, [mode]);

  const [mutate, {error, loading, data}] = useMutation(mutation);
  const reinitContext = useReinitContext();
  const router = useRouter();
  const rawKeystone = useRawKeystone();
  const redirect = useRedirect();

  // if we are signed in, redirect immediately
  useEffect(() => {
    if (submitted) return;
    if (rawKeystone.authenticatedItem.state === 'authenticated') {
      router.push(redirect);
    }
  }, [rawKeystone.authenticatedItem, router, redirect, submitted]);

  useEffect(() => {
    if (!submitted) return;

    // TODO: this is horrible, we need to resolve this mess
    // @ts-ignore
    if (rawKeystone.adminMeta?.error?.message === 'Access denied') {
      router.push('/no-access');
      return;
    }

    router.push(redirect);
  }, [rawKeystone.adminMeta, router, redirect, submitted]);

  const onSubmit = async event => {
    event.preventDefault();

    if (mode !== 'signin') return;

    try {
      const {data} = await mutate({
        variables: {
          identity: state.identity,
          secret: state.secret,
        },
      });
      console.log({data});
      if (data.authenticate?.__typename !== successTypename) return;
    } catch (e) {
      console.log('hellll');
      console.error(e);
      return;
    }

    await reinitContext();
    setSubmitted(true);
  };

  return (
    <YStack mih="100vh" miw="100vw" ai="center" jc="center" p="$2">
      <YStack miw={300} maw={320} jc="space-between" p="$2" space="$4">
        <Link href="/takeout/purchase" passHref legacyBehavior>
          <YStack tag="a" mb="$4">
            {/* <LogoIcon /> */}
          </YStack>
        </Link>

        <Card elevate size="$4" bordered backgroundColor={'$gray2'}>
          <Card.Header padded>
            <H3 mb="$4" ml="$1">Sign In</H3>
            <form onSubmit={onSubmit}>
              <YStack space="$2">
                <Input
                  id="identity"
                  name="identity"
                  value={state.identity}
                  onChange={e => setState({...state, identity: e.target.value})}
                  placeholder={identityField}
                  ref={identityFieldRef}
                  required
                />
                <Input
                  id="password"
                  name="password"
                  value={state.secret}
                  onChange={e => setState({...state, secret: e.target.value})}
                  placeholder={secretField}
                  secureTextEntry
                  required
                />
                <Button
                  // @ts-ignore
                  type="submit"
                  theme="blue"
                  marginTop="$2">
                  {loading ||
                  // this is for while the page is loading but the mutation has finished successfully
                  data?.authenticate?.__typename === successTypename ? (
                    <Spinner size="small" color="$blue10" />
                  ) : (
                    'Sign in'
                  )}
                </Button>
              </YStack>
            </form>
          </Card.Header>
        </Card>
        {error && (
          <Notice>
            <Paragraph>{error.message}</Paragraph>
          </Notice>
        )}
        {data?.authenticate?.__typename === failureTypename && (
          <Notice>
            <Paragraph> {data?.authenticate.message}</Paragraph>
          </Notice>
        )}
      </YStack>
    </YStack>
  );
};

export default Signin;

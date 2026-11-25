import { useRouterCtx } from "../router";

export function useRouter() {
  const { push, replace, back } = useRouterCtx();
  return { push, replace, back, refresh: () => {}, prefetch: () => {}, forward: () => {} };
}
export function usePathname() {
  return useRouterCtx().path;
}
export function useSearchParams() {
  return useRouterCtx().query;
}

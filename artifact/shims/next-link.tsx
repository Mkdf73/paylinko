import { forwardRef } from "react";
import { useRouterCtx } from "../router";

type Props = React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

const Link = forwardRef<HTMLAnchorElement, Props>(function Link({ href, onClick, children, ...rest }, ref) {
  const { push } = useRouterCtx();
  return (
    <a
      ref={ref}
      href={href}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || e.metaKey || e.ctrlKey) return;
        e.preventDefault();
        push(href);
      }}
      {...rest}
    >
      {children}
    </a>
  );
});

export default Link;

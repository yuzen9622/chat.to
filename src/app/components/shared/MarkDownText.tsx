import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { twMerge } from 'tailwind-merge';

export default function MarkDownText({
  text,
  style = "block",
}: {
  text: string;
  style?: "block" | "inline";
}) {
  return (
    <Markdown
      components={{
        h1: (props) => {
          return (
            <h1
              className={twMerge(
                "text-2xl text-wrap",
                style === "inline" && " text-nowrap truncate"
              )}
              {...props}
            />
          );
        },
        h2: (props) => {
          return (
            <h2
              className={twMerge(
                "text-xl text-wrap",
                style === "inline" && " text-nowrap truncate"
              )}
              {...props}
            />
          );
        },
        a: (props) => {
          const { children, ...rest } = props;
          return style === "inline" ? (
            <>{children}</>
          ) : (
            <a className="text-white underline text-wrap " {...rest}>
              {children}
            </a>
          );
        },
        p: (props) => {
          return (
            <p
              className={twMerge(
                "text-wrap",
                style === "inline" && " text-nowrap truncate"
              )}
              {...props}
            />
          );
        },
        code: (props) => {
          const { children, className, ...rest } = props;

          return (
            <code
              className={twMerge(
                "overflow-auto text-wrap  ",
                className,
                style === "inline" && "overflow-hidden truncate text-nowrap"
              )}
              {...rest}
            >
              {children}
            </code>
          );
        },
      }}
      remarkPlugins={[remarkGfm]}
    >{`${text}`}</Markdown>
  );
}

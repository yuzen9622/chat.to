import React from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { twMerge } from "tailwind-merge";

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
          return <h1 className="text-2xl " {...props} />;
        },
        h2: (props) => {
          return <h2 className="text-xl " {...props} />;
        },
        a: (props) => {
          return <a className="text-blue-900 underline " {...props} />;
        },
        code: (props) => {
          const { children, className, ...rest } = props;
          if (style === "inline") {
            <code className="overflow-hidden  text-nowrap" {...props} />;
          } else
            return (
              <code
                className={twMerge("overflow-auto text-wrap  ", className)}
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

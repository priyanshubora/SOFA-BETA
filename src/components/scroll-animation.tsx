
"use client";

import * as React from "react";
import { useRef, useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ScrollAnimationProps {
  children: ReactNode;
  className?: string;
}

export function ScrollAnimation({ children, className }: ScrollAnimationProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (ref.current) {
            observer.unobserve(ref.current);
          }
        }
      },
      {
        rootMargin: "0px",
        threshold: 0.1,
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        observer.unobserve(ref.current);
      }
    };
  }, []);

  // Clones the child to add the necessary classes and ref
  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child as React.ReactElement, {
        ref: ref,
        className: cn("scroll-animate", isVisible && "is-visible", child.props.className, className),
      });
    }
    return child;
  });

  return <>{childrenWithProps}</>;
}

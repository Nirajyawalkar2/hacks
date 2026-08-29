"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}

interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
  updateIndicator: () => void;
  scheduleUpdateIndicator: () => void;
  indicatorStyle: React.CSSProperties;
  mounted: boolean;
  registerTabTrigger: (value: string, element: HTMLButtonElement | null) => void;
  registerTabsList: (element: HTMLDivElement | null) => void;
}

const TabsContext = React.createContext<TabsContextValue>({
  value: "",
  onValueChange: () => { },
  updateIndicator: () => { },
  scheduleUpdateIndicator: () => { },
  indicatorStyle: {},
  mounted: false,
  registerTabTrigger: () => { },
  registerTabsList: () => { },
});

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ className, defaultValue, value, onValueChange, children, ...props }, ref) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue || "");
    const [indicatorStyle, setIndicatorStyle] = React.useState<React.CSSProperties>({});
    const [mounted, setMounted] = React.useState(false);
    const tabsListRef = React.useRef<HTMLDivElement | null>(null);
    const tabTriggerRefs = React.useRef(new Map<string, HTMLButtonElement | null>());

    const controlled = value !== undefined;
    const currentValue = controlled ? value : internalValue;

    const registerTabsList = React.useCallback((element: HTMLDivElement | null) => {
      tabsListRef.current = element;
    }, []);

    const registerTabTrigger = React.useCallback((val: string, element: HTMLButtonElement | null) => {
      if (element) {
        tabTriggerRefs.current.set(val, element);
      } else {
        tabTriggerRefs.current.delete(val);
      }
    }, []);

    const updateIndicator = React.useCallback(() => {
      if (tabsListRef.current && currentValue) {
        const activeTab = tabTriggerRefs.current.get(currentValue);
        if (activeTab) {
          const tabRect = activeTab.getBoundingClientRect();
          const listRect = tabsListRef.current.getBoundingClientRect();
          if (tabRect.width > 0 && listRect.width > 0) {
            setIndicatorStyle({
              left: `${tabRect.left - listRect.left}px`,
              width: `${tabRect.width}px`,
              height: `${tabRect.height}px`,
              top: `${tabRect.top - listRect.top}px`,
            });
          }
        }
      }
    }, [currentValue]);

    const scheduleUpdateIndicator = React.useCallback(() => {
      requestAnimationFrame(() => {
        updateIndicator();
      });
    }, [updateIndicator]);

    React.useEffect(() => {
      setMounted(true);
      scheduleUpdateIndicator();
      window.addEventListener("resize", scheduleUpdateIndicator);
      return () => window.removeEventListener("resize", scheduleUpdateIndicator);
    }, [scheduleUpdateIndicator]);

    const handleValueChange = React.useCallback(
      (newValue: string) => {
        if (!controlled) setInternalValue(newValue);
        onValueChange?.(newValue);
      },
      [controlled, onValueChange]
    );

    return (
      <TabsContext.Provider
        value={{
          value: currentValue,
          onValueChange: handleValueChange,
          updateIndicator,
          scheduleUpdateIndicator,
          indicatorStyle,
          mounted,
          registerTabTrigger,
          registerTabsList,
        }}
      >
        <div ref={ref} className={cn("w-full", className)} {...props}>
          {children}
        </div>
      </TabsContext.Provider>
    );
  }
);
Tabs.displayName = "Tabs";

const TabsList = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { indicatorStyle, registerTabsList, mounted } = React.useContext(TabsContext);

    return (
      <div
        ref={(el) => {
          if (typeof ref === "function") ref(el);
          else if (ref) ref.current = el;
          registerTabsList(el);
        }}
        className={cn(
          "relative inline-flex items-center justify-center rounded-xl bg-slate-950 p-1 border border-slate-800/90 text-slate-400 font-mono",
          className
        )}
        {...props}
      >
        {mounted && (
          <motion.div
            layout
            className="tabs-bg-indicator absolute rounded-lg bg-cyan-500 shadow-[0_0_18px_rgba(6,182,212,0.45)]"
            style={{
              ...indicatorStyle,
              position: "absolute",
              zIndex: 0,
            }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        )}
        {props.children}
      </div>
    );
  }
);
TabsList.displayName = "TabsList";

const TabsTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string }
>(({ className, value, ...props }, ref) => {
  const { value: selectedValue, onValueChange, registerTabTrigger, scheduleUpdateIndicator } =
    React.useContext(TabsContext);
  const isActive = selectedValue === value;
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);

  React.useEffect(() => {
    registerTabTrigger(value, triggerRef.current);
    return () => registerTabTrigger(value, null);
  }, [value, registerTabTrigger]);

  React.useEffect(() => {
    if (isActive) scheduleUpdateIndicator();
  }, [isActive, scheduleUpdateIndicator]);

  return (
    <button
      ref={(el) => {
        if (typeof ref === "function") ref(el);
        else if (ref) ref.current = el;
        triggerRef.current = el;
      }}
      type="button"
      role="tab"
      aria-selected={isActive}
      data-state={isActive ? "active" : "inactive"}
      data-value={value}
      className={cn(
        "relative z-10 inline-flex items-center justify-center whitespace-nowrap rounded-lg px-5 py-2.5 min-h-[40px] text-xs font-mono font-bold transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
        isActive
          ? "text-slate-950 font-black"
          : "text-slate-400 hover:text-slate-200",
        className
      )}
      onClick={(e) => {
        onValueChange(value);
        props.onClick?.(e);
      }}
      {...props}
    />
  );
});
TabsTrigger.displayName = "TabsTrigger";

const TabsContent = React.forwardRef<
  HTMLDivElement,
  { value: string } & React.ComponentPropsWithoutRef<"div">
>(({ className, value, ...props }, ref) => {
  const { value: selectedValue } = React.useContext(TabsContext);
  const isActive = selectedValue === value;

  if (!isActive) return null;

  return (
    <div
      ref={ref}
      role="tabpanel"
      tabIndex={0}
      className={cn("mt-4 focus-visible:outline-none", className)}
      {...props}
    />
  );
});
TabsContent.displayName = "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent };

import * as React from "react";
import { cn } from "@/lib/utils";

interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  noScroll?: boolean;
  dense?: boolean;
  hoverable?: boolean;
  striped?: boolean;
  bordered?: boolean;
  stickyHeader?: boolean;
}

const TableContext = React.createContext<{
  dense?: boolean;
  hoverable?: boolean;
  striped?: boolean;
  bordered?: boolean;
}>({});

const Table = React.forwardRef<HTMLTableElement, TableProps>(
  (
    {
      className,
      noScroll,
      dense = false,
      hoverable = true,
      striped = false,
      bordered = false,
      stickyHeader = false,
      children,
      ...props
    },
    ref
  ) => {
    const table = (
      <TableContext.Provider value={{ dense, hoverable, striped, bordered }}>
        <table
          ref={ref}
          className={cn(
            "w-full text-xs font-mono text-left border-collapse",
            bordered && "border border-slate-800",
            className
          )}
          {...props}
        >
          {children}
        </table>
      </TableContext.Provider>
    );

    if (noScroll) return table;

    return (
      <div
        className={cn(
          "relative w-full rounded-2xl border border-slate-800/80 bg-slate-950/80 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] overflow-hidden transition-all duration-300",
          bordered && "border-2"
        )}
      >
        <div
          className={cn(
            "w-full overflow-auto max-h-[calc(80vh-70px)]",
            stickyHeader && "relative"
          )}
        >
          {table}
        </div>
      </div>
    );
  }
);
Table.displayName = "Table";

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn(
      "sticky top-0 z-10 bg-slate-950/90 border-b border-slate-800 text-slate-400 font-mono text-xs uppercase",
      className
    )}
    {...props}
  />
));
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("divide-y divide-slate-800/60 font-mono", className)}
    {...props}
  />
));
TableBody.displayName = "TableBody";

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t border-slate-800 bg-slate-950/50 font-medium text-slate-400 font-mono",
      className
    )}
    {...props}
  />
));
TableFooter.displayName = "TableFooter";

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  selected?: boolean;
  clickable?: boolean;
}

const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, selected = false, clickable = false, ...props }, ref) => {
    const { hoverable, striped } = React.useContext(TableContext);

    return (
      <tr
        ref={ref}
        className={cn(
          "transition-colors",
          hoverable && "hover:bg-slate-900/60",
          striped && "even:bg-slate-900/30",
          selected && "bg-cyan-500/10 font-medium",
          clickable && "cursor-pointer",
          className
        )}
        {...props}
      />
    );
  }
);
TableRow.displayName = "TableRow";

interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  sortable?: boolean;
  sortDirection?: "asc" | "desc" | false;
  onSort?: () => void;
}

const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, sortable = false, sortDirection = false, onSort, children, ...props }, ref) => {
    const { dense } = React.useContext(TableContext);

    return (
      <th
        ref={ref}
        className={cn(
          "font-semibold text-slate-400 select-none",
          dense ? "px-3 py-2 text-xs" : "px-4 py-3.5 text-xs",
          sortable && "cursor-pointer hover:text-cyan-400 transition-colors",
          className
        )}
        onClick={sortable ? onSort : undefined}
        {...props}
      >
        <div className="flex items-center gap-1.5">{children}</div>
      </th>
    );
  }
);
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => {
  const { dense } = React.useContext(TableContext);

  return (
    <td
      ref={ref}
      className={cn(
        dense ? "px-3 py-2 text-xs" : "px-4 py-3.5 text-xs",
        "align-middle",
        className
      )}
      {...props}
    />
  );
});
TableCell.displayName = "TableCell";

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-xs text-slate-500 font-mono", className)}
    {...props}
  />
));
TableCaption.displayName = "TableCaption";

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};
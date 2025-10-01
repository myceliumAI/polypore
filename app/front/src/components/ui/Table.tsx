import { ReactNode } from "react";

type TableProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Table component with consistent styles.
 *
 * :param ReactNode children: Table content (thead, tbody)
 * :return JSX.Element: Styled table
 */
export function Table({ children, className = "" }: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table className={`w-full border-collapse text-sm ${className}`}>
        {children}
      </table>
    </div>
  );
}

type TableHeadProps = {
  children: ReactNode;
};

export function TableHead({ children }: TableHeadProps) {
  return (
    <thead className="bg-neutral-50 dark:bg-neutral-900/50 border-b border-neutral-200 dark:border-neutral-800">
      {children}
    </thead>
  );
}

type TableBodyProps = {
  children: ReactNode;
};

export function TableBody({ children }: TableBodyProps) {
  return (
    <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
      {children}
    </tbody>
  );
}

type TableRowProps = {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
};

export function TableRow({ children, className = "", onClick }: TableRowProps) {
  return (
    <tr
      className={`hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors ${onClick ? "cursor-pointer" : ""} ${className}`}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

type TableCellProps = {
  children: ReactNode;
  className?: string;
  header?: boolean;
};

export function TableCell({
  children,
  className = "",
  header = false,
}: TableCellProps) {
  const baseClasses = "px-4 py-3 text-left";
  const typeClasses = header
    ? "font-medium text-neutral-700 dark:text-neutral-300 text-xs uppercase tracking-wide"
    : "text-neutral-900 dark:text-neutral-100";

  if (header) {
    return (
      <th className={`${baseClasses} ${typeClasses} ${className}`}>
        {children}
      </th>
    );
  }

  return (
    <td className={`${baseClasses} ${typeClasses} ${className}`}>{children}</td>
  );
}

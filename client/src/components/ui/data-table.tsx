import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ReactNode, useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => ReactNode);
  cell?: (item: T) => ReactNode;
  enableSorting?: boolean;
}

interface Filter<T> {
  name: string;
  options: {
    label: string;
    value: string;
    filter: (item: T) => boolean;
  }[];
}

interface Action<T> {
  label: string;
  icon?: ReactNode;
  onClick: (item: T) => void;
  isDisabled?: (item: T) => boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  filters?: Filter<T>[];
  searchPlaceholder?: string;
  searchField?: (item: T) => string;
  actions?: Action<T>[];
  selectable?: boolean;
  onSelectionChange?: (selectedItems: T[]) => void;
  itemsPerPage?: number;
}

export function DataTable<T>({
  data,
  columns,
  filters = [],
  searchPlaceholder = "Rechercher...",
  searchField,
  actions = [],
  selectable = false,
  onSelectionChange,
  itemsPerPage = 10,
}: DataTableProps<T>) {
  const [currentFilters, setCurrentFilters] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItems, setSelectedItems] = useState<T[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T | null;
    direction: "asc" | "desc" | null;
  }>({
    key: null,
    direction: null,
  });

  // Apply filters and search
  const filteredData = data.filter((item) => {
    // Apply all active filters
    for (const [filterName, filterValue] of Object.entries(currentFilters)) {
      if (filterValue === "all") continue;

      const filter = filters.find((f) => f.name === filterName);
      if (!filter) continue;

      const option = filter.options.find((o) => o.value === filterValue);
      if (!option) continue;

      if (!option.filter(item)) return false;
    }

    // Apply search
    if (searchQuery && searchField) {
      const searchValue = searchField(item).toLowerCase();
      if (!searchValue.includes(searchQuery.toLowerCase())) return false;
    }

    return true;
  });

  // Apply sorting
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig.key || !sortConfig.direction) return 0;

    const aValue = (typeof columns.find(col => col.accessor === sortConfig.key)?.accessor === 'function')
      ? String(a[sortConfig.key])
      : String(a[sortConfig.key]);

    const bValue = (typeof columns.find(col => col.accessor === sortConfig.key)?.accessor === 'function')
      ? String(b[sortConfig.key])
      : String(b[sortConfig.key]);

    if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle sorting
  const handleSort = (column: Column<T>) => {
    if (typeof column.accessor === "function" || !column.enableSorting) return;

    let direction: "asc" | "desc" | null = "asc";

    if (sortConfig.key === column.accessor) {
      if (sortConfig.direction === "asc") direction = "desc";
      else if (sortConfig.direction === "desc") direction = null;
    }

    setSortConfig({
      key: direction ? column.accessor : null,
      direction,
    });
  };

  // Handle row selection
  const handleRowSelect = (item: T, isSelected: boolean) => {
    let newSelectedItems: T[];

    if (isSelected) {
      newSelectedItems = [...selectedItems, item];
    } else {
      newSelectedItems = selectedItems.filter((i) => i !== item);
    }

    setSelectedItems(newSelectedItems);
    if (onSelectionChange) onSelectionChange(newSelectedItems);
  };

  // Handle select all
  const handleSelectAll = (isSelected: boolean) => {
    const newSelectedItems = isSelected ? paginatedData : [];
    setSelectedItems(newSelectedItems);
    if (onSelectionChange) onSelectionChange(newSelectedItems);
  };

  // Check if an item is selected
  const isItemSelected = (item: T) => {
    return selectedItems.includes(item);
  };

  // Handle filter change
  const handleFilterChange = (filterName: string, value: string) => {
    setCurrentFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));

    // Reset to first page when filtering
    setCurrentPage(1);
  };

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);

    // Reset to first page when searching
    setCurrentPage(1);
  };

  return (
    <div className="bg-white rounded-lg border shadow-sm">
      {(filters.length > 0 || searchField) && (
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col md:flex-row gap-4">
          {filters.map((filter) => (
            <div key={filter.name} className="w-full md:w-64">
              <Select
                value={currentFilters[filter.name] || "all"}
                onValueChange={(value) => handleFilterChange(filter.name, value)}
              >
                <SelectTrigger id={`filter-${filter.name}`}>
                  <SelectValue placeholder={filter.name} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  {filter.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}

          {searchField && (
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          )}
        </div>
      )}

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {selectable && (
                <TableHead className="w-10">
                  <Checkbox
                    checked={
                      paginatedData.length > 0 &&
                      paginatedData.every((item) => isItemSelected(item))
                    }
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all"
                  />
                </TableHead>
              )}

              {columns.map((column, index) => (
                <TableHead
                  key={index}
                  className={column.enableSorting ? "cursor-pointer" : ""}
                  onClick={() => column.enableSorting && handleSort(column)}
                >
                  <div className="flex items-center">
                    {column.header}
                    {column.enableSorting && sortConfig.key === column.accessor && (
                      <span className="ml-1">
                        {sortConfig.direction === "asc" ? "▲" : "▼"}
                      </span>
                    )}
                  </div>
                </TableHead>
              ))}

              {actions.length > 0 && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={
                    columns.length + (selectable ? 1 : 0) + (actions.length > 0 ? 1 : 0)
                  }
                  className="text-center py-6"
                >
                  Aucune donnée disponible
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((item, rowIndex) => (
                <TableRow key={rowIndex}>
                  {selectable && (
                    <TableCell>
                      <Checkbox
                        checked={isItemSelected(item)}
                        onCheckedChange={(checked) =>
                          handleRowSelect(item, checked as boolean)
                        }
                        aria-label="Select row"
                      />
                    </TableCell>
                  )}

                  {columns.map((column, colIndex) => (
                    <TableCell key={colIndex}>
                      {column.cell
                        ? column.cell(item)
                        : typeof column.accessor === "function"
                        ? column.accessor(item)
                        : String(item[column.accessor] || "")}
                    </TableCell>
                  ))}

                  {actions.length > 0 && (
                    <TableCell>
                      <div className="flex space-x-2">
                        {actions.map((action, actionIndex) => {
                          const isDisabled =
                            action.isDisabled && action.isDisabled(item);

                          return (
                            <Button
                              key={actionIndex}
                              size="sm"
                              variant="ghost"
                              className={`p-1 ${
                                isDisabled
                                  ? "text-gray-400 cursor-not-allowed"
                                  : "text-primary hover:text-primary-dark"
                              }`}
                              disabled={isDisabled}
                              onClick={() => !isDisabled && action.onClick(item)}
                              title={action.label}
                            >
                              {action.icon}
                            </Button>
                          );
                        })}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Affichage de{" "}
                <span className="font-medium">
                  {(currentPage - 1) * itemsPerPage + 1}
                </span>{" "}
                à{" "}
                <span className="font-medium">
                  {Math.min(currentPage * itemsPerPage, sortedData.length)}
                </span>{" "}
                sur <span className="font-medium">{sortedData.length}</span>{" "}
                résultats
              </p>
            </div>

            <div>
              <nav
                className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                aria-label="Pagination"
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-l-md"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <span className="sr-only">Précédent</span>
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                {Array.from({ length: Math.min(5, totalPages) }).map(
                  (_, index) => {
                    // Display up to 5 pages, centered around current page
                    let pageNum = currentPage;
                    if (currentPage <= 3) {
                      pageNum = index + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + index;
                    } else {
                      pageNum = currentPage - 2 + index;
                    }

                    if (pageNum <= 0 || pageNum > totalPages) return null;

                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        className={`${
                          currentPage === pageNum
                            ? "bg-primary text-primary-foreground"
                            : ""
                        }`}
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  }
                )}

                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-r-md"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                >
                  <span className="sr-only">Suivant</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

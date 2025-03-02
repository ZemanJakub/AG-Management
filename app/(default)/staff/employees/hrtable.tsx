"use client";

import type { Selection, SortDescriptor } from "@heroui/react";
import type { StatusOptions } from "./data";
import type { Key } from "@react-types/shared";
import Image from "next/image";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  Chip,
  Pagination,
  Divider,
  Tooltip,
  useButton,
} from "@heroui/react";
import { SearchIcon } from "@heroui/shared-icons";
import React, { useMemo, useRef, useCallback, useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { cn } from "@heroui/react";

import { CopyText } from "./copy-text";
import { EyeFilledIcon } from "./eye";
import { EditLinearIcon } from "./edit";
import { DeleteFilledIcon } from "./delete";
import { ArrowDownIcon } from "./arrow-down";
import { ArrowUpIcon } from "./arrow-up";

import { useMemoizedCallback } from "./use-memoized-callback";
import { Status } from "./Status";
import ConfirmationModal from "./confirmation-modal";
import { deleteBasicEmployeeData } from "@/queries/employees";
import { toast } from "react-toastify";

interface ComponentProps {
  mutate: () => Promise<any>;
  employeesData: Record<string, any>[];
  records?: number;
  columns: {
    name: string;
    uid: string;
    info?: string;
    sortDirection?: string;
  }[];
}
interface DeleteBasicEmployeeDataProps {
  id: string;
  folderId: string;
}

export default function HrTable({
  columns,
  employeesData,
  records,
  mutate,
}: ComponentProps) {
  // Lokální stav pro data, který se aktualizuje při změně prop
  const [users, setUsers] = useState(employeesData);
  useEffect(() => {
    setUsers(employeesData);
  }, [employeesData]);
  useEffect(() => {
    document.querySelectorAll('[inert=""]').forEach((el) => {
      el.removeAttribute("inert");
    });
  }, []);
  // Ostatní stavy
  const [filterValue, setFilterValue] = useState("");
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set([]));
  const [visibleColumns, setVisibleColumns] = useState<Selection>("all");
  const [rowsPerPage, setRowsPerPage] = useState(records ?? 10);
  const [page, setPage] = useState(1);
  const [openModal, setOpenModal] = useState(false);
  const [confirmation, setConfirmed] = useState(false);
  const [confirmationData, setConfirmationData] = useState<DeleteBasicEmployeeDataProps[]>([]);

  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "employeeCard",
    direction: "ascending",
  });

  // Revalidace potvrzení – po potvrzení smazání se zavolá mutate
  useEffect(() => {
   
    if (confirmation) {
      toast.info("Mazání záznamu", { autoClose: 5000 });
      Promise.all(confirmationData.map((item) => deleteBasicEmployeeData(item)))
        .then(() => {
          mutate();
          setOpenModal(false);
          setConfirmed(false);
          toast.dismiss();
          toast.success("Data úspěšně smazána", { autoClose: 3000 });
        })
        .catch((err) => {
          console.error("Deletion error:", err);
          toast.error("Data se nepodařilo smazat",{ autoClose: 5000 });
        });
    }
  }, [confirmation, confirmationData, mutate]);

  // Funkce pro zploštění hodnoty
  const flattenValue = useCallback((value: any): string => {
    if (value === null || value === undefined) return "";
    if (typeof value === "string" || typeof value === "number") return value.toString();
    if (typeof value === "object") {
      return Object.values(value).map(flattenValue).join(" ");
    }
    return "";
  }, []);

  // Výpočet viditelných sloupců
  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return columns;
    return columns
      .map((item) => {
        if (item.uid === sortDescriptor.column) {
          return { ...item, sortDirection: sortDescriptor.direction };
        }
        return item;
      })
      .filter(
        (column) =>
          column.uid === "actions" ||
          Array.from(visibleColumns).includes(column.uid)
      );
  }, [visibleColumns, sortDescriptor, columns]);

  // Filtrace položek
  const itemFilter = useCallback(
    (user: Record<string, any>) => {
      if (!filterValue) return true;
      const searchText = filterValue.toLowerCase();
      // Projdeme všechny klíče – případně lze filtrovat jen podle definovaných sloupců
      for (const key in user) {
        if (Object.prototype.hasOwnProperty.call(user, key)) {
          const text = flattenValue(user[key]).toLowerCase();
          if (text.includes(searchText)) return true;
        }
      }
      return false;
    },
    [filterValue, flattenValue]
  );

  // Kontrola, zda je řádek kompletní (ignoruje klíč "actions")
  const isRowComplete = useCallback(
    (user: Record<string, any>): boolean => {
      return columns.every(({ uid }) => {
        if (uid === "actions") return true;
        const valueStr = flattenValue(user[uid]).trim();
        return valueStr !== "" && valueStr !== "NaN";
      });
    },
    [columns, flattenValue]
  );

  // Odvození dat: filtrování, řazení, stránkování
  const filteredItems = useMemo(() => users.filter(itemFilter), [users, itemFilter]);
  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      const key = sortDescriptor.column;
      const aItem = a[key];
      const bItem = b[key];
      const aValue =
        aItem && typeof aItem === "object" && aItem !== null && "secondName" in aItem
          ? aItem.secondName.toString().toLowerCase()
          : (aItem ?? "").toString().toLowerCase();
      const bValue =
        bItem && typeof bItem === "object" && bItem !== null && "secondName" in bItem
          ? bItem.secondName.toString().toLowerCase()
          : (bItem ?? "").toString().toLowerCase();
      if (aValue < bValue) return sortDescriptor.direction === "ascending" ? -1 : 1;
      if (aValue > bValue) return sortDescriptor.direction === "ascending" ? 1 : -1;
      return 0;
    });
  }, [filteredItems, sortDescriptor]);
  const pages = useMemo(() => Math.ceil(sortedItems.length / rowsPerPage) || 1, [sortedItems, rowsPerPage]);
  const totalRecords = sortedItems.length;
  const paginatedItems = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return sortedItems.slice(start, start + rowsPerPage);
  }, [sortedItems, page, rowsPerPage]);

  // Aktualizace selectedKeys – odstraníme neplatné klíče
  useEffect(() => {
    const updatedKeys = new Set<string>();
    filteredItems.forEach((item) => {
      const key = String(item.employeeCard.id);
      if ((selectedKeys as Set<string>).has(key)) {
        updatedKeys.add(key);
      }
    });
    setSelectedKeys(updatedKeys);
  }, [filteredItems]);

  // Aktualizace confirmationData – přesunuto ze useMemo do useEffect (side-effect)
  useEffect(() => {
    if (selectedKeys !== "all") {
      const newConfirmationData: DeleteBasicEmployeeDataProps[] = [];
      (selectedKeys as Set<string>).forEach((stringId) => {
        const item = filteredItems.find(
          (item) => String(item.employeeCard.id) === stringId
        );
        if (item) {
          newConfirmationData.push({
            id: item.employeeCard.id || "",
            folderId: item.folderId || "",
          });
        }
      });
      setConfirmationData(newConfirmationData);
    }
  }, [selectedKeys, filteredItems]);

  // Button refs
  const eyesRef = useRef<HTMLButtonElement | null>(null);
  const editRef = useRef<HTMLButtonElement | null>(null);
  const deleteRef = useRef<HTMLButtonElement | null>(null);
  const { getButtonProps: getEyesProps } = useButton({ ref: eyesRef });
  const { getButtonProps: getEditProps } = useButton({ ref: editRef });
  const { getButtonProps: getDeleteProps } = useButton({ ref: deleteRef });

  const getMemberInfoProps = useMemoizedCallback(() => ({
    onClick: handleMemberClick,
  }));
  const getcreatedDateInfoProps = useMemoizedCallback(() => ({
    onClick: handleCreatedDateClick,
  }));

  const handleEdit = useCallback((userId: string) => {
    console.log("edit", userId);
  }, []);

  const handleDelete = useCallback(({ folderId, id }: DeleteBasicEmployeeDataProps) => {
    if (folderId && id) {
      setConfirmationData([{ folderId, id }]);
      setOpenModal(true);
    }
  }, []);

  const handleDeleteMany = useCallback(() => {
    setOpenModal(true);
  }, []);

  const handleCheck = useCallback((userId: string) => {
    console.log("check", userId);
  }, []);

  const renderCell = useMemoizedCallback((user, allowedKeys) => {
    const userKey = allowedKeys;
    const cellValue = user[userKey] as string;

    switch (userKey) {
      case "phone":
        return cellValue.length > 0 ? <CopyText>{cellValue}</CopyText> : null;
      case "acount":
        return cellValue.length > 0 ? <CopyText>{cellValue}</CopyText> : null;
      case "employeeCard": {
        const complete = isRowComplete(user);
        return (
          <div className="flex items-center gap-4">
            <div
              className={`relative w-12 h-12 rounded-xl ${
                complete ? "border-2 border-green-500" : "border-2 border-red-500"
              }`}
            >
              <Image
                src={user.employeeCard.photo}
                alt={`${user.employeeCard.firstName} ${user.employeeCard.secondName}`}
                className="rounded-lg"
                width={48}
                height={48}
              />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold">
                {user.employeeCard.secondName} {user.employeeCard.firstName}
              </span>
              <span className="text-sm">{user.employeeCard.email}</span>
            </div>
          </div>
        );
      }
      case "bDate": {
        const dateObject = new Date(cellValue);
        if (!cellValue) {
          console.log("Neplatné datum:", cellValue);
          return (
            <div className="flex items-center gap-1">
              <Icon className="h-[16px] w-[16px] text-red-500" icon="solar:calendar-minimalistic-linear" />
              <p className="text-nowrap text-small capitalize text-red-500">Neplatné datum</p>
            </div>
          );
        }
        return (
          <div className="flex items-center gap-1">
            <Icon className="h-[16px] w-[16px]" icon="solar:calendar-minimalistic-linear" />
            <p className="pl-1 text-nowrap text-small capitalize">
              {new Intl.DateTimeFormat("cs-CZ", { month: "long", day: "numeric", year: "numeric" }).format(dateObject)}
            </p>
          </div>
        );
      }
      case "date_created": {
        const createdateObject = new Date(cellValue);
        if (!cellValue) {
          console.log("Neplatné datum:", cellValue);
          return (
            <div className="flex items-center gap-1">
              <Icon className="h-[16px] w-[16px] text-red-500" icon="solar:calendar-minimalistic-linear" />
              <p className="text-nowrap text-small capitalize text-red-500">Neplatné datum</p>
            </div>
          );
        }
        return (
          <div className="flex items-center gap-1">
            <Icon className="h-[16px] w-[16px]" icon="solar:calendar-minimalistic-linear" />
            <p className="pl-1 text-nowrap text-small capitalize">
              {new Intl.DateTimeFormat("cs-CZ", { month: "long", day: "numeric", year: "numeric" }).format(createdateObject)}
            </p>
          </div>
        );
      }
      case "country":
        return (
          <div className="flex items-center gap-2">
            <div className="h-[16px] w-[16px]">{user.country.icon}</div>
            <p className="text-nowrap text-small text-default-foreground">{user.country.name}</p>
          </div>
        );
      case "role":
        return <div className="text-nowrap text-small capitalize text-default-foreground">{cellValue}</div>;
      case "workerType":
        return <div className="text-default-foreground">{cellValue}</div>;
      case "status":
        return <Status className="max-w-[60px]" status={cellValue as StatusOptions} />;
      case "actions":
        return (
          <div className="flex items-center justify-center gap-2">
            <EyeFilledIcon
              {...getEyesProps()}
              className="cursor-pointer text-default-400"
              height={18}
              width={18}
              onClick={() => handleCheck(user.employeeCard.id)}
            />
            <EditLinearIcon
              {...getEditProps()}
              className="cursor-pointer text-default-400"
              height={18}
              width={18}
              onClick={() => handleEdit(user.employeeCard.id)}
            />
            <DeleteFilledIcon
              {...getDeleteProps()}
              className="cursor-pointer text-default-400"
              height={18}
              width={18}
              onClick={() =>
                handleDelete({ folderId: user.folderId, id: user.employeeCard.id })
              }
            />
          </div>
        );
      default:
        return cellValue;
    }
  });

  const onNextPage = useMemoizedCallback(() => {
    if (page < pages) setPage(page + 1);
  });

  const onPreviousPage = useMemoizedCallback(() => {
    if (page > 1) setPage(page - 1);
  });

  const onSearchChange = useMemoizedCallback((value?: string) => {
    setFilterValue(value || "");
    setPage(1);
  });

  const onSelectionChange = useMemoizedCallback((keys: Selection) => {
    if (keys === "all") {
      setSelectedKeys("all");
      return;
    } else if (keys.size === 0) {
      setSelectedKeys(new Set<Key>());
    } else {
      const newSelection = new Set<Key>();
      (keys as Set<Key>).forEach((key) => newSelection.add(key));
      setSelectedKeys(newSelection);
    }
  });
  const filterSelectedKeys = useMemo(() => {
    if (selectedKeys === "all") {
      return selectedKeys;
    }
    let resultKeys = new Set<Key>();
    let newConfirmationData: DeleteBasicEmployeeDataProps[] = [];
    if (filterValue) {
      filteredItems.forEach((item) => {
        const stringId = String(item.employeeCard.id);
        if ((selectedKeys as Set<string>).has(stringId)) {
          resultKeys.add(stringId);
          newConfirmationData.push({
            id: item?.employeeCard?.id || "",
            folderId: item?.folderId || "",
          });
        }
      });
    } else {
      resultKeys = selectedKeys;
      (selectedKeys as Set<string>).forEach((stringId) => {
        const item = filteredItems.find(
          (item) => String(item.employeeCard.id) === stringId
        );
        if (item) {
          newConfirmationData.push({
            id: item?.employeeCard?.id || "",
            folderId: item?.folderId || "",
          });
        }
      });
    }
    setConfirmationData(newConfirmationData);
    return resultKeys;
  }, [selectedKeys, filteredItems, filterValue]);
  const topContent = useMemo(() => {
    return (
      <div className="flex items-center gap-4 overflow-auto  scrollbar-hidden px-[6px] py-[4px]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-4">
            <Input
              className="min-w-[200px]"
              classNames={{
                label: "text-white",
                innerWrapper: [
              
                  "focus:outline-none text-gray-800 dark:text-gray-100 rounded-md p-2",
                ],
                input: [
                  "border-none focus:ring-0 focus:outline-none text-gray-800 dark:text-gray-100 rounded-md p-2",
                ],
              }}
              endContent={<SearchIcon className="text-gray-500 dark:text-gray-300" width={16} />}
              placeholder="Hledej"
              size="sm"
              value={filterValue}
              onValueChange={onSearchChange}
            />
            <div>
              <Dropdown
                classNames={{
                  content: "p-0 border-small border-divider",
                }}
              >
                <DropdownTrigger>
                  <Button className=" text-gray-800 dark:text-gray-100" size="sm" startContent={<Icon className="text-gray-500 dark:text-gray-300" icon="solar:sort-linear" width={16} />}>
                    Řazení
                  </Button>
                </DropdownTrigger>
                <DropdownMenu aria-label="Sort" items={headerColumns.filter((c) => !["actions"].includes(c.uid))}>
                  {(item) => (
                    <DropdownItem
                      key={item.uid}
                      onPress={() => {
                        setSortDescriptor({
                          column: item.uid,
                          direction: sortDescriptor.direction === "ascending" ? "descending" : "ascending",
                        });
                      }}
                    >
                      {item.name}
                    </DropdownItem>
                  )}
                </DropdownMenu>
              </Dropdown>
            </div>
            <div>
              <Dropdown
                closeOnSelect={false}
                classNames={{
                  content: "p-0 border-small border-divider",
                }}
              >
                <DropdownTrigger>
                  <Button className=" text-gray-800 dark:text-gray-100" size="sm" startContent={<Icon className="text-gray-500 dark:text-gray-300" icon="solar:sort-horizontal-linear" width={16} />}>
                    Sloupce
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  disallowEmptySelection
                  aria-label="Columns"
                  items={columns.filter((c) => !["actions"].includes(c.uid))}
                  selectedKeys={visibleColumns}
                  selectionMode="multiple"
                  onSelectionChange={setVisibleColumns}
                >
                  {(item) => <DropdownItem key={item.uid}>{item.name}</DropdownItem>}
                </DropdownMenu>
              </Dropdown>
            </div>
          </div>
          <Divider className="h-5 border-gray-200 dark:border-gray-700" orientation="vertical" />
          <div className="whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
            {filterSelectedKeys === "all" ? "Vybráno vše" : `${filterSelectedKeys.size} Vybráno`}
          </div>
          {(filterSelectedKeys === "all" || filterSelectedKeys.size > 0) && (
            <Dropdown
              classNames={{
                content: "p-0 border-small border-divider",
              }}
            >
              <DropdownTrigger>
                <Button className="border-gray-200 dark:border-gray-700 text-default-800" endContent={<Icon className="text-default-400" icon="solar:alt-arrow-down-linear" />} size="sm" variant="flat">
                  Akce
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Selected Actions">
                <DropdownItem key="send-email">Send email</DropdownItem>
                <DropdownItem key="pay-invoices">Pay invoices</DropdownItem>
                <DropdownItem key="bulk-edit">Bulk edit</DropdownItem>
                <DropdownItem key="end-contract" onPress={handleDeleteMany}>Vymazat označené</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          )}
        </div>
      </div>
    );
  }, [filterValue, visibleColumns, filterSelectedKeys, headerColumns, sortDescriptor, onSearchChange, setVisibleColumns]);

  const topBar = useMemo(() => {
    return (
      <div className="mb-[18px] flex items-center justify-between">
        <div className="flex w-full max-w-[300px] items-center gap-2">
          <h1 className="text-2xl font-[700] leading-[32px] truncate">Přijímací proces</h1>
          <Chip className="hidden items-center text-default-500 sm:flex" size="sm" variant="flat">
            {users.length}
          </Chip>
        </div>
        <Button color="secondary" endContent={<Icon icon="solar:add-circle-bold" width={20} />}>
          <span className="hidden md:inline">Nový zaměstnanec</span>
        </Button>
      </div>
    );
  }, [users]);

  const bottomContent = useMemo(() => {
    return (
      <div className="flex flex-col items-center justify-between gap-2 px-2 py-2 sm:flex-row">
        <Pagination
          isCompact
          showControls
          page={page}
          total={pages}
          onChange={setPage}
          classNames={{
            wrapper: " border border-divider",
            item: " bg-transparent ",
            prev: "bg-transparent",
            next: "bg-transparent",
            cursor: "bg-gradient-to-b from-secondary-300 to-secondary-600 dark:from-secondary-300 dark:to-secondary-100 text-white font-bold",
          }}
        />
        <div className="flex items-center justify-end gap-6 ">
          <span className="text-small text-default-400 ">
            {filterSelectedKeys === "all" ? "Vybráno vše" : `${filterSelectedKeys.size} z ${filteredItems.length} vybráno`}
          </span>
          <Dropdown
            classNames={{
              content: "p-0 border-small border-divider",
            }}
          >
            <DropdownTrigger>
              <Button size="sm" className=" hidden md:inline" variant="flat">
                Záznamů na stránku: {rowsPerPage === totalRecords ? "vše" : rowsPerPage}
              </Button>
            </DropdownTrigger>
            <DropdownMenu>
              {[
                { label: "10", value: 10 },
                { label: "20", value: 20 },
                { label: "50", value: 50 },
                { label: "Vše", value: totalRecords },
              ].map((option) => (
                <DropdownItem
                  key={option.value}
                  onPress={() => {
                    setRowsPerPage(option.value);
                    setPage(1);
                  }}
                >
                  {option.label}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
          <div className="items-center gap-3 hidden md:flex">
            <Button isDisabled={page === 1} size="sm" variant="flat" onPress={onPreviousPage}>Předchozí</Button>
            <Button isDisabled={page === pages} size="sm" variant="flat" onPress={onNextPage}>Následující</Button>
          </div>
        </div>
      </div>
    );
  }, [filterSelectedKeys, page, pages, filteredItems.length, onPreviousPage, onNextPage]);

  const handleMemberClick = useMemoizedCallback(() => {
    setSortDescriptor({
      column: "employeeCard",
      direction: sortDescriptor.direction === "ascending" ? "descending" : "ascending",
    });
  });
  const handleCreatedDateClick = useMemoizedCallback(() => {
    setSortDescriptor({
      column: "date_created",
      direction: sortDescriptor.direction === "ascending" ? "descending" : "ascending",
    });
  });

  return (
    <div className="h-full w-full p-6">
      {topBar}
      <ConfirmationModal openModal={openModal} onConfirm={() => setConfirmed((prev) => !prev)} />
      <Table
        isHeaderSticky
        aria-label="Ttable with custom cells, pagination and sorting"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          tr: "border-b border-gray-100 dark:border-gray-700",
        }}
        selectedKeys={filterSelectedKeys}
        selectionMode="multiple"
        sortDescriptor={sortDescriptor}
        topContent={topContent}
        topContentPlacement="outside"
        onSelectionChange={onSelectionChange}
        onSortChange={setSortDescriptor}
        color="secondary"
      >
        <TableHeader columns={headerColumns}>
          {(column) => (
            <TableColumn
              key={column.uid}
              align={
                column.uid === "insurance"
                  ? "center"
                  : column.uid === "state"
                  ? "center"
                  : column.uid === "actions"
                  ? "center"
                  : "start"
              }
              className={cn([
                column.uid === "actions" ? "flex items-center justify-center px-[20px]" : "",
              ])}
            >
              {column.uid === "date_created" ? (
                <div {...getcreatedDateInfoProps()} className="flex w-full cursor-pointer items-center justify-between">
                  {column.name}
                  {column.sortDirection === "ascending" ? <ArrowUpIcon className="text-default-400" /> : <ArrowDownIcon className="text-default-400" />}
                </div>
              ) : column.uid === "employeeCard" ? (
                <div {...getMemberInfoProps()} className="flex w-full cursor-pointer items-center justify-between">
                  {column.name}
                  {column.sortDirection === "ascending" ? <ArrowUpIcon className="text-default-400" /> : <ArrowDownIcon className="text-default-400" />}
                </div>
              ) : column.info ? (
                <div className="flex min-w-[108px] items-center justify-between">
                  {column.name}
                  <Tooltip content={column.info}>
                    <Icon className="text-default-300" height={16} icon="solar:info-circle-linear" width={16} />
                  </Tooltip>
                </div>
              ) : (
                column.name
              )}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody emptyContent={"No users found"} items={paginatedItems}>
          {(item) => (
            <TableRow key={item.employeeCard.id}>
              {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

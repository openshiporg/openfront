import { useEffect, useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  ColumnDef,
  flexRender,
} from "@tanstack/react-table";
import { AdminLink } from "@keystone/components/AdminLink";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../primitives/default/ui/table";
import { useList } from "@keystone/keystoneProvider";
import { getRootGraphQLFieldsFromFieldController } from "@keystone-6/core/admin-ui/utils";
import { Checkbox, CheckboxControl } from "@keystone/components/Checkbox";
import { useSearchParams } from "next/navigation";
import { Input } from "../../primitives/default/ui/input";
import { SortDirectionArrow } from "@keystone/themes/KeystoneUI/components/SortDirectionArrow";

export function ListTable({
  selectedFields,
  listKey,
  itemsGetter,
  count,
  sort,
  currentPage,
  pageSize,
  selectedItems,
  onSelectedItemsChange,
  orderableFields,
}) {
  const list = useList(listKey);

  const [data, setData] = useState(() => [...(itemsGetter.data ?? [])]);

  const searchParams = useSearchParams();
  const query = {};
  for (let [key, value] of searchParams.entries()) {
    query[key] = value;
  }

  useEffect(() => {
    setData([...(itemsGetter.data ?? [])]);
  }, [itemsGetter.data]);

  const [sorting, setSorting] = useState(() =>
    sort ? [{ id: sort.field, desc: sort.direction === "DESC" }] : []
  );
  const [rowSelection, setRowSelection] = useState(() => {
    const initialSelection = {};
    selectedItems.forEach((item) => {
      initialSelection[item] = true;
    });
    return initialSelection;
  });

  const columns = useMemo(() => {
    const checkboxColumn = {
      id: "selection",
      header: () => (
        <CheckboxControl
          size="small"
          checked={selectedItems.size === itemsGetter.data?.length}
          className="cursor-default"
          onChange={() => {
            console.log("fuckkkk");
            const newSelectedItems = new Set();
            if (selectedItems.size !== itemsGetter.data?.length) {
              itemsGetter.data?.forEach((item) => {
                if (item !== null && item.id !== null) {
                  newSelectedItems.add(item.id);
                }
              });
            }
            onSelectedItemsChange(newSelectedItems);
          }}
        />
      ),
      cell: ({ row }) => {
        const itemId = row.original.id;
        return (
          <CheckboxControl
            size="small"
            checked={selectedItems.has(itemId)}
            className="cursor-default"
            onChange={() => {
              console.log("Before change:", selectedItems);
              const newSelectedItems = new Set(selectedItems);
              if (selectedItems.has(itemId)) {
                newSelectedItems.delete(itemId);
              } else {
                newSelectedItems.add(itemId);
              }
              console.log("After changes:", newSelectedItems);
              onSelectedItemsChange(newSelectedItems);
            }}
          />
        );
      },
      size: 45,
    };

    const fieldsArray = Array.isArray(selectedFields)
      ? selectedFields
      : Array.from(selectedFields);
    const orderableFieldsArray = Array.isArray(orderableFields)
      ? orderableFields
      : Array.from(orderableFields);

    return [
      checkboxColumn,
      ...fieldsArray.map((fieldKey, i) => {
        const field = list.fields[fieldKey];
        const { Cell } = field.views;
        const isOrderable = orderableFieldsArray.includes(fieldKey);

        return {
          accessorKey: fieldKey,
          header: () => (
            <AdminLink
              href={{
                query: {
                  ...query,
                  sortBy:
                    sort?.field === fieldKey && sort.direction === "ASC"
                      ? `-${fieldKey}`
                      : fieldKey,
                },
              }}
            >
              {field.label}
              {/* Render sort direction arrow if this field is currently sorted */}
              {query.sortBy === fieldKey && (
                <SortDirectionArrow direction="ASC" />
              )}
              {query.sortBy === `-${fieldKey}` && (
                <SortDirectionArrow direction="DESC" />
              )}
            </AdminLink>
          ),
          cell: ({ row }) => {
            const item = row.original;
            const itemId = item.id;
            const itemForField = {};

            // Get the data for the fields from the item
            for (const graphqlField of getRootGraphQLFieldsFromFieldController(
              field.controller
            )) {
              if (
                item[graphqlField] === null ||
                item[graphqlField] === undefined
              ) {
                // Return an error message if there is an issue with the data
                return (
                  <div className="flex">
                    <div className="font-mono text-xs rounded-sm px-2 py-1 border-dashed border italic">
                      null
                    </div>
                  </div>
                );
              }
              itemForField[graphqlField] = item[graphqlField];
            }

            // The following assumes that the item id is available on the row.original object
            // Now, render the Cell as you would in your original code
            return (
              <Cell
                field={field.controller}
                item={itemForField}
                linkTo={
                  i === 0 && Cell.supportsLinkTo
                    ? {
                        href: `/${list.path}/${encodeURIComponent(itemId)}`,
                      }
                    : undefined
                }
              />
            );
          },
          sortingFn: isOrderable ? "auto" : undefined,
        };
      }),
    ];
  }, [selectedItems, selectedFields, list.fields, orderableFields]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      rowSelection,
    },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    manualPagination: true, // You handle pagination on your own
    manualSorting: true, // You handle sorting on your own
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="w-full">
      <div className="rounded-md border">
        {/* Table UI */}
        <Table className="shadow-md">
          <TableHeader className="bg-muted">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {/* Pagination UI */}
        {/* ... */}
      </div>
    </div>
  );
}

export default ListTable;

// import { Box, VisuallyHidden } from "@keystone-ui/core";
// import { CheckboxControl } from "@keystone-ui/fields";
// import { ArrowRightCircleIcon } from "@keystone-ui/icons/icons/ArrowRightCircleIcon";
// import { AdminLink } from "@keystone/components/AdminLink";

// import { useRouter, useSearchParams } from "next/navigation";

// import { getRootGraphQLFieldsFromFieldController } from "@keystone-6/core/admin-ui/utils";
// import { CellLink } from "@keystone/components/CellLink";
// import { Pagination } from "@keystone/components/Pagination";

// import { SortDirectionArrow } from "@keystone/components/SortDirectionArrow";
// import { TableBodyCell } from "@keystone/components/TableBodyCell";
// import { TableContainer } from "@keystone/components/TableContainer";
// import { TableHeaderCell } from "@keystone/components/TableHeaderCell";
// import { TableHeaderRow } from "@keystone/components/TableHeaderRow";
// import { useList } from "@keystone/keystoneProvider";

// export function ListTable({
//   selectedFields,
//   listKey,
//   itemsGetter,
//   count,
//   sort,
//   currentPage,
//   pageSize,
//   selectedItems,
//   onSelectedItemsChange,
//   orderableFields,
// }) {
//   const list = useList(listKey);
//   // const { query } = useRouter();
//   const searchParams = useSearchParams();
//   const query = {};
//   for (let [key, value] of searchParams.entries()) {
//     query[key] = value;
//   }
//   const shouldShowLinkIcon =
//     !list.fields[selectedFields.keys().next().value].views.Cell.supportsLinkTo;
//   return (
//     <Box paddingBottom="xlarge">
//       <TableContainer>
//         <VisuallyHidden as="caption">{list.label} list</VisuallyHidden>
//         <colgroup>
//           <col width="30" />
//           {shouldShowLinkIcon && <col width="30" />}
//           {[...selectedFields].map((path) => (
//             <col key={path} />
//           ))}
//         </colgroup>
//         <TableHeaderRow>
//           <TableHeaderCell className="pl-0 border-b-2">
//             <label className="flex items-center justify-start cursor-pointer">
//               <CheckboxControl
//                 size="small"
//                 checked={selectedItems.size === itemsGetter.data?.length}
//                 className="cursor-default"
//                 onChange={() => {
//                   const newSelectedItems = new Set();
//                   if (selectedItems.size !== itemsGetter.data?.length) {
//                     itemsGetter.data?.forEach((item) => {
//                       if (item !== null && item.id !== null) {
//                         newSelectedItems.add(item.id);
//                       }
//                     });
//                   }
//                   onSelectedItemsChange(newSelectedItems);
//                 }}
//               />
//             </label>
//           </TableHeaderCell>
//           {shouldShowLinkIcon && <TableHeaderCell />}
//           {[...selectedFields].map((path) => {
//             const label = list.fields[path].label;
//             if (!orderableFields.has(path)) {
//               return <TableHeaderCell key={path}>{label}</TableHeaderCell>;
//             }
//             return (
//               <TableHeaderCell key={path}>
//                 <AdminLink
//                   className="block no-underline text-inherit hover:text-inherit"
//                   href={{
//                     query: {
//                       ...query,
//                       sortBy:
//                         sort?.field === path && sort.direction === "ASC"
//                           ? `-${path}`
//                           : path,
//                     },
//                   }}
//                 >
//                   {label}
//                   {sort?.field === path && (
//                     <SortDirectionArrow direction={sort.direction} />
//                   )}
//                 </AdminLink>
//               </TableHeaderCell>
//             );
//           })}
//         </TableHeaderRow>
//         <tbody>
//           {(itemsGetter.data ?? []).map((_, index) => {
//             const itemGetter = itemsGetter.get(index);
//             if (itemGetter.data === null || itemGetter.data.id === null) {
//               if (itemGetter.errors) {
//                 return (
//                   <tr className="text-red-500" key={`index:${index}`}>
//                     {itemGetter.errors[0].message}
//                   </tr>
//                 );
//               }
//               return null;
//             }
//             const itemId = itemGetter.data.id;
//             return (
//               <tr key={itemId || `index:${index}`}>
//                 <TableBodyCell>
//                   <label
//                     className="flex items-center justify-start"
//                     style={{ minHeight: "38px" }}
//                   >
//                     <CheckboxControl
//                       size="small"
//                       checked={selectedItems.has(itemId)}
//                       className="cursor-default"
//                       onChange={() => {
//                         const newSelectedItems = new Set(selectedItems);
//                         if (selectedItems.has(itemId)) {
//                           newSelectedItems.delete(itemId);
//                         } else {
//                           newSelectedItems.add(itemId);
//                         }
//                         onSelectedItemsChange(newSelectedItems);
//                       }}
//                     />
//                   </label>
//                 </TableBodyCell>
//                 {shouldShowLinkIcon && (
//                   <TableBodyCell>
//                     <AdminLink
//                       className="no-underline flex items-center justify-center"
//                       style={{ minHeight: "38px" }}
//                       href={`/${list.path}/[id]`}
//                       as={`/${list.path}/${encodeURIComponent(itemId)}`}
//                     >
//                       <ArrowRightCircleIcon
//                         size="smallish"
//                         aria-label="Go to item"
//                       />
//                     </AdminLink>
//                   </TableBodyCell>
//                 )}
//                 {[...selectedFields].map((path, i) => {
//                   const field = list.fields[path];
//                   let { Cell } = list.fields[path].views;
//                   const itemForField = {};
//                   for (const graphqlField of getRootGraphQLFieldsFromFieldController(
//                     field.controller
//                   )) {
//                     const fieldGetter = itemGetter.get(graphqlField);
//                     if (fieldGetter.errors) {
//                       const errorMessage = fieldGetter.errors[0].message;
//                       return (
//                         <TableBodyCell className="text-red-500" key={path}>
//                           {i === 0 && Cell.supportsLinkTo ? (
//                             <CellLink
//                               href={`/${list.path}/[id]`}
//                               as={`/${list.path}/${encodeURIComponent(itemId)}`}
//                             >
//                               {errorMessage}
//                             </CellLink>
//                           ) : (
//                             errorMessage
//                           )}
//                         </TableBodyCell>
//                       );
//                     }
//                     itemForField[graphqlField] = fieldGetter.data;
//                   }

//                   return (
//                     <TableBodyCell key={path}>
//                       <Cell
//                         field={field.controller}
//                         item={itemForField}
//                         linkTo={
//                           i === 0 && Cell.supportsLinkTo
//                             ? {
//                                 href: `/${list.path}/${encodeURIComponent(
//                                   itemId
//                                 )}`,
//                                 // as: `/${list.path}/${encodeURIComponent(
//                                 //   itemId
//                                 // )}`,
//                               }
//                             : undefined
//                         }
//                       />
//                     </TableBodyCell>
//                   );
//                 })}
//               </tr>
//             );
//           })}
//         </tbody>
//       </TableContainer>
//       <Pagination
//         list={list}
//         total={count}
//         currentPage={currentPage}
//         pageSize={pageSize}
//       />
//     </Box>
//   );
// }

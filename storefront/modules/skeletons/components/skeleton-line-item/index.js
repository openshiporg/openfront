"use client";
import { Table, clx } from "@medusajs/ui"

const SkeletonLineItem = ({ type = "full" }) => {
  return (
    <Table.Row className="w-full">
      <Table.Cell className="!pl-0 p-4 w-24">
        <div className={clx("flex bg-gray-200 animate-pulse", {
          "w-16": type === "preview",
          "small:w-24 w-12": type === "full",
        })} style={{ aspectRatio: "1" }} />
      </Table.Cell>
      <Table.Cell className="text-left">
        <div className="flex flex-col gap-y-2">
          <div className="w-32 h-4 bg-gray-200 animate-pulse" />
          <div className="w-24 h-4 bg-gray-200 animate-pulse" />
        </div>
      </Table.Cell>
      {type === "full" && (
        <Table.Cell>
          <div className="flex gap-2 items-center w-28">
            <div className="w-6 h-8 bg-gray-200 animate-pulse" />
            <div className="w-14 h-10 bg-gray-200 animate-pulse" />
          </div>
        </Table.Cell>
      )}
      {type === "full" && (
        <Table.Cell className="hidden small:table-cell">
          <div className="flex gap-2">
            <div className="w-12 h-6 bg-gray-200 animate-pulse" />
          </div>
        </Table.Cell>
      )}
      <Table.Cell className="!pr-0">
        <span className={clx("!pr-0", {
          "flex flex-col items-end h-full justify-center": type === "preview",
        })}>
          {type === "preview" && (
            <span className="flex gap-x-1">
              <div className="w-8 h-6 bg-gray-200 animate-pulse" />
              <div className="w-12 h-6 bg-gray-200 animate-pulse" />
            </span>
          )}
          <div className="w-12 h-6 bg-gray-200 animate-pulse" />
        </span>
      </Table.Cell>
    </Table.Row>
  )
}

export default SkeletonLineItem
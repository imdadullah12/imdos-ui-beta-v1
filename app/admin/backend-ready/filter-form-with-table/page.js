"use client";
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";
import { useImdosUI } from "@/providers/ImdosProvider";
import { AlertDanger } from "@/components/imdos/alert";

import DataTable from "@/components/imdos/data-table";
import FormModal from "@/components/imdos/form-modal";
import useSWR from "swr";
import toast from "react-hot-toast";
import RippleButton from "@/components/imdos/ripple-button";
import FilterForm from "@/components/imdos/filter-form";

export const categorySchema = z.object({
  name: z.string().refine((val) => val.length != 0, "Name is required"),
  priority: z.any().refine((val) => val.length != 0, "Priority is required"),
  logo: z.any().refine((val) => val.length != 0, "Logo is required"),
});

const prefix = {
  title: "Categories",
  description: "Select the item to manage the content",
  singular: "Category",
  uid: "categories",
  endpoint: "/api/imdos/categories/read",
  schema: categorySchema,
};

const Example = () => {
  const { formModal, setFormModal, setConfirmAlert, setLoading } = useImdosUI();
  const [tableData, setTableData] = useState(null);
  const [refValues, setRefValues] = useState(null);

  const mutate = async (data) => {
    try {
      const formData = new FormData();
      formData.append(
        "select",
        JSON.stringify(["id", "name", "priority", "logo", "created_at"])
      );

      formData.append(
        "conditions",
        JSON.stringify([
          {
            on: "priority",
            type: "=",
            value: data?.priority ?? refValues?.priority,
          },
        ])
      );

      const request = await fetch(prefix.endpoint, {
        method: "POST",
        body: formData,
      });

      const response = await request.json();
      if (!request.ok) {
        throw new Error(response.error);
      }

      setTableData(response.data);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const onSubmit = async (value) => {
    try {
      const formData = new FormData();
      Object.entries(value).forEach(([key, val]) => {
        formData.append(key, val);
      });

      formData.append("fileUpload", true);
      formData.append("fileDestination", "Categories");
      formData.append("fileValidation", ["jpg", "jpeg", "png"]);

      if (formModal?.data?.id) formData.append("refId", formModal?.data?.id);

      const endpoint = formModal?.data?.id
        ? `/api/imdos/${prefix.uid}/update`
        : `/api/imdos/${prefix.uid}/create`;
      const request = await fetch(endpoint, { method: "POST", body: formData });

      const response = await request.json();

      if (!request.ok) {
        throw new Error(response.error);
      }
      setConfirmAlert("");
      setFormModal({ show: false });
      mutate();
      toast.success(response.message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const onFilterSubmit = async (data) => {
    setRefValues(data);
    mutate(data);
  };

  const columns = [
    {
      id: "serial",
      header: "#",
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => row.index + 1,
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div>
          <p>{row.getValue("name")}</p>
        </div>
      ),
    },
    {
      accessorKey: "priority",
      header: "Priority",
      cell: ({ row }) => (
        <div>
          <p>{row.getValue("priority")}</p>
        </div>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Created At",
      cell: ({ row }) => (
        <div className="whitespace-normal">{row.getValue("created_at")}</div>
      ),
    },
    {
      id: "actions",
      header: "Action",
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => {
        return (
          <div className="flex gap-2">
            <RippleButton
              onClick={() => {
                setFormModal({ show: true, data: row.original });
              }}
              isIconOnly
              variant="flat"
            >
              <Edit size={18} />
            </RippleButton>
            <RippleButton
              onClick={() => {
                setConfirmAlert({
                  open: true,
                  refId: row.original.id,
                  data: row.original,
                  table: prefix.uid,
                  mutate: mutate,
                });
              }}
              color="danger"
              isIconOnly
              variant="flat"
            >
              <Trash size={18} />
            </RippleButton>
          </div>
        );
      },
    },
  ];

  const filterInputs = [
    {
      title: "Priority",
      type: "dropdown",
      uid: "priority",
      items: [
        {
          label: "0",
          value: "0",
        },
        {
          label: "1",
          value: "1",
        },
        {
          label: "2",
          value: "2",
        },
        {
          label: "3",
          value: "3",
        },
        {
          label: "4",
          value: "4",
        },
        {
          label: "5",
          value: "5",
        },
      ],
      showLoading: true,
      onChange: () => {},
    },
  ];

  const inputFields = [
    {
      title: "Category Name",
      type: "text",
      uid: "name",
      default: formModal?.data?.name ?? "",
    },
    {
      title: "Priority",
      type: "hidden",
      uid: "priority",
      default: refValues?.priority ?? "",
    },
    {
      title: "Logo",
      type: "file",
      uid: "logo",
      default: formModal?.data?.logo ?? "",
    },
  ];

  return (
    <>
      <Card className="bg-background dark:border full-card p-5">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-2 justify-between mb-3">
          <div className="text">
            <h1 className="text-lg font-semibold">Filter {prefix.title}</h1>
            <p className="text-sm">Select the details you want get data from</p>
          </div>
        </div>
        <FilterForm filterInputs={filterInputs} onSubmit={onFilterSubmit} />
      </Card>
      {tableData && (
        <>
          <Card>
            <CardHeader>
              <div className="flex flex-col items-start md:flex-row md:items-center justify-between">
                <div className="mb-3 md:mb-0">
                  <CardTitle>List of {prefix.title}</CardTitle>
                  <CardDescription>{prefix.description}</CardDescription>
                </div>
                <Button onClick={() => setFormModal({ show: true })}>
                  Add {prefix.singular}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable data={tableData} columns={columns} />
            </CardContent>
          </Card>
          <FormModal
            title={`Manage ${prefix.singular}`}
            description={`Make changes to the ${prefix.singular.toLocaleLowerCase()} here. Click save when you're done.`}
            form={{
              fields: inputFields,
              schema: prefix.schema,
              onSubmit: onSubmit,
            }}
          />
        </>
      )}
    </>
  );
};

export default Example;
"use client";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import VariantForm from "./VariantForm";
import type { Variant } from "@/lib/db/schema";

export function AddVariantSheet({
  productId,
  extraOptions,
}: {
  productId: string;
  extraOptions?: string[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="bg-gray-900 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-700 transition">
        + Add variant
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>Add variant</SheetTitle>
        </SheetHeader>
        <VariantForm
          productId={productId}
          extraOptions={extraOptions}
          onSuccess={() => setOpen(false)}
        />
      </SheetContent>
    </Sheet>
  );
}

export function EditVariantSheet({
  productId,
  variant,
  extraOptions,
}: {
  productId: string;
  variant: Variant;
  extraOptions?: string[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="text-xs text-blue-600 hover:underline">
        Edit
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>Edit variant</SheetTitle>
        </SheetHeader>
        <VariantForm
          productId={productId}
          initialData={variant}
          extraOptions={extraOptions}
          onSuccess={() => setOpen(false)}
        />
      </SheetContent>
    </Sheet>
  );
}

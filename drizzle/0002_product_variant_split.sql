-- Drop FK and column referencing old products table
ALTER TABLE "order_items" DROP CONSTRAINT IF EXISTS "order_items_product_id_products_product_id_fk";
ALTER TABLE "order_items" DROP COLUMN IF EXISTS "product_id";
--> statement-breakpoint

-- Clear all product data (will be reseeded)
TRUNCATE "products";
--> statement-breakpoint

-- Rename PK column product_id → id
ALTER TABLE "products" RENAME COLUMN "product_id" TO "id";
--> statement-breakpoint

-- Drop variant-specific columns that now live in the variants table
ALTER TABLE "products" DROP COLUMN IF EXISTS "parent_id";
ALTER TABLE "products" DROP COLUMN IF EXISTS "price";
ALTER TABLE "products" DROP COLUMN IF EXISTS "discount_percent";
ALTER TABLE "products" DROP COLUMN IF EXISTS "options";
--> statement-breakpoint

-- Restore unique constraint on slug (was dropped in migration 0001)
ALTER TABLE "products" ADD CONSTRAINT "products_slug_unique" UNIQUE("slug");
--> statement-breakpoint

-- Create variants table
CREATE TABLE "variants" (
  "id" text PRIMARY KEY NOT NULL,
  "product_id" text NOT NULL,
  "price" numeric(10, 2) NOT NULL,
  "discount_percent" integer DEFAULT 0,
  "image_url" text,
  "options" jsonb NOT NULL DEFAULT '{}',
  "is_default" boolean NOT NULL DEFAULT false,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint

ALTER TABLE "variants" ADD CONSTRAINT "variants_product_id_products_id_fk"
  FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint

-- Add variant_id column to order_items (table is empty after truncating products cascade)
ALTER TABLE "order_items" ADD COLUMN "variant_id" text NOT NULL DEFAULT '';
ALTER TABLE "order_items" ALTER COLUMN "variant_id" DROP DEFAULT;
--> statement-breakpoint

ALTER TABLE "order_items" ADD CONSTRAINT "order_items_variant_id_variants_id_fk"
  FOREIGN KEY ("variant_id") REFERENCES "variants"("id") ON DELETE no action ON UPDATE no action;

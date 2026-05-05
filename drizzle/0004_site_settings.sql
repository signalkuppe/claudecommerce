CREATE TABLE "site_settings" (
  "key" text PRIMARY KEY,
  "value" text,
  "updated_at" timestamp DEFAULT now()
);

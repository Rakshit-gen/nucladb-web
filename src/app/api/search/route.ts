import { createFromSource } from "fumadocs-core/search/server";
import { source } from "@/lib/source";

// The docs search dialog queries this route.
export const { GET } = createFromSource(source);

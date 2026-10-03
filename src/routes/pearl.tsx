import { createFileRoute } from "@tanstack/react-router";
import { CollectionPage } from "@/components/CollectionPage";

export const Route = createFileRoute("/pearl")({
  head: () => ({
    meta: [
      { title: "Pearl Collection — Khan Jewellers, Rajarhat" },
      {
        name: "description",
        content:
          "Natural and cultured pearl malas, earrings and rings at Khan Jewellers, Rajarhat.",
      },
      { property: "og:title", content: "Pearl Collection — Khan Jewellers" },
      {
        property: "og:description",
        content: "South Sea, Basra and freshwater pearls in Rajarhat, Kolkata.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <CollectionPage id="pearl" />,
});

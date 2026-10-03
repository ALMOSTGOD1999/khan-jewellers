import { createFileRoute } from "@tanstack/react-router";
import { CollectionPage } from "@/components/CollectionPage";

export const Route = createFileRoute("/gold")({
  head: () => ({
    meta: [
      { title: "Gold Jewellery — Khan Jewellers, Rajarhat" },
      {
        name: "description",
        content:
          "BIS hallmarked 22K and 18K bridal, temple and everyday gold jewellery at Khan Jewellers, Rajarhat.",
      },
      { property: "og:title", content: "Gold Jewellery — Khan Jewellers" },
      {
        property: "og:description",
        content: "Hallmarked bridal and everyday gold jewellery in Rajarhat, Kolkata.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <CollectionPage id="gold" />,
});

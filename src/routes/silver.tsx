import { createFileRoute } from "@tanstack/react-router";
import { CollectionPage } from "@/components/CollectionPage";

export const Route = createFileRoute("/silver")({
  head: () => ({
    meta: [
      { title: "Silver Jewellery — Khan Jewellers, Rajarhat" },
      {
        name: "description",
        content:
          "92.5 sterling, oxidised and filigree silver jewellery at Khan Jewellers, Rajarhat.",
      },
      { property: "og:title", content: "Silver Jewellery — Khan Jewellers" },
      {
        property: "og:description",
        content: "Sterling and oxidised silver jewellery in Rajarhat, Kolkata.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <CollectionPage id="silver" />,
});

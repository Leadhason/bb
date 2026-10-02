import prisma from "@/lib/prisma";
import ContactContent from "./ContactContent";

export default async function ContactPage() {
  const store = await prisma.store.findFirst({
    select: {
      youtubeUrl: true,
      instagramUrl: true,
      contactEmail: true,
    },
  });

  return (
    <ContactContent
      youtubeUrl={store?.youtubeUrl || null}
      instagramUrl={store?.instagramUrl || null}
      contactEmail={store?.contactEmail || null}
    />
  );
}

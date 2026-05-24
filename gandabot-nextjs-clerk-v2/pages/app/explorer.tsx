import type { NextPage } from "next";
import Head from "next/head";
import { AppShell } from "@/components/app/AppShell";
import { ExplorerView } from "@/components/app/views/ExplorerView";

const ExplorerPage: NextPage = () => (
  <>
    <Head>
      <title>Discover Africa · GandaBot</title>
      <meta
        name="description"
        content="Explore African cultures, languages, foods, and landmarks — real curated data for 16 countries."
      />
    </Head>
    <AppShell>
      <ExplorerView />
    </AppShell>
  </>
);

export default ExplorerPage;

import type { NextPage } from "next";
import Head from "next/head";
import { AppShell } from "@/components/app/AppShell";
import { LessonsView } from "@/components/app/views/LessonsView";

const LearnPage: NextPage = () => (
  <>
    <Head>
      <title>Learn Luganda · GandaBot</title>
      <meta name="description" content="30-lesson A1 Luganda curriculum. Learn vocabulary, grammar, and pronunciation step by step." />
    </Head>
    <AppShell>
      <LessonsView />
    </AppShell>
  </>
);

export default LearnPage;

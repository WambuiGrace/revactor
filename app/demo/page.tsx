/*
  /demo route — thin Server Component wrapper.
  All interactivity lives in DemoWorkspace ("use client").
  Keeping this file as a Server Component means Next.js can
  render the shell instantly and only ship client JS for the workspace.
*/
import type { Metadata } from 'next';
import DemoWorkspace from './DemoWorkspace';

export const metadata: Metadata = {
  title: 'Demo — revactor',
  description: 'Try the revactor AI code review workspace.',
};

export default function DemoPage() {
  return <DemoWorkspace />;
}

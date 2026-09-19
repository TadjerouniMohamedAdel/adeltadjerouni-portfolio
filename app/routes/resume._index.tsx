import { redirect } from '@remix-run/node';

export const loader = () => redirect('/resume/scalexp');

export default function ResumeIndex() {
  return null;
}

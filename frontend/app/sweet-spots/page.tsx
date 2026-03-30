// This route is superseded by /discover.
// Redirect for any old bookmarks or links.
import { redirect } from 'next/navigation';

export default function SweetSpotsPage() {
  redirect('/discover');
}

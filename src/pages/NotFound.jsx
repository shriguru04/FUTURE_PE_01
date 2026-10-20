import useDocumentMeta from '../hooks/useDocumentMeta.js';
import Button from '../components/Button.jsx';

export default function NotFound() {
  useDocumentMeta('Page not found', 'This page does not exist.');
  return (
    <div className="container-page py-24 text-center">
      <h1 className="text-display-lg">Page not found</h1>
      <p className="mx-auto mt-4 max-w-md text-lg text-muted">That address does not match any page. Try the generator or go back home.</p>
      <div className="mt-8 flex justify-center gap-3">
        <Button to="/">Go home</Button>
        <Button to="/generator" variant="secondary">Open generator</Button>
      </div>
    </div>
  );
}

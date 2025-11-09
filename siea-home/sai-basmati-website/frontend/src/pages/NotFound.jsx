import { Link } from 'react-router-dom'
export default function NotFound() {
  return (
    <div className="container tw-py-20 tw-text-center">
      <h1 className="tw-text-4xl tw-font-bold">404</h1>
      <p className="tw-text-gray-600 tw-mt-2">The page you’re looking for doesn’t exist.</p>
      <Link to="/" className="btn btn-primary tw-mt-4">Back to Home</Link>
    </div>
  )
}

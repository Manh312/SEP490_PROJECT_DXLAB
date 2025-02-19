const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-6xl font-bold">404</h1>
      <p className="text-xl mt-2">Oops! Page not found.</p>
      <a 
        href="/" 
        className="px-6 py-2 bg-orange-500 text-white rounded-lg shadow-lg"
      >
        Go Home
      </a>
    </div>
  );
}

export default NotFound;
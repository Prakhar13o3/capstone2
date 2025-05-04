function Navbar() {

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white shadow-md">
    <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
      <div className="text-xl font-bold">MyApp</div>
      <ul className="flex space-x-6">
        <li><a href="#" className="hover:text-blue-600">Home</a></li>
        <li><a href="#" className="hover:text-blue-600">About</a></li>
        <li><a href="#" className="hover:text-blue-600">Contact</a></li>
      </ul>
    </div>
  </nav>

  )
}

export default Navbar
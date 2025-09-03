import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import UserDefPage from "./pages/UserDefPage";
import { Toaster } from "./components/ui/sonner";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink
} from "./components/ui/navigation-menu";

// Layout component với header chính
function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col w-full bg-gray-50">
      {/* Header chính ở trên cùng */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg sticky top-0 z-10 w-full">
        <div className="w-full px-6 flex items-center justify-between h-16">
          <h1 className="text-2xl font-bold text-white">
            User Definition Manager
          </h1>
          
          <NavigationMenu>
            <NavigationMenuList className="flex gap-2">
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link 
                    to="/" 
                    className="px-4 py-2 rounded-lg transition-all hover:bg-white/20 text-white no-underline font-medium"
                  >
                    Trang chủ
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link 
                    to="/about"
                    className="px-4 py-2 rounded-lg transition-all hover:bg-white/20 text-white no-underline font-medium"
                  >
                    Giới thiệu
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </header>
      
      {/* Nội dung chính */}
      <main className="flex-1 w-full px-4 py-3">
        {children}
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="w-full">
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/userdef" element={<UserDefPage />} />
          </Routes>
        </Layout>
        <Toaster />
      </div>
    </Router>
  );
}

export default App;

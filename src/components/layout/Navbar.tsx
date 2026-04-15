import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { FlashLogo } from "@/components/FlashLogo";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

interface NavbarProps {
  minimal?: boolean;
}

export function Navbar({ minimal }: NavbarProps) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/");
  };

  if (minimal) {
    return (
      <div className="flex items-center gap-3">
        <ThemeToggle />
        {!loading && user && (
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="transition-transform duration-200 hover:scale-[1.02]">
          <FlashLogo />
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {!loading && (
            <>
              {user ? (
                <>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/dashboard">Dashboard</Link>
                  </Button>
                  <Button variant="ghost" size="icon" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/login">Log in</Link>
                  </Button>
                  <Button size="sm" className="gradient-primary rounded-full" asChild>
                    <Link to="/signup">Sign up</Link>
                  </Button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

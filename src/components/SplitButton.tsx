import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SplitButtonProps {
  label: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  dropdownItems: { label: string; icon?: React.ReactNode; onClick: () => void }[];
}

export function SplitButton({
  label,
  onClick,
  disabled,
  className,
  dropdownItems,
}: SplitButtonProps) {
  return (
    <div className={cn("flex", className)}>
      <Button
        onClick={onClick}
        disabled={disabled}
        className="rounded-r-none flex-1"
        size="lg"
      >
        {label}
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            disabled={disabled}
            className="rounded-l-none border-l border-primary-foreground/20 px-2"
            size="lg"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {dropdownItems.map((item) => (
            <DropdownMenuItem key={item.label} onClick={item.onClick}>
              {item.icon && <span className="mr-2">{item.icon}</span>}
              {item.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
